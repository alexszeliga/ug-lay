import { LayoutEngine, LayoutNode } from '@ug-layout/core';

const engine = new LayoutEngine();

// Create a slightly complex initial layout to see the renderer in action
const rootId = engine.getState().root.id;
engine.split(rootId, 'horizontal');

const state = engine.getState();
const leftChildId = (state.root as any).children[0].id;
const rightChildId = (state.root as any).children[1].id;

engine.split(leftChildId, 'vertical');
engine.updateTile(rightChildId, { contentId: 'Sidebar' });

function renderNode(node: LayoutNode): HTMLElement {
  if (node.type === 'tile') {
    const el = document.createElement('div');
    el.className = 'ug-tile';
    el.innerHTML = `
      <div>
        <strong>Tile</strong><br/>
        <small>${node.id.substring(0, 8)}</small><br/>
        ${node.contentId ? `<span>[${node.contentId}]</span>` : ''}
      </div>
    `;
    return el;
  }

  const el = document.createElement('div');
  el.className = 'ug-split';
  
  const r = node.ratio;
  if (node.direction === 'horizontal') {
    el.style.gridTemplateColumns = `${r * 100}% ${ (1 - r) * 100}%`;
    el.style.gridTemplateRows = '100%';
  } else {
    el.style.gridTemplateRows = `${r * 100}% ${ (1 - r) * 100}%`;
    el.style.gridTemplateColumns = '100%';
  }

  el.appendChild(renderNode(node.children[0]));
  el.appendChild(renderNode(node.children[1]));

  return el;
}

const app = document.getElementById('app');
if (app) {
  app.appendChild(renderNode(engine.getState().root));
}
