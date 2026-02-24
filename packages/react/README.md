# @ug-lay/react

React bindings and components for ug-lay.

## Installation

```bash
npm install @ug-lay/react @ug-lay/core
```

## Usage

```tsx
import { LayoutProvider, UGLayout } from '@ug-lay/react';
import { LayoutEngine } from '@ug-lay/core';

const engine = new LayoutEngine();
const registry = {
  'my-widget': ({ node }) => <div>{node.id}</div>
};

export function App() {
  return (
    <LayoutProvider engine={engine} registry={registry}>
      <UGLayout />
    </LayoutProvider>
  );
}
```

## Theming

Components use CSS variables for styling. See `packages/react/src/index.tsx` for the default variables.