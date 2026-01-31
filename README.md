# Soon

[![CI](https://github.com/StillScripts/soon/actions/workflows/ci.yml/badge.svg)](https://github.com/StillScripts/soon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A modern monorepo starter with Bun, Turborepo, Convex, and AI-assisted development.

**[Documentation](https://soon-starter-docs.vercel.app/)** · **[GitHub](https://github.com/StillScripts/soon)**

## Quick Start

```bash
git clone https://github.com/StillScripts/soon.git my-app
cd my-app
bun install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env.local
cp apps/web/.env.example apps/web/.env.local

# Start development (run in separate terminals)
turbo dev --filter=web      # Next.js app
cd packages/backend && bunx convex dev  # Convex backend
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | [Bun](https://bun.sh) |
| Monorepo | [Turborepo](https://turborepo.dev) |
| Frontend | [Next.js 16](https://nextjs.org) + React 19 |
| Backend | [Convex](https://convex.dev) |
| Auth | [Better Auth](https://better-auth.com) |
| UI | [shadcn/ui](https://ui.shadcn.com) + Base UI |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Testing | [Vitest](https://vitest.dev) |
| Linting | [oxlint](https://oxc.rs) |
| Docs | [Astro Starlight](https://starlight.astro.build) |

## Project Structure

```
apps/
├── web/              # Next.js application
└── docs/             # Documentation site

packages/
├── backend/          # Convex backend + Better Auth
├── ui/               # Shared components (shadcn/ui)
├── validators/       # Shared Zod schemas
├── oxlint-config/    # Linting configuration
├── typescript-config/# TypeScript configuration
└── vitest-config/    # Test configuration
```

## Commands

```bash
bun dev           # Run all apps
bun build         # Build all apps
bun lint          # Lint all packages
bun format        # Format code
bun check-types   # Type check
bun test          # Run tests
```

## Claude Code Integration

This repo includes professional Claude Code skills for AI-assisted development:

```
/commit       # Create commits
/create-pr    # Create pull requests
/code-review  # Code reviews
/convex       # Convex patterns
/vitest       # Testing guidance
```

See [.claude/README.md](.claude/README.md) for all available skills.

## Documentation

The [documentation site](https://soon-starter-docs.vercel.app/) contains:

- **Development Journey**: 18 guides documenting how this project was built
- **Skills Reference**: Claude Code skill documentation
- **Quick Reference**: Common patterns and APIs

## License

MIT
