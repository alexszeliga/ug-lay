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
  if (node.direction === 'horizontal') {
    el.style.gridTemplateColumns = `${r * 100}% ${(1 - r) * 100}%`;
    el.style.gridTemplateRows = '100%';
  } else {
    el.style.gridTemplateRows = `${r * 100}% ${(1 - r) * 100}%`;
    el.style.gridTemplateColumns = '100%';
  }

  el.appendChild(renderNode(node.children[0]));
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
