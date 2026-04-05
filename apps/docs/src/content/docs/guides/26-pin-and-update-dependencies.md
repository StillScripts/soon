---
title: Pin and Update Dependencies
description: Pinning all dependencies to exact versions and updating to latest stable releases for security and reproducibility.
---

## What

Pinned all dependencies across the monorepo to exact versions (removing `^` and `~` prefixes) and updated every package to its latest stable release.

## Why

Version ranges like `^1.2.3` allow automatic minor/patch upgrades during install. While convenient, this creates security risks:

- **Supply chain attacks**: A compromised patch release gets pulled in automatically (e.g., the Axios SSRF vulnerability in v1.7.x where unpinned users were silently affected)
- **Non-reproducible builds**: Different team members or CI runs can resolve to different versions
- **Silent breakage**: A "compatible" update can introduce bugs that are hard to trace

Pinning to exact versions means every install resolves identically, and upgrades are explicit, reviewable decisions.

## Key Upgrades

| Package                   | Before  | After  | Notes                                  |
| ------------------------- | ------- | ------ | -------------------------------------- |
| `better-auth`             | 1.4.9   | 1.5.6  | Security/features                      |
| `better-convex`           | 0.5.x   | 0.11.0 | Breaking: removed meta, new auth paths |
| `@convex-dev/better-auth` | 0.10.10 | 0.11.4 | Aligned with better-convex             |
| `convex`                  | 1.31.6  | 1.34.1 | Required by better-convex 0.11         |
| `next`                    | 16.1.0  | 16.2.2 | Patch update                           |
| `react` / `react-dom`     | 19.2.0  | 19.2.4 | Patch update                           |
| `astro`                   | 5.6.1   | 6.1.3  | Major (required by starlight 0.38)     |
| `vite`                    | 7.3.1   | 8.0.3  | Major (vitest 4.1 supports it)         |
| `vitest`                  | mixed   | 4.1.2  | Unified across monorepo                |
| `turbo`                   | 2.7.6   | 2.9.3  | Minor update                           |
| `tailwind-merge`          | 2.3.0   | 3.5.0  | Major                                  |
| `@base-ui/react`          | 1.1.0   | 1.3.0  | Minor                                  |
| `lucide-react`            | 0.468.0 | 1.7.0  | Major (1.0 release)                    |
| `typescript`              | 5.9.2   | 5.9.3  | Stayed on 5.x (TS 6 too new)           |

## Breaking Changes Resolved

### better-convex 0.11.0

The biggest breaking change was `better-convex` upgrading from 0.5.x to 0.11.0:

1. **Module path changes**: Auth modules moved into a nested structure:
   - `better-convex/auth-client` → `better-convex/auth/client`
   - `better-convex/auth-nextjs` → `better-convex/auth/nextjs`

2. **Removed `meta` parameter**: The `meta` codegen output is no longer consumed by client-side APIs:
   - `createCRPCContext()` no longer accepts `meta`
   - `createServerCRPCProxy()` no longer accepts `meta`
   - `convexBetterAuth()` no longer accepts `meta`

### Astro 6.0

`@astrojs/starlight@0.38.2` requires `astro ^6.0.0`, triggering a major Astro upgrade. The docs app required no code changes.

### Vite 8.0

Vitest 4.1.2 supports vite 6/7/8, so the upgrade was transparent. `@vitejs/plugin-react` was bumped to 6.0.1 (which requires vite 8).

## Compatibility Research

Before upgrading, peer dependencies were verified:

- `better-convex@0.11.0` requires `better-auth >=1.5.0 <1.6.0` and `convex >=1.32`
- `@convex-dev/better-auth@0.11.4` requires `better-auth >=1.5.0 <1.6.0`
- `vitest@4.1.2` supports `vite ^6 || ^7 || ^8`
- `@astrojs/starlight@0.38.2` requires `astro ^6.0.0`
- TypeScript 6.0 was skipped as too new for the ecosystem

## Files Changed

- All 12 `package.json` files (root + 8 packages + 3 apps)
- `bun.lock` (regenerated)
- `apps/web/app/providers.tsx` (import path fix)
- `apps/web/lib/convex/crpc.tsx` (removed meta)
- `apps/web/lib/convex/rsc.tsx` (import path fix + removed meta)

## Context for AI

- All dependencies are now pinned to exact versions with no range prefixes
- The `meta` codegen from better-convex is no longer used client-side as of v0.11.0
- The `packages/backend/convex/shared/meta.ts` file still exists but is no longer imported by web app code
- Root `overrides` section pins `better-auth` and `vite` across the dependency tree
- TypeScript intentionally stayed at 5.9.3 (not 6.x) for ecosystem compatibility
