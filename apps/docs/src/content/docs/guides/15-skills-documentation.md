---
title: Auto-Generated Skills Documentation
description: Adding build-time generation of skills documentation from .claude/skills to the Astro docs site.
---

## What We Did

Added a build-time script that automatically generates documentation pages for all Claude Code skills from the `.claude/skills` directory. Skills are now browsable at `/skills/` in the docs site with an auto-generated sidebar.

## Why This Approach

**Key reasons:**

- **Single source of truth**: Skills are defined once in `.claude/skills/*/SKILL.md` and automatically appear in docs
- **Zero maintenance**: No need to manually update docs when skills are added or modified
- **Consistency**: Every skill with proper frontmatter gets documented the same way
- **Discoverable**: Users can browse all available skills in one place

**Alternatives considered:**

- **Manual documentation**: Would require updating two places whenever skills change
- **Symlinks**: Would work but Astro/Starlight doesn't handle symlinked content well
- **Git submodules**: Overcomplicated for this use case

## Implementation Details

### New Files Created

**`apps/docs/scripts/generate-skills.ts`**

A Bun script that:
1. Reads all directories in `.claude/skills/`
2. Parses `SKILL.md` files for frontmatter (`name`, `description`) and content
3. Generates individual markdown files in `src/content/docs/skills/`
4. Creates an index page listing all skills

```typescript
// Key interfaces
interface SkillMeta {
  name: string
  description: string
  content: string
  dirName: string
}
```

### Configuration Changes

**`apps/docs/package.json`**

Added `generate:skills` script that runs before dev and build:

```json
{
  "scripts": {
    "generate:skills": "bun scripts/generate-skills.ts",
    "dev": "bun run generate:skills && astro dev",
    "build": "bun run generate:skills && astro build"
  }
}
```

**`apps/docs/astro.config.mjs`**

Added Skills section to sidebar using Starlight's autogenerate feature:

```javascript
{
  label: "Skills",
  autogenerate: { directory: "skills" },
}
```

**`apps/docs/.gitignore`**

Added generated skills directory to gitignore since it's created at build time:

```
# generated skills docs (from .claude/skills)
src/content/docs/skills/
```

### Skill File Requirements

For a skill to appear in the docs, its `SKILL.md` must have valid frontmatter:

```markdown
---
name: skill-name
description: Brief description of what the skill does
---

# Skill Content

The rest of the markdown content...
```

Skills missing the `name` field in frontmatter are skipped with a warning.

## Commands Used

```bash
# Generate skills documentation manually
bun run generate:skills

# Run docs dev server (auto-generates skills first)
turbo dev --filter=docs

# Build docs (auto-generates skills first)
turbo build --filter=docs
```

## Integration with Existing Code

The script integrates with the existing docs architecture:

- **Starlight sidebar**: Uses `autogenerate` to create sidebar entries from the generated files
- **Astro content collections**: Generated markdown files are valid Astro content
- **Build pipeline**: Runs as a prebuild step, fitting into Turborepo's task system

## Context for AI

When working with skills documentation:

- Skills source: `.claude/skills/*/SKILL.md`
- Generated output: `apps/docs/src/content/docs/skills/*.md`
- The generated files are gitignored - don't commit them
- To add a new skill to docs, just create `SKILL.md` with proper frontmatter
- The index page at `/skills/` is auto-generated with links to all skills

## Outcomes

### Before

- Skills were documented manually in guide 04-claude-skills.md
- Adding new skills required updating documentation separately
- No browsable skills reference in the docs site

### After

- 30 skills automatically documented at `/skills/`
- Each skill has its own page with full content
- Index page lists all skills with descriptions
- New skills appear automatically on next build

## Testing/Verification

```bash
# Generate and verify skill count
cd apps/docs && bun run generate:skills
# Should output: Found 30 skills

# Verify files were created
ls src/content/docs/skills/

# Run dev server and browse to /skills/
turbo dev --filter=docs
```

Expected results:

- Skills index page at `http://localhost:4321/skills/`
- Individual skill pages like `/skills/commit/`, `/skills/convex/`, etc.
- Sidebar shows "Skills" section with all skills listed

## Related Documentation

- [Professional Claude Code Skills](./04-claude-skills) - Original skills introduction
- [Astro Documentation Site](./02-astro-docs) - Docs site setup
