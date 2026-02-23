"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  LayoutEngine: () => LayoutEngine
});
module.exports = __toCommonJS(index_exports);

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/rng.js
var import_node_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_node_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/.pnpm/uuid@13.0.0/node_modules/uuid/dist-node/native.js
var import_node_crypto2 = require("crypto");
var native_default = { randomUUID: import_node_crypto2.randomUUID };

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

// src/index.ts
var LayoutEngine = class {
  state;
  constructor(initialState) {
    this.state = initialState || {
      root: {
        id: v4_default(),
        type: "tile"
      }
    };
  }
  getState() {
    return this.state;
  }
  setRatio(splitId, ratio) {
    this.state.root = this.recursiveUpdate(this.state.root, splitId, { ratio }, "split");
  }
  updateTile(tileId, updates) {
    this.state.root = this.recursiveUpdate(this.state.root, tileId, updates, "tile");
  }
  split(tileId, direction) {
    this.state.root = this.recursiveSplit(this.state.root, tileId, direction);
  }
  recursiveUpdate(node, id, updates, expectedType) {
    if (node.id === id) {
      if (expectedType && node.type !== expectedType) {
        return node;
      }
      return { ...node, ...updates };
    }
    if (node.type === "split") {
      return {
        ...node,
        children: [
          this.recursiveUpdate(node.children[0], id, updates, expectedType),
          this.recursiveUpdate(node.children[1], id, updates, expectedType)
        ]
      };
    }
    return node;
  }
  recursiveSplit(node, tileId, direction) {
    if (node.type === "tile") {
      if (node.id === tileId) {
        return {
          id: v4_default(),
          type: "split",
          direction,
          ratio: 0.5,
          children: [
            { id: v4_default(), type: "tile" },
            { id: v4_default(), type: "tile" }
          ]
        };
      }
      return node;
    }
    return {
      ...node,
      children: [
        this.recursiveSplit(node.children[0], tileId, direction),
        this.recursiveSplit(node.children[1], tileId, direction)
      ]
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LayoutEngine
});
