// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/rng.js
import { randomFillSync } from "crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/native.js
import { randomUUID } from "crypto";
var native_default = { randomUUID };

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/v4.js
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  return _v4(options, buf, offset);
}
var v4_default = v4;

// src/geometry.ts
function normalizeCoordinates(rect, clientX, clientY) {
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  return { x, y };
}
function calculateRatio(rect, clientX, clientY, direction, gutterSize = 4) {
  if (direction === "horizontal") {
    const totalWidth = rect.width - gutterSize;
    return (clientX - rect.left - gutterSize / 2) / totalWidth;
  } else {
    const totalHeight = rect.height - gutterSize;
    return (clientY - rect.top - gutterSize / 2) / totalHeight;
  }
}

// src/tree-utils.ts
function getDropAction(rect, mouseX, mouseY) {
  const threshold = 0.25;
  const { x, y } = normalizeCoordinates(rect, mouseX, mouseY);
  if (x < threshold) return { type: "split", direction: "horizontal", side: "before" };
  if (x > 1 - threshold) return { type: "split", direction: "horizontal", side: "after" };
  if (y < threshold) return { type: "split", direction: "vertical", side: "before" };
  if (y > 1 - threshold) return { type: "split", direction: "vertical", side: "after" };
  return { type: "swap" };
}
function findNode(node, id) {
  if (node.id === id) return node;
  if (node.type === "split") {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}
function recursiveUpdate(node, id, updates, expectedType) {
  if (node.id === id) {
    if (expectedType && node.type !== expectedType) return node;
    return { ...node, ...updates };
  }
  if (node.type === "split") {
    return {
      ...node,
      children: [
        recursiveUpdate(node.children[0], id, updates, expectedType),
        recursiveUpdate(node.children[1], id, updates, expectedType)
      ]
    };
  }
  return node;
}
function recursiveRemove(node, tileId) {
  if (node.type === "tile") return node;
  const childA = node.children[0];
  const childB = node.children[1];
  if (childA.id === tileId) return childB;
  if (childB.id === tileId) return childA;
  return {
    ...node,
    children: [
      recursiveRemove(childA, tileId),
      recursiveRemove(childB, tileId)
    ]
  };
}
function recursiveSplit(node, tileId, direction, defaultRatio) {
  if (node.type === "tile") {
    if (node.id === tileId) {
      return {
        id: v4_default(),
        type: "split",
        direction,
        ratio: defaultRatio,
        children: [
          {
            id: v4_default(),
            type: "tile",
            contentId: node.contentId,
            metadata: node.metadata ? { ...node.metadata } : void 0
          },
          { id: v4_default(), type: "tile" }
        ]
      };
    }
    return node;
  }
  return {
    ...node,
    children: [
      recursiveSplit(node.children[0], tileId, direction, defaultRatio),
      recursiveSplit(node.children[1], tileId, direction, defaultRatio)
    ]
  };
}
function recursiveSwap(node, idA, idB, dataA, dataB) {
  if (node.id === idA) return { ...dataB };
  if (node.id === idB) return { ...dataA };
  if (node.type === "split") {
    return {
      ...node,
      children: [
        recursiveSwap(node.children[0], idA, idB, dataA, dataB),
        recursiveSwap(node.children[1], idA, idB, dataA, dataB)
      ]
    };
  }
  return node;
}
function recursiveMove(root, sourceId, targetId, direction, side, defaultRatio) {
  const sourceNode = findNode(root, sourceId);
  if (!sourceNode) return root;
  let newRoot = recursiveRemove(root, sourceId);
  const insertInSplit = (node) => {
    if (node.id === targetId) {
      const newNode = {
        id: v4_default(),
        type: "split",
        direction,
        ratio: defaultRatio,
        children: side === "before" ? [{ ...sourceNode }, node] : [node, { ...sourceNode }]
      };
      return newNode;
    }
    if (node.type === "split") {
      return {
        ...node,
        children: [
          insertInSplit(node.children[0]),
          insertInSplit(node.children[1])
        ]
      };
    }
    return node;
  };
  return insertInSplit(newRoot);
}

// src/adapters/LocalStorageAdapter.ts
var LocalStorageAdapter = class {
  key;
  constructor(key) {
    this.key = `ug-layout:${key}`;
  }
  async save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save layout to LocalStorage", e);
    }
  }
  async load() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load layout from LocalStorage", e);
      return null;
    }
  }
};

// src/adapters/HttpPersistenceAdapter.ts
var HttpPersistenceAdapter = class {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }
  async save(state) {
    const response = await fetch(this.url, {
      ...this.options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.options.headers || {}
      },
      body: JSON.stringify(state)
    });
    if (!response.ok) {
      throw new Error(`Failed to save layout: ${response.statusText}`);
    }
  }
  async load() {
    const response = await fetch(this.url, {
      ...this.options,
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...this.options.headers || {}
      }
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to load layout: ${response.statusText}`);
    }
    return response.json();
  }
};

// src/index.ts
var DEFAULT_CONFIG = {
  minRatio: 0.05,
  maxRatio: 0.95,
  defaultSplitRatio: 0.5,
  saveDebounceMs: 500
};
var LayoutEngine = class {
  state;
  subscribers = [];
  config;
  saveTimer = null;
  constructor(initialState, config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = initialState || {
      root: {
        id: v4_default(),
        type: "tile"
      },
      maximizedTileId: null
    };
  }
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }
  notify() {
    this.state = { ...this.state };
    this.subscribers.forEach((sub) => sub(this.state));
    this.queueSave();
  }
  queueSave() {
    if (!this.config.persistence) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    const delay = this.config.saveDebounceMs ?? 500;
    if (delay === 0) {
      this.config.persistence.save(this.state);
    } else {
      this.saveTimer = setTimeout(() => {
        this.config.persistence?.save(this.state);
        this.saveTimer = null;
      }, delay);
    }
  }
  getState() {
    return this.state;
  }
  maximizeTile(tileId) {
    this.state.maximizedTileId = tileId;
    this.notify();
  }
  minimize() {
    this.state.maximizedTileId = null;
    this.notify();
  }
  setRatio(splitId, ratio) {
    const clampedRatio = Math.max(
      this.config.minRatio,
      Math.min(this.config.maxRatio, ratio)
    );
    this.state.root = recursiveUpdate(
      this.state.root,
      splitId,
      { ratio: clampedRatio },
      "split"
    );
    this.notify();
  }
  updateTile(tileId, updates) {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      updates,
      "tile"
    );
    this.notify();
  }
  resetTile(tileId) {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { contentId: void 0, metadata: void 0, tabs: void 0, activeTabIndex: void 0 },
      "tile"
    );
    this.notify();
  }
  selectTab(tileId, index) {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { activeTabIndex: index },
      "tile"
    );
    this.notify();
  }
  addTab(tileId, contentId, metadata) {
    const node = findNode(this.state.root, tileId);
    if (!node || node.type !== "tile") return;
    const newTab = { id: v4_default(), contentId, metadata };
    let tabs = node.tabs ? [...node.tabs, newTab] : [];
    if (!node.tabs && node.contentId) {
      tabs = [
        { id: v4_default(), contentId: node.contentId, metadata: node.metadata },
        newTab
      ];
    } else if (!node.tabs) {
      tabs = [newTab];
    }
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      {
        tabs,
        activeTabIndex: tabs.length - 1,
        // Clear legacy single-content fields when moving to tabs
        contentId: void 0,
        metadata: void 0
      },
      "tile"
    );
    this.notify();
  }
  removeTab(tileId, tabId) {
    const node = findNode(this.state.root, tileId);
    if (!node || !node.tabs) return;
    const newTabs = node.tabs.filter((t) => t.id !== tabId);
    if (newTabs.length === 0) {
      this.resetTile(tileId);
      return;
    }
    let activeIndex = node.activeTabIndex ?? 0;
    if (activeIndex >= newTabs.length) {
      activeIndex = newTabs.length - 1;
    }
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { tabs: newTabs, activeTabIndex: activeIndex },
      "tile"
    );
    this.notify();
  }
  removeTile(tileId) {
    if (this.state.root.id === tileId && this.state.root.type === "tile") return;
    this.state.root = recursiveRemove(this.state.root, tileId);
    this.notify();
  }
  swapTiles(sourceId, targetId) {
    const sourceNode = findNode(this.state.root, sourceId);
    const targetNode = findNode(this.state.root, targetId);
    if (!sourceNode || !targetNode || sourceNode.type !== "tile" || targetNode.type !== "tile") return;
    const sourceData = { ...sourceNode };
    const targetData = { ...targetNode };
    this.state.root = recursiveSwap(
      this.state.root,
      sourceId,
      targetId,
      sourceData,
      targetData
    );
    this.notify();
  }
  split(tileId, direction) {
    this.state.root = recursiveSplit(
      this.state.root,
      tileId,
      direction,
      this.config.defaultSplitRatio
    );
    this.notify();
  }
  moveTile(sourceId, targetId, direction, side) {
    if (sourceId === targetId) return;
    this.state.root = recursiveMove(
      this.state.root,
      sourceId,
      targetId,
      direction,
      side,
      this.config.defaultSplitRatio
    );
    this.notify();
  }
};
export {
  HttpPersistenceAdapter,
  LayoutEngine,
  LocalStorageAdapter,
  calculateRatio,
  findNode,
  getDropAction,
  normalizeCoordinates
};
