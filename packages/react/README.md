# @ug-layout/react

React bindings and components for ug-layout.

## Installation

```bash
npm install @ug-layout/react @ug-layout/core
```

## Usage

```tsx
import { LayoutProvider, UGLayout } from '@ug-layout/react';
import { LayoutEngine } from '@ug-layout/core';

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