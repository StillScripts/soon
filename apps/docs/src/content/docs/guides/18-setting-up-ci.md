---
title: "Guide 18: Setting Up CI"
description: How we set up GitHub Actions CI/CD with Turborepo caching and Vercel deployment
---

# Setting Up CI

This guide documents setting up GitHub Actions for continuous integration with proper Turborepo task dependencies and Vercel deployment.

## What We Did

Added a GitHub Actions CI workflow that runs type checking, linting, formatting, and tests on every push to main and pull request.

## GitHub Actions Workflow

Created `.github/workflows/ci.yml` with two parallel jobs:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run check-types
      - run: bun run lint
      - run: bun run format:check

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test
```

## Turborepo Configuration

The key to making CI work was configuring `turbo.json` correctly:

```json
{
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"outputs": [".next/**", "!.next/cache/**", "dist/**"]
		},
		"check-types": {
			"dependsOn": ["^check-types", "^transit"]
		},
		"test": {
			"dependsOn": ["transit"]
		},
		"transit": {
			"dependsOn": ["^transit"]
		}
	}
}
```

### Why `transit` Task?

The `vitest-config` package exports TypeScript that needs to be compiled before other packages can use it. The `transit` task runs `tsc` to build these dependencies.

- `check-types` depends on `^transit` so config packages are built first
- `test` depends on `transit` so vitest can load the compiled config
- `build` outputs include `dist/**` for Astro builds (needed for Vercel caching)

## Prettierignore Updates

Added ignores for auto-generated files that conflict with formatting:

```
**/convex/_generated
**/convex/**/_generated
**/next-env.d.ts
```

Next.js regenerates `next-env.d.ts` with semicolons, which conflicts with our Prettier config (no semicolons).

## Vercel Deployment

The `dist/**` in turbo.json build outputs is critical for Vercel deployment:

- Vercel uses Turborepo caching
- When cache hits, outputs must be restored correctly
- Without `dist/**`, the Astro docs build output wasn't restored

## Files Changed

| Action   | Files                      |
| -------- | -------------------------- |
| Created  | `.github/workflows/ci.yml` |
| Modified | `turbo.json`               |
| Modified | `.prettierignore`          |
| Created  | `apps/docs/vercel.json`    |
| Modified | `packages/vitest-config/*` |

## Verification

```bash
# Run all CI checks locally
bun run check-types
bun run lint
bun run format:check
bun run test
```

## Context for AI

When CI fails:

1. **Type errors**: Check if `transit` task ran first (`turbo check-types` handles this)
2. **Format errors**: Run `bun format` to fix, check `.prettierignore` for generated files
3. **Test errors**: Ensure `vitest-config` is built (`turbo test` handles this)
4. **Vercel build fails**: Check `turbo.json` outputs include the build directory
