---
title: Turborepo
description: Monorepo task runner configuration and usage patterns.
---

## Workspace Structure

```
soon/
├── apps/
│   ├── web/          # Next.js application
│   └── docs/         # Astro documentation site
├── packages/
│   ├── backend/      # Convex backend functions
│   ├── ui/           # shadcn/ui component library
│   ├── biome-config/ # Shared Biome configurations
│   └── typescript-config/  # Shared TypeScript configs
├── turbo.json        # Task pipeline configuration
└── package.json      # Root scripts and dependencies
```

## Task Pipelines

Defined in `turbo.json`:

```json
{
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"inputs": ["$TURBO_DEFAULT$", ".env*"],
			"outputs": [".next/**", "!.next/cache/**"]
		},
		"lint": {
			"dependsOn": ["^lint"]
		},
		"check-types": {
			"dependsOn": ["^check-types"]
		},
		"dev": {
			"cache": false,
			"persistent": true
		}
	}
}
```

### Pipeline Concepts

| Symbol             | Meaning                                  |
| ------------------ | ---------------------------------------- |
| `^build`           | Run `build` in dependencies first        |
| `dependsOn`        | Tasks that must complete before this one |
| `inputs`           | Files that affect task cache             |
| `outputs`          | Files produced by task                   |
| `persistent: true` | Task runs continuously (dev servers)     |
| `cache: false`     | Never cache this task                    |

## Filters

### By Package Name

```bash
turbo build --filter=web
turbo lint --filter=@repo/ui
turbo dev --filter=backend
```

### By Directory

```bash
turbo build --filter=./apps/web
turbo lint --filter=./packages/*
```

### Affected Only

```bash
# Only packages changed since origin/main
turbo build --affected
```

### Exclusions

```bash
# Everything except docs
turbo build --filter=!docs

# Everything except multiple packages
turbo build --filter=!docs --filter=!backend
```

### Combinations

```bash
# Web and its dependencies
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

If the hash matches a previous run, outputs are restored from cache.

### Global Environment Variables

Declared in `turbo.json`:

```json
{
	"globalEnv": ["NEXT_PUBLIC_CONVEX_URL", "CONVEX_DEPLOYMENT"]
}
```

Changes to these variables invalidate all caches.

### Inspecting Cache

```bash
# See what would run (dry run)
turbo build --dry-run

# See cache status
turbo build --summarize
```

### Clearing Cache

```bash
# Clear local cache
rm -rf .turbo

# Force rebuild
turbo build --force
```

## Root Scripts

From `package.json`:

```json
{
	"scripts": {
		"build": "turbo run build",
		"dev": "turbo run dev",
		"lint": "turbo run lint",
		"format": "biome format --write .",
		"check-types": "turbo run check-types",
		"test": "turbo run test"
	}
}
```

`bun <script>` at root runs the corresponding turbo command.

## Adding New Packages

1. Create package directory in `packages/` or `apps/`
2. Add `package.json` with `name` field
3. Run `bun install` at root
4. Package is automatically included in workspace

### Package.json Requirements

```json
{
	"name": "@repo/my-package",
	"private": true,
	"scripts": {
		"build": "...",
		"lint": "biome check --write",
		"check-types": "tsc --noEmit"
	}
}
```

## Common Patterns

### Run Task in Single Package

```bash
turbo build --filter=web
```

### Run All Tasks in Parallel

```bash
turbo build lint check-types
```

### Watch Mode with Specific Package

```bash
turbo dev --filter=web --filter=backend
```

### CI Pipeline

```bash
# Verify everything
turbo build lint check-types test
```
