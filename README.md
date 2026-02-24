# ug-lay

A framework-agnostic, persistent tiling window manager for the web.

## Structure
- `@ug-lay/core`: Reactive state machine (TypeScript).
- `@ug-lay/react`: React integration.
- `ug-lay/php`: Server-side DTOs and validation.
- `apps/*`: Reference implementations and sandboxes.

## Usage

```bash
pnpm install
pnpm build
```

### Sandboxes

There are three sandbox projects that show how one would implement the core package in pure Vanilla TS, with React and in a PHP web server environment. Run them with the following commands.

```bash
pnpm --filter sandbox dev
pnpm --filter react-sandbox dev
pnpm --filter php-sandbox-frontend dev
```

...or...

```bash
pnpm sandboxes:all
```

## Documentation
- [Core API Reference](./docs/api/core/src/README.md)
- [React API Reference](./docs/api/react/src/README.md)
