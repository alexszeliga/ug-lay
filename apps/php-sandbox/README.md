# PHP Sandbox

This application demonstrates the persistence layer using PHP and SQLite.

## Quick Start

You can now start the entire shebang (PHP backend + Vite frontend) with a single command from the project root:

```bash
pnpm sandbox:php
```

Or from this directory:

```bash
pnpm dev
```

## Architecture

- **Backend (`index.php`):** A simple PHP script that handles GET/POST requests to `layout.json`.
- **Frontend (`src/`):** A Vanilla TS implementation using `@ug-lay/core`.
- **Dev Runner (`scripts/dev.ts`):** An OOP-based manager that orchestrates both the PHP server and the Vite dev server.

## Requirements

- PHP 8.x
- Node.js & pnpm
