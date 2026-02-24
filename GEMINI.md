# Project: ug-lay (User Generated Layout)

## Metadata
- **Initial Model:** Gemini 2.0 Flash
- **Project Start:** Monday, February 23, 2026
- **Current Status:** Full-Stack Ecosystem Hardened. 
  - Reactive Core Engine (TS) with Generic Metadata Support
  - Themeable React Integration with Strict Registry Types
  - Storybook Documentation for React Components
  - PHP DTO & Validation Layer
  - Persistent Sandboxes (LocalStorage & PHP/SQLite)

## Foundational Mandates
1. **Version Control:** Git usage with the **Conventional Commits** specification.
2. **Development Workflow:** Collaborative suggestions prioritized by documentation and Developer Experience (DX).
3. **Engineering Standard:** Strict adherence to **Test Driven Development (TDD)** using the Red-Green-Refactor cycle.
4. **Architecture Strategy:** A framework-agnostic `@ug-lay/core` package must precede and power all framework-specific integrations (React, Vue, etc.).

## System Architecture
The layout is managed as a **Recursive Binary Tree**.
- **Nodes:** Either a `Tile` (Leaf) or a `Split` (Branch).
- **State Machine:** Pure logic in `@ug-lay/core` handles tree transformations.
- **Type Safety:** High-level generics allow users to type their own `TMetadata`.
- **Reactivity:** Pub-Sub implementation allows any renderer to subscribe to state changes.
- **Themeable:** "Headless but Pre-styled" approach. Functional layout is built-in, but aesthetics (colors, icons, borders) are delegated to CSS Variables and application-level configuration.
- **Persistence:** Plug-and-play Adapter pattern (LocalStorage, HTTP) with built-in debouncing.
- **Backend:** PHP DTO layer ensures type-safe persistence and validation.
