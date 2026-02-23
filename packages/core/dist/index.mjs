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

// src/tree-utils.ts
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

// src/index.ts
var DEFAULT_CONFIG = {
  minRatio: 0.05,
  maxRatio: 0.95,
  defaultSplitRatio: 0.5
};
var LayoutEngine = class {
  state;
  subscribers = [];
  config;
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
  removeTile(tileId) {
    if (this.state.root.id === tileId && this.state.root.type === "tile") {
      return;
    }
    this.state.root = recursiveRemove(this.state.root, tileId);
    this.notify();
  }
  swapTiles(sourceId, targetId) {
    const sourceNode = findNode(this.state.root, sourceId);
    const targetNode = findNode(this.state.root, targetId);
    if (!sourceNode || !targetNode || sourceNode.type !== "tile" || targetNode.type !== "tile")
      return;
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
};
export {
  LayoutEngine,
  findNode
};
