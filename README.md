# Soon

A modern monorepo starter with Bun, Turborepo, and AI-assisted development.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime and package manager
- **Monorepo**: [Turborepo](https://turborepo.dev) - High-performance build system
- **Frontend**: [Next.js 16](https://nextjs.org) with React 19
- **Backend**: [Convex](https://convex.dev) - Reactive backend platform
- **Auth**: [Better Auth](https://better-auth.com) - Authentication library
- **UI**: [shadcn/ui](https://ui.shadcn.com) with Base UI primitives
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with oklch color theme
- **Linting**: [Biome](https://biomejs.dev) - Fast linter and formatter
- **Testing**: [Vitest](https://vitest.dev) - Fast unit testing framework
- **Docs**: [Astro Starlight](https://starlight.astro.build) - Documentation site

## Project Structure

```
apps/
├── web/          # Next.js application (port 3000)
└── docs/         # Astro documentation site (port 4321)

packages/
├── backend/      # Convex backend with Better Auth
├── ui/           # Shared UI components (shadcn/ui)
├── validators/   # Shared validation utilities
├── biome-config/ # Shared Biome configurations
├── typescript-config/ # Shared TypeScript configurations
└── vitest-config/     # Shared Vitest configurations
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.6
- Node.js >= 18

### Installation

```bash
bun install
```

### Environment Setup

Copy the example environment files and configure them:

```bash
# Backend (Convex)
cp packages/backend/.env.example packages/backend/.env.local

# Web app
cp apps/web/.env.example apps/web/.env.local
```

Then run `bunx convex dev` in `packages/backend` to set up your Convex deployment.

### Development

```bash
# Run all apps
bun dev

# Run specific app
turbo dev --filter=web    # Next.js on port 3000
turbo dev --filter=docs   # Docs on port 4321

# Run Convex backend
cd packages/backend && bunx convex dev
```

### Build

```bash
# Build all apps
bun build

# Build specific app
turbo build --filter=web
```

### Code Quality

```bash
# Lint all packages
bun lint

# Format code
bun format

# Type checking
bun check-types

# Run tests
bun test
```

## Claude Code Integration

This repository includes professional Claude Code skills and agents. See [.claude/README.md](.claude/README.md) for details.

**Available Skills:**
- `/commit` - Create well-formatted commits
- `/create-pr` - Create professional pull requests
- `/code-review` - Perform thorough code reviews
- `/find-bugs` - Security and bug auditing

## Documentation

The `apps/docs` site contains comprehensive development guides documenting how this project was built. Run `turbo dev --filter=docs` to view locally.

## License

MIT
