# Conversation & Feature Archive

## Project: ug-layout
**Initial Model:** Gemini 2.0 Flash  
**Start Date:** Feb 23, 2026

---

## Session 1: Foundation & Core Logic

### 1. Monorepo Scaffolding
- **Objective:** Build for scale using a framework-agnostic core.
- **Outcome:** Initialized `pnpm` workspaces. Created `@ug-layout/core` and `apps/sandbox`.
- **Tooling:** TypeScript, Vitest, tsup.

### 2. Feature: Tile Splitting (TDD)
- **Prompt:** "Think of it as a tiling window manager... perfect for a dashboard."
- **TDD Red:** Attempted to call `engine.split()` on a non-existent method.
- **Green:** Implemented a recursive tree transformation where a `Tile` is replaced by a `Split` node with two children.
- **Refactor:** Unified the tree node types into a recursive `LayoutNode` union.

### 3. Bug: Vite Import Resolution
- **Issue:** Sandbox browser console showed `[plugin:vite:import-analysis] Failed to resolve entry for package "@ug-layout/core"`.
- **Root Cause:** The `package.json` pointed to `/dist`, but the code wasn't built, and Vite didn't know how to resolve the workspace source.
- **TDD Fix:** Added `exports.spec.ts` to verify resolution. Updated `package.json` with modern `exports` and added a `vite.config.ts` alias to point directly to `src/index.ts` for DX.

### 4. Feature: Reactivity (Pub-Sub)
- **Objective:** Decouple the engine from the UI.
- **TDD Red:** Verified that state changes didn't trigger an external spy.
- **Green:** Implemented `subscribe(callback)` and `notify()` within `LayoutEngine`.
- **Sandbox Integration:** Updated the manual `updateDOM` to fire automatically on engine changes.

### 5. Bug: Gutter Jumpiness (Geometry)
- **Issue:** When dragging gutters, the layout would "shoot" to the edge or vibrate.
- **Root Cause:** `getBoundingClientRect()` was called inside the `mousemove` handler, creating a feedback loop as the element resized itself while being measured.
- **TDD Fix:** Hardened the test setup with `geometry.spec.ts`.
- **Green Implementation:** Refactored to cache the container's `rect` once on `mousedown`.

### 6. Feature: Tile Removal & Promotion
- **Objective:** Delete tiles and reclaim space.
- **Logic:** Recursive search for parent; replace parent `Split` node with the remaining sibling (promotion).
- **TDD Verified:** Confirmed both shallow and nested removal.

### 7. Feature: Keyboard Shortcuts & Focus
- **Input Model:** Borrowed from `tmux`/`i3`.
- **Bindings:** `Ctrl+d` (Split H), `Ctrl+v` (Split V), `Ctrl+x` (Remove).
- **Architecture:** Implemented in the *Integration Layer* (Sandbox) to keep Core pure.

### 8. Feature: Structural Swapping
- **Requirement:** Drag one tile over another to swap.
- **Challenge:** Initial implementation swapped only content but kept IDs fixed.
- **Refactor:** Implemented `recursiveSwap` to exchange full identities (IDs + Content) in a single tree traversal pass.

### 9. Feature: Maximization & Component Picker
- **Objective:** User-configurable tiles.
- **Implementation:** Added `maximizedTileId` to core state. Built a `REGISTRY` in the sandbox. Tiles without a `contentId` render a picker UI.
- **UX Improvement:** Updated splitting to preserve content in the first child instead of clearing both.

---
*End of Session 1 Archive*
