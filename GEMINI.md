# Project: ug-layout (User Generated Layout)

## Metadata
- **Initial Model:** Gemini 2.0 Flash
- **Project Start:** Monday, February 23, 2026
- **Current Status:** Full-Stack Ecosystem Complete. 
  - Reactive Core Engine (TS)
  - Themeable React Integration
  - PHP DTO & Validation Layer
  - Persistent Sandboxes (LocalStorage & PHP/SQLite)

## Foundational Mandates
1. **Version Control:** Git usage with the **Conventional Commits** specification.
2. **Development Workflow:** Collaborative suggestions prioritized by documentation and Developer Experience (DX).
3. **Engineering Standard:** Strict adherence to **Test Driven Development (TDD)** using the Red-Green-Refactor cycle.
4. **Architecture Strategy:** A framework-agnostic `@ug-layout/core` package must precede and power all framework-specific integrations (React, Vue, etc.).

## System Architecture
The layout is managed as a **Recursive Binary Tree**.
- **Nodes:** Either a `Tile` (Leaf) or a `Split` (Branch).
- **State Machine:** Pure logic in `@ug-layout/core` handles tree transformations (split, remove, swap, resize, maximize, reset).
- **Reactivity:** Pub-Sub implementation allows any renderer to subscribe to state changes.
- **Persistence:** Plug-and-play Adapter pattern (LocalStorage, HTTP) with built-in debouncing.
- **Backend:** PHP DTO layer ensures type-safe persistence and validation for PHP-based frameworks (Laravel/Symfony).
