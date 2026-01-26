---
name: create-pr
description: Create pull requests following professional conventions. Use when creating PRs in repositories.
---

# Create Pull Request - Professional Engineering Guide

This documentation outlines how to create pull requests following professional conventions and code review practices.

## Key Prerequisites

Before opening a PR, ensure all changes are committed. The guide recommends checking git status and using the `commit` skill if uncommitted changes exist.

## Main Process Steps

The workflow involves four primary stages:

1. **Verify Branch State** - Confirm all changes are committed and the branch is synchronized with the base branch
2. **Analyze Changes** - Review commits and full diffs to understand what will be included
3. **Write Description** - Follow repository PR templates or use a structured format emphasizing the "what" and "why"
4. **Create the PR** - Use GitHub CLI with properly formatted titles

## PR Description Standards

Descriptions should "Explain the why - Code shows what; description explains why." The guide explicitly states NOT to include test plan sections or checkbox lists. Instead, provide clear explanations, relevant issue links, and context that isn't obvious from code review.

## Title Format

PR titles follow commit conventions using this pattern: `type(scope): description` (examples: `feat(scope): Add new feature` or `fix(scope): Fix the bug`)

## Issue References

The guide provides specific syntax for linking issues, including `Fixes #1234` to auto-close GitHub issues, and `Refs` variations for non-closing links.

## Example PR Description

```markdown
## Summary

This PR adds user authentication to the application using JWT tokens.

## Changes

- Add JWT authentication middleware
- Create login and logout endpoints
- Add token refresh mechanism
- Update user model with password hashing

## Why

We need secure authentication to protect user data and enable
personalized features. JWT was chosen because it's stateless
and works well with our microservices architecture.

## Related Issues

Fixes #1234
Refs #5678
```

## References

- [Professional PR Guidelines](https://develop.sentry.dev/engineering-practices/) - Industry standards from Sentry
