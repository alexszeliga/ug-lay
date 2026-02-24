# ug-layout TODO List

## Interaction & UX
- [x] **Visual Cues:** Implement a "Ghost Preview" or drop-zone highlighting to show where a tile will land during drag-and-drop.
- [x] **Edge Snapping:** Allow dragging a tile to the far edge of another tile to automatically trigger a split (rather than just a swap).
- [ ] **Pointer Events Refactor:** Swap `mousedown/move/up` for `PointerEvents` to support touch and stylus hardware.
- [ ] **Interaction Coordinator:** Refactor drag logic to use dynamic window-level listeners, preventing global event pollution and supporting multiple side-by-side instances.
- [ ] **Coordinate Normalization:** Add a core helper to handle mouse math under CSS `transform: scale()` or `zoom`.
- [ ] **Tabs:** Support multiple components within a single tile using a tabbed interface.
- [ ] **Window Pop-outs:** Research and implement native browser window pop-outs for multi-monitor support.

## Full-Stack & Persistence
- [ ] **Fixed Units Support:** Update `SplitNode` to support `mode: 'fixed'` (pixels) alongside `mode: 'ratio'` (percentages) to prevent stretching on large monitors.
- [ ] **Laravel Inertia App:** Build a professional reference application using Laravel, Inertia.js, and React.
- [ ] **Backend Real-time Sync:** Explore WebSockets (Laravel Reverb/Pusher) for real-time collaborative layout editing.

## DX & Documentation
- [ ] **README Authoring:** Populate the stashed README stubs with project vision and technical guides.
- [ ] **API Reference:** Generate automated API documentation from TypeScript types.
- [ ] **Vue Integration:** Scaffold `@ug-layout/vue` to expand framework coverage.
