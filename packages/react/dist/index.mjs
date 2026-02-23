// src/context.tsx
import { createContext, useContext, useMemo, useSyncExternalStore, useState } from "react";
import { jsx } from "react/jsx-runtime";
var LayoutContext = createContext(null);
var LayoutProvider = ({ engine, registry, config, children }) => {
  const [draggedId, setDraggedId] = useState(null);
  const state = useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getState()
  );
  const value = useMemo(() => ({
    engine,
    state,
    registry,
    config,
    draggedId,
    setDraggedId
  }), [engine, state, registry, config, draggedId]);
  return /* @__PURE__ */ jsx(LayoutContext.Provider, { value, children });
};
var useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

// src/components/Tile.tsx
import { useState as useState2 } from "react";

// src/icons.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var ICON_SPLIT_H = /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
  /* @__PURE__ */ jsx2("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx2("path", { d: "M12 3v18" })
] });
var ICON_SPLIT_V = /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { transform: "rotate(90deg)" }, children: [
  /* @__PURE__ */ jsx2("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx2("path", { d: "M12 3v18" })
] });
var ICON_REMOVE = /* @__PURE__ */ jsx2("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx2("path", { d: "M18 6L6 18M6 6l12 12" }) });
var ICON_MAXIMIZE = /* @__PURE__ */ jsx2("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx2("path", { d: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" }) });

// src/components/ControlButton.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var ControlButton = ({ onClick, title, children, color }) => /* @__PURE__ */ jsx3(
  "button",
  {
    onClick: (e) => {
      e.stopPropagation();
      onClick();
    },
    title,
    style: { border: "none", background: "none", color: color || "inherit", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", opacity: 0.7 },
    onMouseEnter: (e) => e.currentTarget.style.opacity = "1",
    onMouseLeave: (e) => e.currentTarget.style.opacity = "0.7",
    children
  }
);

// src/components/DefaultPicker.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var DefaultPicker = ({ tileId }) => {
  const { engine, registry } = useLayout();
  if (!registry) return /* @__PURE__ */ jsx4("div", { style: { padding: "20px", textAlign: "center", color: "#666" }, children: "Select a Component (No Registry)" });
  return /* @__PURE__ */ jsxs2("div", { className: "ug-picker", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "10px" }, children: [
    /* @__PURE__ */ jsx4("div", { style: { gridColumn: "1 / -1", textAlign: "center", marginBottom: "4px", fontSize: "12px" }, children: "Select a Component" }),
    Object.keys(registry).map((id) => /* @__PURE__ */ jsx4(
      "button",
      {
        onClick: () => engine.updateTile(tileId, { contentId: id }),
        style: {
          padding: "8px",
          cursor: "pointer",
          background: "#444",
          color: "white",
          border: "1px solid #555",
          borderRadius: "4px"
        },
        children: id
      },
      id
    ))
  ] });
};

// src/components/Tile.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var TileComponent = ({ node }) => {
  const { registry, engine, setDraggedId, draggedId, config } = useLayout();
  const [isOver, setIsOver] = useState2(false);
  const Component = node.contentId && registry ? registry[node.contentId] : null;
  const icons = {
    maximize: config?.icons?.maximize || ICON_MAXIMIZE,
    splitH: config?.icons?.splitH || ICON_SPLIT_H,
    splitV: config?.icons?.splitV || ICON_SPLIT_V,
    remove: config?.icons?.remove || ICON_REMOVE
  };
  const onDragStart = (e) => {
    setDraggedId(node.id);
    e.dataTransfer.setData("text/plain", node.id);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    if (draggedId && draggedId !== node.id) setIsOver(true);
  };
  const onDragLeave = () => setIsOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (draggedId && draggedId !== node.id) {
      engine.swapTiles(draggedId, node.id);
    }
    setDraggedId(null);
  };
  const borderStyle = isOver ? "var(--ug-tile-border-dragover, 2px solid #ffcc00)" : "var(--ug-tile-border, 1px solid #444)";
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: "ug-tile",
      onDragOver,
      onDragLeave,
      onDrop,
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        border: borderStyle,
        overflow: "hidden",
        backgroundColor: "var(--ug-tile-bg, #2a2a2a)"
      },
      children: [
        /* @__PURE__ */ jsxs3(
          "div",
          {
            className: "ug-tile-header",
            draggable: true,
            onDragStart,
            style: {
              background: "var(--ug-header-bg, #333)",
              padding: "4px 8px",
              cursor: "grab",
              fontSize: "11px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              borderBottom: "var(--ug-header-border-bottom, 1px solid #444)",
              color: "var(--ug-header-text, #888)"
            },
            children: [
              /* @__PURE__ */ jsx5("span", { style: { opacity: 0.5 }, children: node.id.substring(0, 8) }),
              /* @__PURE__ */ jsx5("span", { style: { fontWeight: "bold", color: "var(--ug-header-title, #ccc)", textAlign: "center" }, children: node.contentId || "" }),
              /* @__PURE__ */ jsxs3("div", { className: "ug-controls", style: { display: "flex", gap: "4px", justifyContent: "flex-end" }, children: [
                /* @__PURE__ */ jsx5(ControlButton, { onClick: () => engine.maximizeTile(node.id), title: "Maximize", children: icons.maximize }),
                /* @__PURE__ */ jsx5(ControlButton, { onClick: () => engine.split(node.id, "horizontal"), title: "Split Horizontal", children: icons.splitH }),
                /* @__PURE__ */ jsx5(ControlButton, { onClick: () => engine.split(node.id, "vertical"), title: "Split Vertical", children: icons.splitV }),
                /* @__PURE__ */ jsx5(ControlButton, { onClick: () => engine.removeTile(node.id), title: "Remove", color: "#ff4d4d", children: icons.remove })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx5("div", { className: "ug-tile-content", style: { flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }, children: Component ? /* @__PURE__ */ jsx5(Component, { node }) : /* @__PURE__ */ jsx5(DefaultPicker, { tileId: node.id }) })
      ]
    }
  );
};

// src/components/Gutter.tsx
import { useRef, useCallback } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var Gutter = ({ splitId, direction }) => {
  const { engine } = useLayout();
  const ref = useRef(null);
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const gutterSize = 4;
    const onMouseMove = (moveEvent) => {
      let newRatio;
      if (direction === "horizontal") {
        newRatio = (moveEvent.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize);
      } else {
        newRatio = (moveEvent.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
      }
      engine.setRatio(splitId, newRatio);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = direction === "horizontal" ? "ew-resize" : "ns-resize";
  }, [engine, splitId, direction]);
  return /* @__PURE__ */ jsx6(
    "div",
    {
      ref,
      className: "ug-gutter",
      style: {
        backgroundColor: "var(--ug-gutter-bg, #444)",
        cursor: direction === "horizontal" ? "ew-resize" : "ns-resize",
        zIndex: 10
      },
      onMouseDown: handleMouseDown
    }
  );
};

// src/components/Split.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var SplitComponent = ({ node }) => {
  const r = node.ratio;
  const gutterSize = 4;
  const style = {
    display: "grid",
    width: "100%",
    height: "100%",
    gridTemplateColumns: node.direction === "horizontal" ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : "100%",
    gridTemplateRows: node.direction === "vertical" ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : "100%"
  };
  return /* @__PURE__ */ jsxs4("div", { className: "ug-split", style, children: [
    /* @__PURE__ */ jsx7(LayoutNodeComponent, { node: node.children[0] }),
    /* @__PURE__ */ jsx7(Gutter, { splitId: node.id, direction: node.direction }),
    /* @__PURE__ */ jsx7(LayoutNodeComponent, { node: node.children[1] })
  ] });
};

// src/components/LayoutNode.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
var LayoutNodeComponent = ({ node }) => {
  return node.type === "tile" ? /* @__PURE__ */ jsx8(TileComponent, { node }) : /* @__PURE__ */ jsx8(SplitComponent, { node });
};

// src/components/MaximizedOverlay.tsx
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
var MaximizedOverlay = ({ node }) => {
  const { engine, registry, config } = useLayout();
  const Component = node.contentId && registry ? registry[node.contentId] : null;
  const icons = {
    remove: config?.icons?.remove || ICON_REMOVE
  };
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: "ug-maximized-overlay",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "var(--ug-overlay-bg, rgba(0,0,0,0.9))",
        zIndex: 1e3,
        display: "flex",
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ jsxs5(
          "div",
          {
            style: {
              background: "var(--ug-overlay-header-bg, #007acc)",
              padding: "10px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignSelf: "stretch",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsxs5("strong", { style: { color: "white" }, children: [
                "Maximized View ",
                node.contentId ? `- ${node.contentId}` : ""
              ] }),
              /* @__PURE__ */ jsx9(ControlButton, { onClick: () => engine.minimize(), title: "Close Maximized View", children: icons.remove })
            ]
          }
        ),
        /* @__PURE__ */ jsx9("div", { style: { flex: 1, padding: "40px" }, children: Component ? /* @__PURE__ */ jsx9(Component, { node }) : /* @__PURE__ */ jsx9(DefaultPicker, { tileId: node.id }) })
      ]
    }
  );
};

// src/utils.ts
function findTile(node, id) {
  if (node.id === id && node.type === "tile") return node;
  if (node.type === "split") {
    return findTile(node.children[0], id) || findTile(node.children[1], id);
  }
  return null;
}

// src/index.tsx
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var UGLayout = () => {
  const { state } = useLayout();
  const maximizedNode = state.maximizedTileId ? findTile(state.root, state.maximizedTileId) : null;
  return /* @__PURE__ */ jsxs6("div", { className: "ug-layout-root", style: { width: "100%", height: "100%", position: "relative" }, children: [
    /* @__PURE__ */ jsx10(LayoutNodeComponent, { node: state.root }),
    maximizedNode && /* @__PURE__ */ jsx10(MaximizedOverlay, { node: maximizedNode })
  ] });
};
export {
  LayoutProvider,
  UGLayout,
  useLayout
};
