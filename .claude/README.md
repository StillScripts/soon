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
    ├── create-pr/
    ├── doc-coauthoring/
    ├── find-bugs/
    └── iterate-pr/
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

### create-pr
Create pull requests with clear descriptions and proper formatting.

### doc-coauthoring
Collaborative workflow for creating substantial documentation, proposals, specs, or RFCs.

### find-bugs
Systematic security and bug finding using comprehensive checklists.

### iterate-pr
Automatically iterate on PRs until CI passes and all feedback is addressed.

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

Adapted from Sentry's open-source skills:
https://github.com/getsentry/skills

Modified for general professional use while maintaining references to Sentry's excellent documentation as industry best practices.
