---
name: checkout
description: Create new branches with proper naming conventions. Use when starting new features, chores, or bug fixes.
---

# Branch Checkout Workflow

Follow this workflow when creating new branches for development work.

## Branch Naming Conventions

| Prefix     | Purpose                                 | Example                   |
| ---------- | --------------------------------------- | ------------------------- |
| `feature/` | New features or enhancements            | `feature/user-auth`       |
| `chore/`   | Maintenance, refactoring, tooling, docs | `chore/update-deps`       |
| `hotfix/`  | Bug fixes, urgent patches               | `hotfix/null-pointer-fix` |

### Naming Rules

- Use lowercase with hyphens: `feature/add-user-auth` not `feature/AddUserAuth`
- Keep names short but descriptive (2-4 words)
- Reference issue numbers when applicable: `hotfix/fix-login-123`

## Pre-Flight Checks

Before creating a new branch, verify you're in a clean state.

### Step 1: Check Current Branch

```bash
git branch --show-current
```

**If not on `main`:** You may be in the middle of another task. Either:

- Finish and commit current work, then switch to main
- Stash changes with `git stash` if you need to switch temporarily
- Abort if you should complete the current task first

### Step 2: Check for Uncommitted Changes

```bash
git status --porcelain
```

**If there are changes:** Do not create a new branch. Either:

- Commit the changes to the current branch
- Stash with `git stash push -m "WIP: description"`
- Discard if truly unwanted with `git checkout .`

### Step 3: Ensure Main is Up-to-Date

```bash
git pull origin main
```

This ensures your new branch starts from the latest code.

## Creating the Branch

Only after all checks pass:

```bash
git checkout -b <prefix>/<branch-name>
```

### Examples

```bash
# Starting a new feature
git checkout -b feature/oauth-login

# Maintenance task
git checkout -b chore/prettier-config

# Bug fix
git checkout -b hotfix/fix-auth-redirect
```

## Complete Workflow Example

```bash
# 1. Ensure you're on main
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Create and switch to new branch
git checkout -b feature/add-notifications
```

## When NOT to Create a New Branch

Stop and reconsider if:

- **You have uncommitted changes** - Commit or stash first
- **You're not on main** - You might be abandoning work in progress
- **Main is behind remote** - Pull first to avoid merge conflicts later
- **The task is trivial** - Single-line fixes might not need a branch

## Quick Reference

| Situation                  | Action                       |
| -------------------------- | ---------------------------- |
| On main, clean state       | Safe to create branch        |
| On main, uncommitted work  | Commit or stash first        |
| On feature branch          | Finish current work or stash |
| Main behind remote         | `git pull origin main` first |
| Need to switch temporarily | `git stash` then switch      |
