# Changelog

All notable changes to the SOON starter kit are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-19

### Added

- Dark mode toggle using `next-themes` with system preference detection and localStorage persistence
- Sun/moon icon button visible on login and authenticated views

## [0.23.0] - 2026-02-19

### Added

- React Server Components integration with Better Convex for server-side data prefetching using `prefetch()` and `preloadQuery()`
- `HydrateClient` wrapper for seamless server-to-client hydration

### Changed

- Split monolithic home page into focused client components (`home-page.tsx`, `things-manager.tsx`, `user-header.tsx`)

## [0.22.0] - 2026-02-18

### Added

- `@repo/api` package centralizing TanStack Query hooks with type-safe Convex cRPC integration and automatic cache invalidation
- Server caller for RSC data fetching without client-side hooks

## [0.21.0] - 2026-02-18

### Changed

- Refactored `@repo/validators` to contain only user input schemas for forms
- Moved backend-specific operation schemas (get by ID, delete, pagination) into the Convex backend

## [0.20.0] - 2026-02-18

### Added

- React Testing Library setup with 25 tests for AuthForm covering rendering, mode switching, validation, form submission, error handling, and loading states

## [0.19.0] - 2026-02-18

### Changed

- Modified auth middleware to support both `convex-test` mock identity and Better Auth, enabling direct testing of production cRPC functions (deleted 154 lines of duplicated code)

### Added

- 40 Convex backend tests covering Things CRUD, user isolation, and file storage

## [0.18.0] - 2026-02-17

### Added

- GitHub Actions CI workflow with parallel quality (check-types, lint, format) and test jobs
- Turborepo caching in CI and Vercel deployment configuration

## [0.17.0] - 2026-02-17

### Added

- Description field (max 2000 chars) and image upload via Convex file storage for Things entity
- `generateUploadUrl` mutation, image URL resolution in queries, and inline editing UI

### Fixed

- Tailwind CSS not scanning `@repo/ui` components resolved by adding `@source` directive

## [0.16.0] - 2026-02-17

### Changed

- Reorganized Convex code into `functions/` (deployed), `lib/` (server helpers), and `shared/` (client exports) directories

### Fixed

- Added `.output()` declarations with `zid()` for proper static API type generation
- Resolved Bun symlink type resolution issues in Convex shared modules

## [0.15.0] - 2026-02-17

### Added

- Build-time script auto-generating documentation pages from `.claude/skills/` SKILL.md files into the Astro docs site
- Auto-generated sidebar for 30 documented skills

## [0.14.0] - 2026-02-16

### Changed

- Replaced Biome with oxlint (Rust-based linter) + Prettier due to Biome formatter issues
- Added `@repo/oxlint-config` with layered base/react/next configurations and VS Code integration

## [0.13.0] - 2026-02-16

### Added

- `@repo/validators` package with shared Zod schemas for frontend form validation and backend API validation (28 unit tests)

## [0.12.0] - 2026-02-16

### Changed

- Migrated from standard Convex hooks to Better Convex cRPC with Zod validators, auth middleware (`ctx.user` guaranteed), and TanStack Query integration
- Added `ConvexAuthProvider` with unauthorized redirect handling

## [0.11.0] - 2026-02-16

### Added

- Login/signup forms using TanStack Form with shadcn Field components
- Protected pages with session-aware UI and user-owned data
- `userId` field and `by_user` index on Things for data isolation

## [0.10.0] - 2026-02-15

### Added

- Vitest testing framework with `@repo/vitest-config` shared configuration
- Turborepo caching integration and jsdom environment for React testing
- `transit` task pattern for parallel test execution

## [0.9.0] - 2026-02-15

### Changed

- Replaced ESLint + Prettier with Biome for unified linting and formatting (10-100x faster)
- Added `@repo/biome-config` shared configuration package with base, Next.js, and React-internal configs

## [0.8.0] - 2026-02-15

### Added

- Better Auth with Convex adapter for email/password authentication (`@convex-dev/better-auth`)
- Auth component registration, `getCurrentUser` query, and environment variable setup

## [0.7.0] - 2026-02-15

### Added

- 13 accessible shadcn/ui components (AlertDialog, Badge, Button, Card, Combobox, DropdownMenu, Field, Input, InputGroup, Label, Select, Separator, Textarea) using Base UI primitives in `@repo/ui`
- Tailwind CSS v4 theme with oklch color space and light/dark mode support

## [0.6.0] - 2026-02-14

### Added

- `/turborepo` Claude Code skill with decision trees, anti-patterns, caching strategies, CI optimization, and environment variable handling

## [0.5.0] - 2026-02-14

### Added

- Convex backend-as-a-service in `packages/backend` with a "Things" CRUD example and real-time queries
- Full Next.js integration via `ConvexProvider`
- `/convex` Claude Code skill for AI-assisted Convex development

## [0.4.0] - 2026-02-14

### Added

- 11 Claude Code skills from Sentry (commit, create-pr, code-review, find-bugs, iterate-pr, brand-guidelines, doc-coauthoring, agents-md, claude-settings-audit) and Vercel (react-best-practices, web-design-guidelines)
- `code-simplifier` agent for automatic code refinement

## [0.3.0] - 2026-02-14

### Added

- Claude Code integration with `/init` and `CLAUDE.md` project context file
- Repository overview, essential commands, and architecture notes for AI-assisted development

## [0.2.0] - 2026-02-14

### Added

- Astro Starlight documentation site (`apps/docs`) with file-based routing and sidebar navigation

### Changed

- Replaced the default Next.js docs app with Astro for content-focused documentation

## [0.1.0] - 2026-02-14

### Added

- Turborepo monorepo scaffolded with Bun as the package manager
- Next.js 16.1 application (`apps/web`) for the web app
- Shared packages: `@repo/ui`, `@repo/eslint-config`, `@repo/typescript-config`
