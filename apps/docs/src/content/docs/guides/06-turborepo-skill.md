---
title: Turborepo Skill
description: Adding the /turborepo Claude Code skill for comprehensive monorepo build system guidance.
---

## What We Did

Added the `/turborepo` skill to `.claude/skills/turborepo/` providing comprehensive guidance for Turborepo monorepo configuration and best practices.

## Why This Skill

This repository uses Turborepo as its monorepo build system. While CLAUDE.md contains basic commands, developers (and AI assistants) often need deeper guidance on:

- **Task configuration**: `dependsOn`, `outputs`, `inputs`, caching strategies
- **Anti-patterns**: Common mistakes that defeat Turborepo's benefits
- **Environment variables**: Strict mode, cache invalidation, `.env` handling
- **CI optimization**: `--affected` flag, remote caching, GitHub Actions setup
- **Package structure**: When to create packages, internal vs external, boundaries

The `/turborepo` skill provides this context on-demand without cluttering CLAUDE.md.

## Skill Structure

```
.claude/skills/turborepo/
├── SKILL.md                 # Main skill with decision trees and patterns
├── command/
│   └── turborepo.md         # CLI command reference
└── references/
    ├── best-practices/
    │   ├── dependencies.md
    │   ├── packages.md
    │   └── structure.md
    ├── caching/
    │   ├── gotchas.md
    │   └── remote-cache.md
    ├── ci/
    │   ├── github-actions.md
    │   ├── patterns.md
    │   └── vercel.md
    ├── cli/
    │   └── commands.md
    ├── configuration/
    │   ├── global-options.md
    │   ├── gotchas.md
    │   └── tasks.md
    ├── environment/
    │   ├── gotchas.md
    │   └── modes.md
    └── filtering/
        └── patterns.md
```

## Key Features

### Decision Trees

Quick navigation for common scenarios:

- "I need to configure a task"
- "My cache isn't working"
- "I want to run only changed packages"
- "Environment variables aren't working"

### Critical Anti-Patterns

Comprehensive list of mistakes to avoid:

- Using `turbo` shorthand in package.json (use `turbo run`)
- Root scripts bypassing Turborepo
- `prebuild` scripts manually building dependencies
- Root `.env` file in monorepo
- Missing `outputs` for file-producing tasks

### Configuration Patterns

Standard patterns for common setups:

- Build pipelines with `^build` dependencies
- Transit nodes for parallel tasks with cache invalidation
- Dev tasks with `turbo watch`
- Environment variable handling

## Usage

Invoke the skill when working with Turborepo configuration:

```
/turborepo
```

**Common scenarios:**

- Configuring a new task in `turbo.json`
- Debugging cache misses
- Setting up CI with `--affected`
- Creating a new internal package
- Adding environment variables

## Example: Fixing a Cache Issue

When cache hits aren't happening as expected:

```
/turborepo

"My build task keeps running even though nothing changed"
```

The skill guides through:

1. Checking if `outputs` is configured
2. Verifying environment variables are in `env`
3. Ensuring `.env` files are in `inputs`
4. Using `--summarize` to debug hash inputs

## References

- [Turborepo Documentation](https://turborepo.dev/docs)
- Skill source: `.claude/skills/turborepo/SKILL.md`
- Based on Turborepo v2.7.6 documentation
