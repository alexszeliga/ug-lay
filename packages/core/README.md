# @ug-lay/core

Core logic and state management for ug-lay.

## Installation

```bash
npm install @ug-lay/core
```

## API

The layout is managed as a recursive binary tree. State mutations are handled by `LayoutEngine`.

```typescript
import { LayoutEngine } from '@ug-lay/core';

const engine = new LayoutEngine();
engine.split(engine.getState().root.id, 'horizontal');
```

Refer to the [API Documentation](../../docs/api/core/src/README.md) for details.
