# Soon

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-FF6F00?logo=convex&logoColor=white)](https://convex.dev)

A modern monorepo starter with Bun, Turborepo, and AI-assisted development.

**[Documentation](https://soon-starter-docs.vercel.app/)** · **[GitHub](https://github.com/StillScripts/soon)**

## Quick Start

```bash
# Clone the repository
git clone https://github.com/StillScripts/soon.git my-app
cd my-app

# Install dependencies
bun install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env.local
cp apps/web/.env.example apps/web/.env.local

# Start development
bun dev
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime and package manager
- **Monorepo**: [Turborepo](https://turborepo.dev) - High-performance build system
- **Frontend**: [Next.js 16](https://nextjs.org) with React 19
- **Backend**: [Convex](https://convex.dev) - Reactive backend platform
- **Auth**: [Better Auth](https://better-auth.com) - Authentication library
- **UI**: [shadcn/ui](https://ui.shadcn.com) with Base UI primitives
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with oklch color theme
- **Linting**: [oxlint](https://oxc.rs) - Fast linter from oxc
- **Formatting**: [Prettier](https://prettier.io) - Code formatter (tabs, no semicolons)
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
├── oxlint-config/ # Shared oxlint configurations
├── typescript-config/ # Shared TypeScript configurations
└── vitest-config/     # Shared Vitest configurations
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.6
- Node.js >= 18

## Development

```bash
# Run all apps
bun dev

# Run specific app
turbo dev --filter=web    # Next.js on port 3000
turbo dev --filter=docs   # Docs on port 4321

# Run Convex backend (in a separate terminal)
cd packages/backend && bunx convex dev
```

## Build

```bash
# Build all apps
bun build

# Build specific app
turbo build --filter=web
```

## Code Quality

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

Visit the [documentation site](https://soon-starter-docs.vercel.app/) for comprehensive guides on how this project was built.

To run docs locally: `turbo dev --filter=docs`

## License

MIT
