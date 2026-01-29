---
title: Professional Claude Code Skills
description: Adding battle-tested skills and agents from Sentry and Vercel for professional development workflows.
---

## What We Did

Added professional-grade Claude Code skills and agents from industry leaders Sentry and Vercel to enhance our AI-assisted development workflow.

## Why Add Professional Skills

While Claude Code is powerful out of the box, **professional skills provide battle-tested workflows** that have been refined through real-world usage at leading engineering organizations.

**Key Benefits:**

- **Proven Best Practices**: Skills created by industry-leading engineering teams
- **Standardized Workflows**: Consistent approaches to commits, PRs, code reviews, and documentation
- **Security-First**: Built-in security auditing and bug-finding checklists
- **Performance Optimization**: Vercel's React/Next.js performance guidelines (57 rules)
- **Accessibility & UX**: Web design guidelines covering 100+ rules
- **Time Savings**: Automated PR iteration until CI passes

## Sources

### Sentry Skills

Adapted from [Sentry's professional skills repository](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills).

Sentry's engineering team maintains these skills for their own development workflow. We adapted them for general professional use by:

- Removing organization-specific references
- Making examples framework-agnostic
- Keeping Sentry documentation links as industry best practices

### Vercel Skills

From [Vercel Labs agent-skills repository](https://github.com/vercel-labs/agent-skills).

Official React and Next.js best practices from Vercel Engineering, the creators of Next.js.

## What Was Created

### Directory Structure

```
.claude/
├── agents/
│   ├── README.md
│   └── code-simplifier.md          # Opus-powered code refinement
└── skills/
    ├── agents-md/                  # AGENTS.md/CLAUDE.md maintenance
    ├── brand-guidelines/           # Professional UI copy guidelines
    ├── claude-settings-audit/      # Settings recommendations
    ├── code-review/                # Security & quality reviews
    ├── commit/                     # Professional commit messages
    ├── create-pr/                  # PR creation workflow
    ├── doc-coauthoring/            # Collaborative documentation
    ├── find-bugs/                  # Systematic security auditing
    ├── iterate-pr/                 # Auto-fix CI failures
    ├── vercel-react-best-practices/ # React/Next.js optimization
    └── web-design-guidelines/      # UI/UX best practices
```

### Documentation

- `.claude/README.md`: Overview of all skills and agents
- `CLAUDE.md`: Updated with skills reference

## Available Skills

### From Sentry

#### `/commit`

Create well-formatted commit messages following professional conventions.

- Conventional commit format (`type(scope): message`)
- Includes AI co-authorship attribution
- Professional commit history standards

#### `/create-pr`

Create pull requests with clear descriptions and proper formatting.

- Structured PR descriptions (Summary, Changes, Why, Related Issues)
- Professional PR conventions
- Repository template integration

#### `/code-review`

Perform thorough code reviews covering security, performance, testing, and design.

- Security vulnerability scanning
- Performance analysis
- Test coverage verification
- Design pattern validation

#### `/find-bugs`

Systematic security and bug finding using comprehensive checklists.

- 5-phase process: input gathering, attack surface mapping, security checklist, verification, audit
- OWASP security checks
- Race condition detection
- Business logic validation

#### `/iterate-pr`

Automatically iterate on PRs until CI passes and all feedback is addressed.

- Monitors CI status
- Gathers review feedback
- Investigates failures
- Commits fixes and repeats

#### `/brand-guidelines`

Write user-facing copy following professional brand guidelines.

- Plain Speech (default): clear, direct, professional
- Brand Voice: warm, confident, for marketing contexts
- Consistent tone across application

#### `/doc-coauthoring`

Collaborative workflow for creating substantial documentation, proposals, specs, or RFCs.

- 3-stage process: context gathering, refinement & structure, reader testing
- Prevents context bleed
- Validates documentation effectiveness

#### `/agents-md`

Maintain minimal agent-facing documentation (AGENTS.md/CLAUDE.md).

- Living documentation standards
- Focus on "why" over "what"
- Essential context for AI assistants

#### `/claude-settings-audit`

Generate recommended `settings.json` permissions based on detected tech stacks and tools.

- Analyzes codebase for tools used
- Recommends safe permission scopes
- Tech stack detection

### From Vercel

#### `/vercel-react-best-practices`

React and Next.js performance optimization guidelines from Vercel Engineering.

- 57 rules across 8 categories
- Waterfall optimization
- Bundle size reduction
- Server-side performance
- Re-render optimization
- Best practices from Next.js creators

#### `/web-design-guidelines`

Review UI code for Web Interface Guidelines compliance.

- 100+ rules
- Accessibility (WCAG compliance)
- Performance optimization
- Form best practices
- Animation guidelines
- Responsive design patterns

## Available Agents

### `code-simplifier`

Automatically refines code for clarity, consistency, and maintainability while preserving all functionality.

- Runs proactively on recently modified code
- Powered by Claude Opus for maximum quality
- Non-invasive: preserves functionality
- Focuses on readability and consistency

## Usage

Skills are invoked with the `/skill-name` format in Claude Code:

```bash
# Create a commit
/commit

# Create a pull request
/create-pr

# Review code for security issues
/code-review

# Find bugs systematically
/find-bugs

# Iterate on PR until CI passes
/iterate-pr

# Check React best practices
/vercel-react-best-practices

# Audit web design guidelines
/web-design-guidelines

# Collaborative documentation
/doc-coauthoring
```

Agents run automatically based on their configured triggers (like `code-simplifier` watching for file changes).

## Integration with Workflow

### Development Cycle

1. **Write code** with Claude Code assistance
2. **Review** with `/code-review` or `/find-bugs`
3. **Commit** using `/commit` for professional messages
4. **Create PR** with `/create-pr`
5. **Iterate** using `/iterate-pr` until CI passes

### Code Quality

- **Before committing**: Run `/find-bugs` for security review
- **Before PR**: Run `/code-review` for quality check
- **After changes**: Let `code-simplifier` agent refine code
- **React/Next.js**: Use `/vercel-react-best-practices` for optimization

### Documentation

- **Large docs**: Use `/doc-coauthoring` for structured workflow
- **Agent docs**: Use `/agents-md` for CLAUDE.md maintenance
- **UI copy**: Use `/brand-guidelines` for consistent tone

## Git History

The skills were added through several commits:

```bash
c2152dd Add `vercel-labs/agent-skills`
96b77a7 Add `code-simplifier.md` Agent
084a591 Add Sentry skills
146832e Update docs related to skills
```

## Best Practices

### When to Use Skills

**Always use:**

- `/commit` for every commit (consistent message format)
- `/create-pr` for pull requests (professional descriptions)
- `/iterate-pr` when CI fails (automated fixing)

**Regularly use:**

- `/code-review` before PRs (quality gate)
- `/find-bugs` for sensitive code changes (security)
- `/vercel-react-best-practices` for React/Next.js work

**As needed:**

- `/doc-coauthoring` for substantial documentation
- `/brand-guidelines` for UI copy
- `/web-design-guidelines` for UI components

### Skill Composition

Skills can be chained together:

1. Write code
2. `/code-review` to find issues
3. Fix issues
4. `/commit` to create commit
5. `/create-pr` to open PR
6. `/iterate-pr` to handle CI failures

## Attribution

These skills represent industry best practices from:

- **Sentry**: Professional software engineering workflows
- **Vercel**: React and Next.js performance optimization

Both organizations generously open-sourced their internal tooling for the broader development community.

## Living Skills

Skills are living documents that evolve:

- Updated as best practices change
- Extended with new patterns
- Refined through usage
- Contributed back to upstream repositories when appropriate

## Next Steps

As we use these skills:

- Document which skills work best for our workflow
- Create custom skills for project-specific patterns
- Contribute improvements back to Sentry and Vercel
- Share learnings with the development community
