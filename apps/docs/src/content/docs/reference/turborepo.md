---
title: Turborepo
description: Monorepo task runner configuration and usage patterns.
---

## Workspace Structure

```
soon/
├── apps/
│   ├── web/              # Next.js application
│   └── docs/             # Astro documentation site
├── packages/
│   ├── backend/          # Convex backend
│   ├── ui/               # shadcn/ui components
│   ├── validators/       # Shared Zod schemas
│   ├── oxlint-config/    # Shared oxlint configs
│   ├── typescript-config/# Shared TypeScript configs
│   └── vitest-config/    # Shared Vitest config
├── turbo.json            # Task pipeline configuration
└── package.json          # Root scripts
```

## Task Pipelines

Defined in `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types", "^transit"]
    },
    "test": {
      "dependsOn": ["transit"],
      "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/vitest.config.ts"],
      "outputs": ["coverage/**"]
    },
    "transit": {
      "dependsOn": ["^transit"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Pipeline Concepts

| Symbol | Meaning |
|--------|---------|
| `^build` | Run `build` in dependencies first |
| `dependsOn` | Tasks that must complete first |
| `inputs` | Files that affect task cache |
| `outputs` | Files produced by task |
| `persistent: true` | Task runs continuously |
| `cache: false` | Never cache this task |

### Transit Task

The `transit` task compiles config packages (like `vitest-config`) that export TypeScript. This ensures they're built before dependent packages run type checking or tests.

## Filters

### By Package Name

```bash
turbo build --filter=web
turbo lint --filter=@repo/ui
turbo dev --filter=docs
```

### By Directory

```bash
turbo build --filter=./apps/web
turbo lint --filter=./packages/*
```

### Affected Only

```bash
turbo build --affected
```

### Exclusions

```bash
turbo build --filter=!docs
```

### Dependencies

```bash
# Package and its dependencies
turbo build --filter=web...

# Packages that depend on ui
turbo build --filter=...@repo/ui
```

## Caching

### How It Works

Turborepo hashes:
- Task inputs (source files, configs)
- Dependencies' outputs
- Environment variables (from `globalEnv`)

If hash matches, outputs are restored from cache.

### Global Environment Variables

```json
{
  "globalEnv": ["NEXT_PUBLIC_CONVEX_URL", "CONVEX_DEPLOYMENT"]
}
```

### Cache Commands

```bash
# Dry run (see what would run)
turbo build --dry-run

# Force rebuild (ignore cache)
turbo build --force

# Clear local cache
rm -rf .turbo
```

## Root Scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "turbo run test"
  }
}
```

## Adding New Packages

1. Create directory in `packages/` or `apps/`
2. Add `package.json` with `name` field
3. Run `bun install` at root

### Package Requirements

```json
{
  "name": "@repo/my-package",
  "private": true,
  "scripts": {
    "build": "tsc",
    "lint": "oxlint -c @repo/oxlint-config/base",
    "check-types": "tsc --noEmit"
  }
}
```

## Common Patterns

### Run Multiple Tasks

```bash
turbo build lint check-types
```

### Dev Multiple Packages

```bash
turbo dev --filter=web --filter=docs
```

### CI Pipeline

```bash
turbo check-types lint test build
```
