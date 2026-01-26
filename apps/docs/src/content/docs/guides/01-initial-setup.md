---
title: Initial Setup - Creating the TurboRepo
description: How we bootstrapped the Ember project using create-turbo with Bun.
---

## What We Did

Initialized a new TurboRepo monorepo called "ember" using Bun as the package manager.

## Why These Choices

**TurboRepo**: Provides efficient monorepo management with:
- Smart caching of build outputs
- Parallel task execution
- Clear dependency graphs between packages

**Bun**: Critical choice for this project because:
- Significantly faster than npm/yarn/pnpm
- Native TypeScript support
- Drop-in replacement for Node.js
- Built-in package manager, test runner, and bundler

**Project Name "ember"**: The chosen name for this application.

## Commands Used

```bash
bunx create-turbo@latest
```

**Selections made:**
- Where would you like to create your Turborepo? `./ember`
- Which package manager do you want to use? `bun`

## Initial Structure Created

The create-turbo command generated:

```
ember/
├── apps/
│   ├── docs/         # Next.js docs app (later replaced)
│   └── web/          # Next.js web application
├── packages/
│   ├── eslint-config/       # Shared ESLint configurations
│   ├── typescript-config/   # Shared TypeScript configurations
│   └── ui/                  # Shared React component library
├── package.json
├── turbo.json
└── README.md
```

### Application Packages

- `apps/docs`: Initially a Next.js application for documentation
- `apps/web`: Next.js 16.1.0 application with React 19

### Library Packages

- `@repo/ui`: Shared React component library with Button, Card, and Code components
- `@repo/eslint-config`: ESLint configurations for base, Next.js, and React
- `@repo/typescript-config`: Shared TypeScript compiler configurations

## Key Configuration Files

### package.json (root)
- Uses Bun workspaces: `apps/*` and `packages/*`
- Main scripts: `build`, `dev`, `lint`, `format`, `check-types`
- All use `turbo run` for orchestration

### turbo.json
- Defines task pipelines with dependency graphs
- Build outputs cached in `.next/` (excluding cache directory)
- Dev tasks run persistently without caching

## Context for AI

When working in this codebase:
- Always use `bun` commands, never `npm` or `yarn`
- Use `turbo --filter=<package>` to target specific packages
- The monorepo pattern means changes in `packages/*` affect `apps/*`
- All packages share TypeScript and ESLint configurations for consistency

## Next Steps

After initialization, we:
1. Navigated to the project: `cd ember`
2. Verified the structure: `ls`
3. Prepared to replace the docs app with Astro (see [next guide](./02-astro-docs))
