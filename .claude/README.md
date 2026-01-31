# Claude Code Configuration

Skills and agents for Claude Code integration.

## Structure

```
.claude/
├── agents/             # Autonomous AI agents
│   └── code-simplifier.md
└── skills/             # Skill instructions
    ├── convex/         # Convex development (with references/)
    ├── vitest/         # Testing framework (with references/)
    ├── turborepo/      # Build system guidance
    ├── commit/         # Commit conventions
    ├── create-pr/      # PR creation
    ├── code-review/    # Code review
    ├── find-bugs/      # Security auditing
    └── ...
```

## Skills

Invoke skills with `/skill-name`:

| Skill | Purpose |
|-------|---------|
| `/commit` | Create well-formatted commits |
| `/create-pr` | Create professional pull requests |
| `/code-review` | Thorough code reviews |
| `/find-bugs` | Security and bug auditing |
| `/convex` | Convex development patterns |
| `/vitest` | Testing with Vitest |
| `/turborepo` | Monorepo build guidance |

## Agents

| Agent | Purpose |
|-------|---------|
| `code-simplifier` | Refines code for clarity (runs proactively) |

## Sources

Skills adapted from:

- [Sentry Skills](https://github.com/getsentry/skills) - Professional development workflows
- [Vercel Skills](https://github.com/vercel-labs/agent-skills) - React/Next.js best practices
- [Anthony Fu's Skills](https://github.com/antfu/skills) - Vitest documentation
