import { LayoutEngine, LayoutNode, Direction, TileNode } from '@ug-layout/core';
import { SandboxState } from './logic';
import { SANDBOX_CONFIG } from './config';

const engine = new LayoutEngine();
const sandbox = new SandboxState(engine);
sandbox.dragHandleSelector = SANDBOX_CONFIG.dragHandleSelector;

// --- Registry ---
const REGISTRY: Record<string, { name: string; color: string }> = {
  'analytics': { name: 'Analytics', color: '#ff4d4d' },
  'feed': { name: 'Live Feed', color: '#4dff4d' },
  'chat': { name: 'Chat', color: '#4d4dff' },
  'inspector': { name: 'Inspector', color: '#ffff4d' },
};

// --- Initial Setup ---
const rootId = engine.getState().root.id;
engine.split(rootId, 'horizontal');
const state = engine.getState();
const leftId = (state.root as any).children[0].id;
engine.updateTile(leftId, { contentId: SANDBOX_CONFIG.defaultContentId });
// --------------------

function renderPicker(tileId: string): string {
  return `
    <div class="picker">
      <div style="grid-column: 1 / -1; margin-bottom: 10px; text-align: center;">Select a Component</div>
      ${Object.entries(REGISTRY).map(([id, info]) => `
        <button class="picker-btn" data-action="select" data-tile-id="${tileId}" data-content-id="${id}">
          ${info.name}
        </button>
      `).join('')}
      <button class="picker-btn" style="grid-column: 1 / -1; background: #222;" data-action="maximize" data-id="${tileId}">
        Maximize Picker
      </button>
    </div>
  `;
}

function renderTileContent(node: TileNode): string {
  if (!node.contentId) return renderPicker(node.id);
  const info = REGISTRY[node.contentId];
  return `
    <div class="dummy-component" style="background: ${info?.color || '#444'}22; border: 1px solid ${info?.color || '#444'}">
      <span style="color: ${info?.color || '#fff'}">${info?.name || 'Unknown'}</span>
    </div>
  `;
}

function renderNode(node: LayoutNode, isRoot: boolean = false): HTMLElement {
  if (node.type === 'tile') {
    const el = document.createElement('div');
    el.className = 'ug-tile';
    el.dataset.tileId = node.id;
    if (node.id === sandbox.focusedTileId) el.classList.add('focused');
    if (isRoot) el.classList.add('is-root');

    const componentInfo = node.contentId ? REGISTRY[node.contentId] : null;

    el.innerHTML = `
      <div class="ug-tile-header" draggable="true">
        <span style="opacity: 0.5;">${node.id.substring(0, 8)}</span>
        <span class="ug-tile-title">${componentInfo?.name || ''}</span>
        <div class="ug-controls">
          <button class="ug-btn" data-action="maximize" data-id="${node.id}" title="Maximize">${SANDBOX_CONFIG.icons.maximize}</button>
          <button class="ug-btn" data-action="split" data-id="${node.id}" data-direction="horizontal" title="Split Horizontal">${SANDBOX_CONFIG.icons.splitH}</button>
          <button class="ug-btn" data-action="split" data-id="${node.id}" data-direction="vertical" title="Split Vertical">${SANDBOX_CONFIG.icons.splitV}</button>
          <button class="ug-btn" data-action="remove" data-id="${node.id}" style="color: ${SANDBOX_CONFIG.colors.remove};" title="Remove">${SANDBOX_CONFIG.icons.remove}</button>
        </div>
      </div>
      <div class="ug-tile-content">
        ${renderTileContent(node)}
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

  const gSize = SANDBOX_CONFIG.gutterSize;
  if (node.direction === 'horizontal') {
    el.style.gridTemplateColumns = `calc(${r * 100}% - ${gSize/2}px) ${gSize}px 1fr`;
    el.style.gridTemplateRows = '100%';
  } else {
    el.style.gridTemplateRows = `calc(${r * 100}% - ${gSize/2}px) ${gSize}px 1fr`;
    el.style.gridTemplateColumns = '100%';
  }

  el.appendChild(renderNode(node.children[0]));
  el.appendChild(gutter);
  el.appendChild(renderNode(node.children[1]));
  return el;
}

function updateDOM() {
  const state = engine.getState();
  const app = document.getElementById('app');
  const overlay = document.getElementById('maximized-overlay');
  const overlayContent = document.getElementById('maximized-content');

  if (state.maximizedTileId) {
    overlay?.classList.add('active');
    const maximizedNode = findNode(state.root, state.maximizedTileId) as TileNode;
    if (maximizedNode && overlayContent) overlayContent.innerHTML = renderTileContent(maximizedNode);
  } else {
    overlay?.classList.remove('active');
  }

  if (app) {
    app.innerHTML = '';
    app.appendChild(renderNode(state.root, true));
  }
}

function findNode(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) return node;
  if (node.type === 'split') {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}

// --- Event Handling ---
document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const btn = target.closest('button');
  if (!btn) {
    const tile = target.closest('.ug-tile') as HTMLElement;
    if (tile?.dataset.tileId) {
      sandbox.focusedTileId = tile.dataset.tileId;
      updateDOM();
    }
    return;
  }

  const { action, id, tileId, contentId, direction } = btn.dataset;
  if (action === 'select' && tileId && contentId) engine.updateTile(tileId, { contentId });
  else if (action === 'maximize' && id) engine.maximizeTile(id);
  else if (action === 'split' && id && direction) engine.split(id, direction as Direction);
  else if (action === 'remove' && id) engine.removeTile(id);
});

document.getElementById('close-maximize')?.addEventListener('click', () => engine.minimize());

let dragResizeState: { splitId: string; direction: Direction; rect: DOMRect } | null = null;
document.body.addEventListener('mousedown', (e) => {
  const t = e.target as HTMLElement;
  sandbox.lastMouseDownTarget = t;
  if (t.matches('.ug-gutter')) {
    e.preventDefault();
    dragResizeState = { splitId: t.dataset.splitId!, direction: t.dataset.direction as any, rect: t.parentElement!.getBoundingClientRect() };
    document.body.classList.add('dragging');
  }
});
document.body.addEventListener('mousemove', (e) => {
  if (!dragResizeState) return;
  const { splitId, direction, rect } = dragResizeState;
  const gSize = SANDBOX_CONFIG.gutterSize;
  let r = direction === 'horizontal' ? (e.clientX - rect.left - gSize/2) / (rect.width - gSize) : (e.clientY - rect.top - gSize/2) / (rect.height - gSize);
  engine.setRatio(splitId, r);
});
document.body.addEventListener('mouseup', () => { dragResizeState = null; document.body.classList.remove('dragging'); });

document.body.addEventListener('dragstart', (e) => {
  if (!sandbox.canStartDrag(e.target as any)) { e.preventDefault(); return; }
  const tile = (e.target as HTMLElement).closest('.ug-tile') as HTMLElement;
  if (tile) { sandbox.draggedTileId = tile.dataset.tileId!; e.dataTransfer?.setData('text/plain', sandbox.draggedTileId); }
});
document.body.addEventListener('dragover', (e) => {
  e.preventDefault();
  const tile = (e.target as HTMLElement).closest('.ug-tile') as HTMLElement;
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
  if (tile && tile.dataset.tileId !== sandbox.draggedTileId) tile.classList.add('drag-over');
});
document.body.addEventListener('drop', (e) => {
  e.preventDefault();
  const tile = (e.target as HTMLElement).closest('.ug-tile') as HTMLElement;
  if (tile) sandbox.handleDrop(tile.dataset.tileId!);
  document.querySelectorAll('.ug-tile').forEach(el => el.classList.remove('drag-over'));
});

engine.subscribe(updateDOM);
updateDOM();
