# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo using Bun as the package manager. The repository contains two applications and three shared packages.

**Documentation:** The `docs` app contains comprehensive development history and tutorials in `src/content/docs/guides/`. These guides document how the project was built, serving as both tutorial and context for future developers and AI assistants.

**Apps:**
- `web`: Next.js 16.1.0 application (React 19)
- `docs`: Astro documentation site using Starlight

**Packages:**
- `@repo/ui`: Shared React component library
- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configurations

## Strict Bun Usage Policy

**CRITICAL: This repository strictly uses Bun for all operations.** Do not use Node.js, npm, pnpm, yarn, or vite.

### Command Replacements

**Always use Bun commands:**
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv

### Bun APIs (Prefer Over npm Packages)

**Built-in Bun APIs to use instead of npm packages:**
- `Bun.serve()` supports WebSockets, HTTPS, and routes - don't use `express`
- `bun:sqlite` for SQLite - don't use `better-sqlite3`
- `Bun.redis` for Redis - don't use `ioredis`
- `Bun.sql` for Postgres - don't use `pg` or `postgres.js`
- `WebSocket` is built-in - don't use `ws`
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- `Bun.$`ls`` instead of `execa`

### Testing with Bun

Use `bun test` to run tests:

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

### Frontend with Bun (Alternative to Vite)

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

**Server:**
```ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

**HTML files can import .tsx, .jsx or .js files directly:**
```html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

**Frontend component:**
```tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

**Run with:**
```bash
bun --hot ./index.ts
```

**Additional Resources:**
For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Essential Commands

### Development
```bash
# Run all apps in dev mode
bun dev

# Run specific app (recommended for focused development)
turbo dev --filter=web    # Next.js app on port 3000
turbo dev --filter=docs   # Astro docs on port 4321

# Build all apps
bun build

# Build specific app
turbo build --filter=web
turbo build --filter=docs
```

### Code Quality
```bash
# Lint all packages
bun lint

# Lint specific package/app
turbo lint --filter=web

# Type checking
bun check-types
turbo check-types --filter=web

# Format code
bun format
```

### UI Package Development
```bash
# Generate new React component in @repo/ui
cd packages/ui
bun generate:component
```

## Architecture Notes

### Turborepo Task Dependencies

The `turbo.json` configuration defines task pipelines:
- `build` tasks depend on `^build` (upstream dependencies must build first)
- `lint` and `check-types` follow the same pattern
- `dev` tasks are not cached and run persistently

### Package Structure

**@repo/ui exports:**
- Uses wildcard exports: `./*` maps to `./src/*.tsx`
- Direct file imports: `import { Button } from "@repo/ui/button"`
- Current components: `button.tsx`, `card.tsx`, `code.tsx`

**@repo/eslint-config exports:**
- `./base`: Base ESLint configuration
- `./next-js`: Next.js-specific configuration
- `./react-internal`: React library configuration

### Next.js App (web)

- Uses App Router (not Pages Router)
- Port: 3000
- Type generation via `next typegen` before type checking
- ESLint configured with `--max-warnings 0` (strict)

### Astro Docs App

- Uses Starlight documentation theme
- Content in `src/content/docs/` (`.md` or `.mdx` files)
- File-based routing
- Static assets in `public/`, embeddable assets in `src/assets/`
- Port: 4321

### Shared Dependencies

All packages use:
- TypeScript 5.9.2
- React 19.2.0
- ESLint 9.39.1
- Node.js >= 18 required

## Turborepo Filters

Use filters to target specific packages efficiently:
```bash
turbo <task> --filter=<package-name>
turbo <task> --filter=@repo/ui
turbo <task> --filter=web
```

## Claude Code Skills & Agents

This repository includes professional skills and agents from [Sentry](https://github.com/getsentry/skills) and [Vercel](https://github.com/vercel-labs/agent-skills). See `.claude/README.md` for details.

**Available Skills:**
- `/commit` - Create well-formatted commits
- `/create-pr` - Create professional pull requests
- `/code-review` - Perform thorough code reviews
- `/find-bugs` - Security and bug auditing
- `/iterate-pr` - Auto-fix CI failures
- `/brand-guidelines` - Write professional UI copy
- `/doc-coauthoring` - Collaborative documentation workflow
- `/document-update` - Document development changes in guides folder
- `/vercel-react-best-practices` - React/Next.js performance optimization (57 rules)
- `/web-design-guidelines` - UI/UX best practices audit (100+ rules)

**Available Agents:**
- `code-simplifier` - Automatically refines code for clarity (runs proactively)
