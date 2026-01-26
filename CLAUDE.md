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

This repository includes professional skills and agents adapted from [Sentry's skills repository](https://github.com/getsentry/skills). See `.claude/README.md` for details.

**Available Skills:**
- `/commit` - Create well-formatted commits
- `/create-pr` - Create professional pull requests
- `/code-review` - Perform thorough code reviews
- `/find-bugs` - Security and bug auditing
- `/iterate-pr` - Auto-fix CI failures
- `/brand-guidelines` - Write professional UI copy
- `/doc-coauthoring` - Collaborative documentation workflow

**Available Agents:**
- `code-simplifier` - Automatically refines code for clarity (runs proactively)
