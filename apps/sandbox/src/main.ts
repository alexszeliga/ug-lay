import { LayoutEngine, LayoutNode, Direction } from '@ug-layout/core';

const engine = new LayoutEngine();

// --- Initial Setup ---
const rootId = engine.getState().root.id;
engine.split(rootId, 'horizontal');
const leftChildId = (engine.getState().root as any).children[0].id;
const rightChildId = (engine.getState().root as any).children[1].id;
engine.split(leftChildId, 'vertical');
engine.updateTile(rightChildId, { contentId: 'Sidebar' });
// --------------------


function renderNode(node: LayoutNode): HTMLElement {
  if (node.type === 'tile') {
    const el = document.createElement('div');
    el.className = 'ug-tile';
    el.innerHTML = `
      <div>
        <strong>Tile</strong><br/>
        <small>${node.id.substring(0, 8)}</small><br/>
        ${node.contentId ? `<span>[${node.contentId}]</span>` : ''}
        <button data-action="split" data-id="${node.id}" data-direction="horizontal">Split H</button>
        <button data-action="split" data-id="${node.id}" data-direction="vertical">Split V</button>
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
    app.appendChild(renderNode(state.root));
  }
}

// --- Dragging Logic ---
let dragState: {
  splitId: string;
  direction: Direction;
  startPos: number;
  el: HTMLElement;
} | null = null;

document.body.addEventListener('mousedown', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.ug-gutter')) {
    event.preventDefault();
    dragState = {
      splitId: target.dataset.splitId!,
      direction: target.dataset.direction! as Direction,
      startPos:
        target.dataset.direction === 'horizontal'
          ? event.clientX
          : event.clientY,
      el: target.parentElement!,
    };
    document.body.classList.add('dragging');
  }
});

document.body.addEventListener('mousemove', (event) => {
  if (!dragState) return;
  const { splitId, direction, startPos, el } = dragState;

  const currentPos = direction === 'horizontal' ? event.clientX : event.clientY;
  const delta = currentPos - startPos;
  
  const rect = el.getBoundingClientRect();
  const totalSize = direction === 'horizontal' ? rect.width : rect.height;

  // Find the current ratio
  const currentNode = findNode(engine.getState().root, splitId) as any;
  if (!currentNode) return;
  
  const currentRatioInPixels = totalSize * currentNode.ratio;
  const newRatioInPixels = currentRatioInPixels + delta;
  let newRatio = newRatioInPixels / totalSize;

  // Clamp ratio
  newRatio = Math.max(0.05, Math.min(0.95, newRatio));

  engine.setRatio(splitId, newRatio);
});

document.body.addEventListener('mouseup', () => {
  dragState = null;
  document.body.classList.remove('dragging');
});


// Helper to find a node in the tree
function findNode(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) return node;
  if (node.type === 'split') {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}

// Attach event listeners to the body, using event delegation
document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLButtonElement;
  if (target.matches('button[data-action="split"]')) {
    const id = target.dataset.id!;
    const direction = target.dataset.direction! as Direction;
    engine.split(id, direction); // The subscribe method will trigger the re-render
  }
});

// --- Reactivity ---
engine.subscribe(() => {
  console.log('State updated, re-rendering...');
  updateDOM();
});

// --- Initial Render ---
updateDOM();
