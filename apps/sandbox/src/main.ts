import { LayoutEngine, LayoutNode, Direction } from '@ug-layout/core';
import { SandboxState } from './logic';

const engine = new LayoutEngine();
const sandbox = new SandboxState(engine);
sandbox.dragHandleSelector = '.ug-tile-header'; // Set the configurable handle

// --- Initial Setup ---
const rootId = engine.getState().root.id;
engine.split(rootId, 'horizontal');
const leftChildId = (engine.getState().root as any).children[0].id;
const rightChildId = (engine.getState().root as any).children[1].id;
engine.split(leftChildId, 'vertical');
engine.updateTile(leftChildId, { contentId: 'Left Top' });
engine.updateTile(rightChildId, { contentId: 'Sidebar' });
// --------------------

const ICON_SPLIT_H = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12H3m9-9v18"/></svg>`;
const ICON_SPLIT_V = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>`;
const ICON_REMOVE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

function renderNode(node: LayoutNode, isRoot: boolean = false): HTMLElement {
  if (node.type === 'tile') {
    const el = document.createElement('div');
    el.className = 'ug-tile';
    el.draggable = true;
    el.dataset.tileId = node.id;
    if (node.id === sandbox.focusedTileId) {
      el.classList.add('focused');
    }
    if (isRoot) {
      el.classList.add('is-root');
    }
    el.innerHTML = `
      <div class="ug-tile-header">
        <span>${node.id.substring(0, 8)}</span>
        <div class="ug-controls">
          <button class="ug-btn" data-action="split" data-id="${node.id}" data-direction="horizontal" title="Split Horizontal">${ICON_SPLIT_H}</button>
          <button class="ug-btn" data-action="split" data-id="${node.id}" data-direction="vertical" title="Split Vertical">${ICON_SPLIT_V}</button>
          <button class="ug-btn" data-action="remove" data-id="${node.id}" style="color: #ff4d4d;" title="Remove">${ICON_REMOVE}</button>
        </div>
      </div>
      <div class="ug-tile-content">
        ${node.contentId ? `<span>[${node.contentId}]</span>` : 'Empty Tile'}
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
    app.innerHTML = '';
    const state = engine.getState();
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
  
  // Only focus if clicking on the tile or header, but NOT on buttons
  if (!target.closest('.ug-btn')) {
    const tileElement = target.closest('.ug-tile');
    if (tileElement instanceof HTMLElement && tileElement.dataset.tileId) {
      sandbox.focusedTileId = tileElement.dataset.tileId;
      updateDOM();
    }
  }

  const btn = target.closest('.ug-btn');
  if (btn instanceof HTMLButtonElement) {
    const { action, id, direction } = btn.dataset;
    if (action === 'split' && id && direction) {
      engine.split(id, direction as Direction);
    } else if (action === 'remove' && id) {
      engine.removeTile(id);
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (!sandbox.focusedTileId) return;
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault();
    engine.split(sandbox.focusedTileId, 'horizontal');
  }
  if (event.ctrlKey && event.key === 'v') {
    event.preventDefault();
    engine.split(sandbox.focusedTileId, 'vertical');
  }
  if (event.ctrlKey && event.key === 'x') {
    event.preventDefault();
    engine.removeTile(sandbox.focusedTileId);
    const state = engine.getState();
    sandbox.focusedTileId = state.root.type === 'tile' ? state.root.id : (state.root as any).children[0].id;
  }
});

// --- Drag-to-Swap Logic ---
document.body.addEventListener('dragstart', (event) => {
  const target = event.target as HTMLElement;
  
  // VERIFY: Use the new canStartDrag logic
  if (!sandbox.canStartDrag(target)) {
    event.preventDefault();
    return;
  }

  const tile = target.closest('.ug-tile') as HTMLElement;
  if (tile) {
    sandbox.draggedTileId = tile.dataset.tileId!;
    event.dataTransfer?.setData('text/plain', sandbox.draggedTileId);
  }
});

document.body.addEventListener('dragover', (event) => {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const tile = target.closest('.ug-tile') as HTMLElement;
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
  if (tile && tile.dataset.tileId !== sandbox.draggedTileId) {
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
  if (tile && tile.dataset.tileId) {
    sandbox.handleDrop(tile.dataset.tileId);
  }
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
});


// --- Reactivity ---
engine.subscribe(() => {
  updateDOM();
});

// --- Initial Render ---
updateDOM();
