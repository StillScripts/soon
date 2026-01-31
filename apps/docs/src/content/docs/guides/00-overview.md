---
title: Development Journey Overview
description: A chronological history of how this application was built, serving as both tutorial and context.
---

This section documents the complete development history of Soon, from initial setup to current state. Each guide represents a significant milestone in the project's evolution.

## Purpose

These guides serve multiple purposes:

- **Tutorial**: New developers can follow along to understand how the project was built
- **Context for AI**: Provides historical context for AI assistants working on the codebase
- **Living Documentation**: Grows alongside the project as new features are added
- **Decision Log**: Records architectural choices and their rationale

## Development Timeline

1. [Initial Turborepo Setup](./01-initial-turborepo-setup) - Creating the TurboRepo foundation with Bun
2. [Astro Documentation Site](./02-astro-docs) - Replacing Next.js docs with Starlight
3. [Claude Code Integration](./03-claude-code) - Setting up AI-assisted development
4. [Professional Claude Code Skills](./04-claude-skills) - Adding skills from Sentry and Vercel
5. [Convex Backend](./05-convex-backend) - Setting up Convex as the backend
6. [Turborepo Skill](./06-turborepo-skill) - Adding Turborepo-specific Claude skill
7. [shadcn/ui Components](./07-shadcn-ui-components) - Building the shared UI component library
8. [Better Auth Integration](./08-better-auth) - Adding authentication with Better Auth
9. [Biome Migration](./09-biome-migration) - Migrating from ESLint/Prettier to Biome
10. [Vitest Testing Setup](./10-vitest-testing) - Configuring Vitest for testing
11. [Authentication](./11-authentication) - Implementing the authentication flow
12. [Better Convex Migration](./12-better-convex-migration) - Migrating to better-convex patterns
13. [Shared Validators Package](./13-shared-validators) - Creating shared validation utilities
14. [oxlint + Prettier Migration](./14-oxlint-prettier-migration) - Replacing Biome with oxlint and Prettier
15. [Auto-Generated Skills Docs](./15-skills-documentation) - Documenting Claude Code skills
16. [Better Convex Folder Structure](./16-better-convex-folder-structure) - Fixing folder structure and type inference
17. [Things Description & Image](./17-things-description-image) - Adding file uploads and descriptions
18. [Setting Up CI](./18-setting-up-ci) - GitHub Actions CI/CD with Turborepo caching
19. [Testing Better Convex](./19-convex-test-with-better-convex) - Using convex-test with Better Convex functions

## Documentation Pattern

Each guide follows a consistent structure:

- **What**: What was accomplished
- **Why**: Rationale behind the decision
- **How**: Step-by-step implementation
- **Commands**: Exact commands used (for reproducibility)
- **Outcomes**: What changed in the codebase
- **Context for AI**: Key details AI assistants should know

## Reading These Guides

- Read sequentially for the full development story
- Jump to specific guides for focused learning
- Use as reference when making similar decisions
- Update guides when revisiting or modifying features
