# Project: ug-layout (User Generated Layout)

## Metadata
- **Initial Model:** Gemini 2.0 Flash
- **Project Start:** Monday, February 23, 2026
- **Current Status:** Core Engine (Reactive State Machine) is complete. Vanilla TS Sandbox is functional.

## Foundational Mandates
1. **Version Control:** Git usage with the **Conventional Commits** specification.
2. **Development Workflow:** Collaborative suggestions prioritized by documentation and Developer Experience (DX).
3. **Engineering Standard:** Strict adherence to **Test Driven Development (TDD)** using the Red-Green-Refactor cycle.
4. **Architecture Strategy:** A framework-agnostic `@ug-layout/core` package must precede and power all framework-specific integrations (React, Vue, etc.).

## System Architecture
The layout is managed as a **Recursive Binary Tree**.
- **Nodes:** Either a `Tile` (Leaf) or a `Split` (Branch).
- **State Machine:** Pure logic in `@ug-layout/core` handles tree transformations (split, remove, swap, resize).
- **Reactivity:** Pub-Sub implementation allows any renderer to subscribe to state changes.
