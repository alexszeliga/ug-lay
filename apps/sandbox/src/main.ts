import { LayoutEngine, LayoutNode, Direction } from '@ug-layout/core';

// --- State Management ---
let focusedTileId: string | null = null;
let draggedTileId: string | null = null;
const engine = new LayoutEngine();

// --- Initial Setup ---
const rootId = engine.getState().root.id;
focusedTileId = rootId; // Focus the root tile initially
engine.split(rootId, 'horizontal');
const leftChildId = (engine.getState().root as any).children[0].id;
const rightChildId = (engine.getState().root as any).children[1].id;
engine.split(leftChildId, 'vertical');
engine.updateTile(leftChildId, { contentId: 'Left Top' });
engine.updateTile(rightChildId, { contentId: 'Sidebar' });
// --------------------


function renderNode(node: LayoutNode, isRoot: boolean = false): HTMLElement {
  if (node.type === 'tile') {
    const el = document.createElement('div');
    el.className = 'ug-tile';
    el.draggable = true;
    el.dataset.tileId = node.id;
    if (node.id === focusedTileId) {
      el.classList.add('focused');
    }
    if (isRoot) {
      el.classList.add('is-root');
    }
    el.innerHTML = `
      <div>
        <strong>Tile</strong><br/>
        <small>${node.id.substring(0, 8)}</small><br/>
        ${node.contentId ? `<span>[${node.contentId}]</span>` : ''}
        <button data-action="split" data-id="${node.id}" data-direction="horizontal">Split H</button>
        <button data-action="split" data-id="${node.id}" data-direction="vertical">Split V</button>
        <button data-action="remove" data-id="${node.id}" style="color: red;">Remove</button>
      </div>
    `;
    return el;
  }

  const el = document.createElement('div');
  el.className = 'ug-split';
  
  const r = node.ratio;
  const gutter = document.createElement('div');
  gutter.className = 'ug-gutter';
  gutter.dataset.splitId = node.id;
  gutter.dataset.direction = node.direction;

  if (node.direction === 'horizontal') {
    el.style.gridTemplateColumns = `calc(${r * 100}% - 2px) 4px 1fr`;
    el.style.gridTemplateRows = '100%';
  } else {
    el.style.gridTemplateRows = `calc(${r * 100}% - 2px) 4px 1fr`;
    el.style.gridTemplateColumns = '100%';
  }

  el.appendChild(renderNode(node.children[0]));
  el.appendChild(gutter);
  el.appendChild(renderNode(node.children[1]));

  return el;
}

function updateDOM() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = ''; // Clear existing DOM
    const state = engine.getState(); // Get latest state
    app.appendChild(renderNode(state.root, true));
  }
}

// --- Drag-to-Resize Logic ---
let dragState: {
  splitId: string;
  direction: Direction;
  rect: DOMRect;
} | null = null;

document.body.addEventListener('mousedown', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.ug-gutter')) {
    event.preventDefault();
    dragState = {
      splitId: target.dataset.splitId!,
      direction: target.dataset.direction! as Direction,
      rect: target.parentElement!.getBoundingClientRect(),
    };
    document.body.classList.add('dragging');
    document.body.style.cursor = target.dataset.direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
  }
});

document.body.addEventListener('mousemove', (event) => {
  if (!dragState) return;
  const { splitId, direction, rect } = dragState;
  const gutterSize = 4;
  let newRatio;
  if (direction === 'horizontal') {
    newRatio = (event.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize);
  } else {
    newRatio = (event.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
  }
  newRatio = Math.max(0.05, Math.min(0.95, newRatio));
  engine.setRatio(splitId, newRatio);
});

document.body.addEventListener('mouseup', () => {
  dragState = null;
  document.body.classList.remove('dragging');
  document.body.style.cursor = '';
});


// --- Input Handling ---
document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const tileElement = target.closest('.ug-tile');
  if (tileElement instanceof HTMLElement && tileElement.dataset.tileId) {
    focusedTileId = tileElement.dataset.tileId;
    updateDOM();
  }
  if (target instanceof HTMLButtonElement) {
    const { action, id, direction } = target.dataset;
    if (action === 'split' && id && direction) {
      engine.split(id, direction as Direction);
    } else if (action === 'remove' && id) {
      engine.removeTile(id);
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (!focusedTileId) return;
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault();
    engine.split(focusedTileId, 'horizontal');
  }
  if (event.ctrlKey && event.key === 'v') {
    event.preventDefault();
    engine.split(focusedTileId, 'vertical');
  }
  if (event.ctrlKey && event.key === 'x') {
    event.preventDefault();
    engine.removeTile(focusedTileId);
    const state = engine.getState();
    focusedTileId = state.root.type === 'tile' ? state.root.id : (state.root as any).children[0].id;
  }
});

// --- Drag-to-Swap Logic ---
document.body.addEventListener('dragstart', (event) => {
  const target = event.target as HTMLElement;
  const tile = target.closest('.ug-tile') as HTMLElement;
  if (tile) {
    draggedTileId = tile.dataset.tileId!;
    event.dataTransfer?.setData('text/plain', draggedTileId);
  }
});

document.body.addEventListener('dragover', (event) => {
  event.preventDefault(); // Required to allow drop
  const target = event.target as HTMLElement;
  const tile = target.closest('.ug-tile') as HTMLElement;
  
  // Clear other highlights
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
  
  if (tile && tile.dataset.tileId !== draggedTileId) {
    tile.classList.add('drag-over');
  }
});

document.body.addEventListener('dragleave', (event) => {
  const target = event.target as HTMLElement;
  const tile = target.closest('.ug-tile') as HTMLElement;
  if (tile) {
    tile.classList.remove('drag-over');
  }
});

document.body.addEventListener('drop', (event) => {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const tile = target.closest('.ug-tile') as HTMLElement;
  
  if (tile && draggedTileId && tile.dataset.tileId !== draggedTileId) {
    const targetId = tile.dataset.tileId!;
    engine.swapTiles(draggedTileId, targetId);
    focusedTileId = targetId; // Set focus to the dropped-onto tile
  }
  
  draggedTileId = null;
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
});


// --- Reactivity ---
engine.subscribe(() => {
  updateDOM();
});

// --- Initial Render ---
updateDOM();
