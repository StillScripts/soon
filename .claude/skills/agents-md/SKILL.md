# AGENTS.md Maintenance Skill

This documentation covers creating and maintaining minimal agent-facing instructions.

## Core Purpose

AGENTS.md serves as "the canonical agent-facing documentation" kept deliberately sparse. The guidance emphasizes that AI assistants are capable and don't require extensive hand-holding.

## Setup Steps

Create the file at project root and establish a symlink connecting it to CLAUDE.md for convenience.

## Key Principles

Before writing, discover local skills via filesystem inspection. The documentation should feature headers, bullets, and code blocks rather than prose paragraphs.

Reference existing skills rather than duplicating their content. For example: "Use `db-migrate` skill. See `.claude/skills/db-migrate/SKILL.md`"

## Required Sections

**Package Manager** – List the tool and essential commands only.

**Commit Attribution** – Specify that AI contributions must include proper co-authorship attribution with the model's name.

**Key Conventions** – Project-specific patterns to follow, kept brief.

**Local Skills** – Reference each discovered skill with its location.

## Content to Avoid

Omit introductory phrases, patronizing language ("you should"), duplicated skill content, obvious instructions, explanations of reasoning, and lengthy paragraphs.

The goal is creating documentation that respects agents' capabilities while ensuring consistency across the project.
