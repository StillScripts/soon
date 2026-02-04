# Handle New Task - Complete Feature Workflow

This skill documents the comprehensive workflow for completing a new feature in this codebase, from branch creation to PR creation.

## When to Use This Skill

Use this skill when:

- Implementing a new feature from scratch
- Following the full development workflow
- Need a checklist of all steps for feature completion
- Training new developers on the project workflow

## Complete Workflow

### Step 1: Create Feature Branch

Use the `/checkout` skill to create a properly named branch:

```bash
# Example: feature/add-user-notifications
git checkout -b feature/<descriptive-name>
```

Branch naming conventions:

- `feature/` - New features
- `chore/` - Maintenance tasks
- `hotfix/` - Bug fixes

### Step 2: Research and Plan

Before coding:

1. **Fetch external documentation** if integrating new libraries
2. **Explore the codebase** to understand existing patterns
3. **Identify affected files** and integration points
4. **Consider the architecture** - where should new code live?

Use the Task tool with appropriate agents:

- `Explore` agent for codebase understanding
- `WebFetch` for external documentation

### Step 3: Implement the Feature

Follow project conventions:

- Use existing patterns from the codebase
- Place code in appropriate locations (packages vs apps)
- Add proper TypeScript types
- Include JSDoc comments for public APIs
- Follow the style guide (oxlint + Prettier)

### Step 4: Run Quality Checks

Run all checks before committing:

```bash
# Type checking
turbo check-types --filter=<package>

# Linting
turbo lint --filter=<package>

# Formatting
bun format

# Tests
turbo test --filter=<package>
```

Fix any issues before proceeding.

### Step 5: Create Initial Commit

Use the `/commit` skill for professional commit messages:

```
feat(<scope>): <short description>

<detailed explanation of what and why>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Step 6: Run Code Simplifier Agent

After the initial commit, run the code simplifier agent:

```
Use the Task tool with subagent_type=code-simplifier
```

This agent will:

- Consolidate imports
- Remove unnecessary wrappers
- Extract reusable helpers
- Replace nested conditionals with clearer patterns

### Step 7: Commit Simplifications

If the code simplifier made changes:

```
ref(<scope>): Simplify <feature> code

<list of simplifications made>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Step 8: Document the Feature

Use the `/document-update` skill to create a development guide:

1. Determine next guide number: `ls apps/docs/src/content/docs/guides/`
2. Create guide: `apps/docs/src/content/docs/guides/NN-feature-name.md`
3. Update overview: `apps/docs/src/content/docs/guides/00-overview.md`
4. Update sidebar: `apps/docs/astro.config.mjs`

Documentation should include:

- What was done
- Why this approach
- Implementation details
- Integration points
- Context for AI assistants

### Step 9: Commit Documentation

```
docs: Add <feature> guide

Document the <feature> implementation:
- <key points covered>
- Update navigation in overview and astro config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Step 10: Create Pull Request

Use the `/create-pr` skill:

1. Push branch: `git push -u origin <branch-name>`
2. Create PR with gh CLI
3. Include:
   - Summary of changes
   - Why the changes were made
   - Links to relevant documentation

## Skills Used in This Workflow

| Step            | Skill              | Purpose                        |
| --------------- | ------------------ | ------------------------------ |
| Branch creation | `/checkout`        | Create properly named branch   |
| Research        | Task (Explore)     | Understand codebase            |
| Implementation  | Manual coding      | Write the feature              |
| Quality checks  | turbo commands     | Ensure code quality            |
| Initial commit  | `/commit`          | Professional commit message    |
| Code review     | code-simplifier    | Simplify and clean up code     |
| Documentation   | `/document-update` | Create development guide       |
| PR creation     | `/create-pr`       | Open pull request              |
| Skill docs      | `/document-skill`  | Document new skills if created |

## Agents Used in This Workflow

| Agent           | When to Use                       |
| --------------- | --------------------------------- |
| Explore         | Understanding codebase structure  |
| code-simplifier | Post-implementation code cleanup  |
| Plan            | Complex features requiring design |

## Quality Gates

Before each commit, ensure:

- [ ] Type checking passes (`turbo check-types`)
- [ ] Linting passes (`turbo lint`)
- [ ] Code is formatted (`bun format`)
- [ ] Tests pass (`turbo test`)

Before creating PR, ensure:

- [ ] Feature is complete and working
- [ ] Code has been simplified
- [ ] Documentation is updated
- [ ] All commits follow conventions

## Example: RSC Integration Feature

Here's how this workflow was applied for the Better Convex RSC integration:

1. **Checkout**: `git checkout -b feature/better-convex-rsc-integration`
2. **Research**: Fetched Better Convex RSC documentation
3. **Explore**: Used Explore agent to understand existing Convex setup
4. **Implement**: Created `rsc.tsx`, updated `page.tsx`, refactored components
5. **Quality**: Ran type check, lint, format, tests
6. **Commit**: `feat(web): Add RSC integration for Better Convex prefetching`
7. **Simplify**: Ran code-simplifier agent
8. **Commit**: `ref(web): Simplify RSC integration code`
9. **Document**: Created guide `23-better-convex-rsc.md`
10. **Commit**: `docs: Add RSC integration guide for Better Convex`
11. **PR**: Created PR #10

## Tips for Success

- **Read existing code first** - Understand patterns before implementing
- **Small, focused commits** - Each commit should be a single logical change
- **Document as you go** - Don't leave documentation until the end
- **Run checks frequently** - Catch issues early
- **Use the right agents** - Let specialized agents handle their areas

## Common Mistakes to Avoid

1. **Skipping quality checks** - Always run before committing
2. **Forgetting documentation** - Every significant feature needs a guide
3. **Monolithic commits** - Split into logical pieces
4. **Ignoring code simplifier** - Always run post-implementation
5. **Missing navigation updates** - Don't forget astro.config.mjs and 00-overview.md
