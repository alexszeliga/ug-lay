# ug-layout

A framework-agnostic, persistent tiling window manager for the web.

## Structure
- `@ug-layout/core`: Reactive state machine (TypeScript).
- `@ug-layout/react`: React integration.
- `ug-layout/php`: Server-side DTOs and validation.
- `apps/*`: Reference implementations and sandboxes.

## Usage

```bash
pnpm install
pnpm build
```

### Sandboxes
```bash
pnpm --filter sandbox dev
pnpm --filter react-sandbox dev
pnpm --filter php-sandbox dev
```

## Documentation
- [Core API Reference](./docs/api/core/src/README.md)
- [React API Reference](./docs/api/react/src/README.md)
