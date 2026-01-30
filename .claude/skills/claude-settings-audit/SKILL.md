---
name: claude-settings-audit
description: Generate recommended settings.json permissions based on detected tech stacks and tools. Use when auditing or configuring Claude Code permissions.
---

# Claude Settings Audit - Complete Documentation

## Overview

This is Claude Code's official audit tool for generating recommended `settings.json` permissions. It systematically detects tech stacks, services, and build tools to create tailored read-only command allowlists.

## Core Process

**Phase 1** scans for indicator files across Node.js, Go, Rust, Ruby, Java, Docker, Kubernetes, and monorepo frameworks using targeted filesystem checks.

**Phase 2** identifies service integrations by examining dependency files and configuration directories.

**Phase 3** checks for existing permission configurations in `.claude/settings.json`.

**Phase 4** generates recommendations by combining baseline commands with stack-specific tools.

## Key Allowlist Categories

**Baseline** includes universal commands: file operations (`ls`, `cat`, `find`), git introspection (`git status`, `git log`, `git diff`), and GitHub CLI queries (`gh pr view`, `gh issue list`).

**Language-Specific** entries vary by detected lock files—pnpm/yarn/npm/bun for Node.js depending on which lock file exists, cargo for Rust, go.mod for Go, etc.

**Build Tools** add Docker, Terraform, and Makefile inspection commands if those systems are present.

## Critical Constraints

The tool explicitly prohibits:

- Absolute file paths (no `/home/user/scripts/foo`)
- Custom project scripts with potential side effects
- Alternative package managers (if pnpm detected, exclude npm/yarn)
- State-modifying commands (no install, build, run, or delete operations)

Commands use the `:*` syntax to permit any arguments to the base tool.

## MCP and WebFetch Integration

Framework detection enables domain-specific documentation access (React docs, Terraform registry, etc.).

The output format groups permissions by category with explanatory comments and includes merge instructions when existing settings are found.
