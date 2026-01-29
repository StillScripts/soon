# Claude Code Configuration

This directory contains agents and skills for Claude Code integration.

## Source

These agents and skills are adapted from [Sentry's professional skills repository](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills), modified for general professional use.

## Structure

```
.claude/
├── agents/              # Autonomous AI agents
│   ├── README.md
│   └── code-simplifier.md
└── skills/              # Skill instructions for Claude
    ├── agents-md/
    ├── brand-guidelines/
    ├── claude-settings-audit/
    ├── code-review/
    ├── commit/
    ├── convex/
    ├── create-pr/
    ├── doc-coauthoring/
    ├── document-skill/
    ├── document-update/
    ├── find-bugs/
    ├── iterate-pr/
    ├── turborepo/
    ├── vercel-react-best-practices/
    ├── vitest/
    └── web-design-guidelines/
```

## Available Agents

### code-simplifier

Automatically refines code for clarity, consistency, and maintainability while preserving all functionality. Works proactively on recently modified code.

## Available Skills

### agents-md

Maintain minimal agent-facing documentation (AGENTS.md/CLAUDE.md).

### brand-guidelines

Write user-facing copy following professional brand guidelines. Covers Plain Speech (default) and Brand Voice for appropriate contexts.

### claude-settings-audit

Generate recommended `settings.json` permissions based on detected tech stacks and tools.

### code-review

Perform thorough code reviews covering security, performance, testing, and design.

### commit

Create well-formatted commit messages following professional conventions.

### convex

Guidelines and best practices for building Convex projects. Comprehensive reference covering database schema design, queries, mutations, actions, validators, TypeScript patterns, and real-world examples.

### create-pr

Create pull requests with clear descriptions and proper formatting.

### doc-coauthoring

Collaborative workflow for creating substantial documentation, proposals, specs, or RFCs.

### document-skill

Document new Claude Code skills added to the repository. Updates all relevant documentation files (.claude/README.md, CLAUDE.md) and optionally creates development journey guides.

### document-update

Document development updates in the guides folder. Use when significant features, packages, or architectural changes are made.

### find-bugs

Systematic security and bug finding using comprehensive checklists.

### iterate-pr

Automatically iterate on PRs until CI passes and all feedback is addressed.

### turborepo

Turborepo monorepo build system guidance. Covers task configuration, caching, remote cache, CI optimization, environment variables, filtering, and monorepo best practices. Based on official Turborepo v2.7.6 documentation.

### vercel-react-best-practices

React and Next.js performance optimization guidelines from Vercel Engineering. 57 rules across 8 categories including waterfalls, bundle size, server-side performance, and re-render optimization.

### vitest

A blazing fast unit testing framework powered by Vite. Comprehensive reference covering configuration, CLI, test/describe/expect APIs, mocking, snapshots, coverage, concurrent testing, and advanced features like type testing and multi-project workspaces. Based on official Vitest documentation.

### web-design-guidelines

Review UI code for Web Interface Guidelines compliance. Checks accessibility, performance, forms, animations, and more against 100+ rules.

## Usage

These skills and agents are automatically available in Claude Code when working in this repository. To invoke a skill:

```
/skill-name
```

For example:

```
/commit
/create-pr
/code-review
```

Agents run automatically based on their configured triggers, or can be manually invoked through Claude Code's agent system.

## Attribution

**Sentry Skills** - Adapted from:
https://github.com/getsentry/skills

Modified for general professional use while maintaining references to Sentry's excellent documentation as industry best practices.

**Vercel Skills** - From:
https://github.com/vercel-labs/agent-skills

Official React/Next.js best practices and web design guidelines from Vercel Engineering.

**Anthony Fu's Skills** - From:
https://github.com/antfu/skills

Auto-generated skills from official documentation including Vitest testing framework guidance.

**Convex Skills** - Custom skill developed for this project to provide comprehensive Convex development guidelines and best practices.
