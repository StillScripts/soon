---
name: document-update
description: Document development updates in the guides folder. Use when significant features, packages, or architectural changes are made to the project.
---

# Document Development Update

Create chronological documentation for significant project changes in the development journey guides.

## When to Use This Skill

Use this skill whenever:
- New packages or dependencies are added
- Major features are implemented
- Architectural decisions are made
- Development tools or workflows are introduced
- Infrastructure changes occur
- Any change that future developers or AI assistants should understand

## Process

### Step 1: Identify Next Guide Number

Check existing guides to determine the next sequential number:

```bash
ls apps/docs/src/content/docs/guides/
```

Guides use format: `NN-descriptive-name.md` (e.g., `05-convex-backend.md`)

### Step 2: Read the Template

Read the guide template for structure:

```bash
cat apps/docs/src/content/docs/guides/_template.md
```

### Step 3: Gather Context

Before writing, gather all relevant information:
- Read relevant `package.json` files to understand what was added
- Check recent git commits: `git log --oneline -10`
- Review configuration files if applicable
- Understand the "why" behind the change, not just the "what"

### Step 4: Create the Guide

Create a new guide file following this structure:

**Frontmatter:**
```markdown
---
title: Descriptive Title
description: Brief description of what this update covers.
---
```

**Required Sections:**
1. **What We Did** - Clear, concise summary of the changes
2. **Why [Technology/Change]** - Explain the reasoning and benefits
3. **What Was Added/Created** - Detailed breakdown of files, packages, configurations
4. **Integration Points** - How this connects with existing code
5. **Commands/Usage** - How to use the new feature (if applicable)
6. **References** - Links to documentation, related guides, or external resources

**Best Practices:**
- Explain the "why" extensively - code shows "what", docs explain "why"
- Include actual code snippets where helpful
- Link to official documentation
- Note any important gotchas or considerations
- Keep future developers and AI assistants in mind as the audience

### Step 5: Update Sidebar Navigation

Update `apps/docs/astro.config.mjs` to include the new guide:

```javascript
{
  label: 'Development Journey',
  items: [
    // ... existing items
    { label: 'New Guide Title', slug: 'guides/NN-guide-name' },
  ],
},
```

Maintain chronological order.

### Step 6: Verify

1. Check that frontmatter is valid YAML
2. Ensure markdown formatting is correct
3. Verify the guide appears in the docs sidebar
4. Run the docs dev server if needed: `turbo dev --filter=docs`

## Example: Documenting a New Package

**Scenario:** Added Convex for backend

**Guide structure:**
```markdown
---
title: Convex Backend
description: Adding Convex as the real-time backend database.
---

## What We Did

Added Convex to `packages/backend` as the application's backend-as-a-service solution.

## Why Convex

[Explain benefits: real-time, serverless, TypeScript-first, etc.]

## What Was Added

**Package:** `packages/backend`
- Added `convex` dependency (^1.31.6)
- Created backend package structure

**Configuration:**
[Details about setup]

## Integration Points

[How it connects to the web app, etc.]

## Usage

[Basic examples of how to use Convex]

## References

- [Convex Documentation](https://docs.convex.dev)
```

## File Naming Convention

Use descriptive, kebab-case names:
- `05-convex-backend.md` ✓
- `06-authentication-system.md` ✓
- `07-ui-component-library.md` ✓

NOT:
- `update.md` ✗
- `new-feature.md` ✗
- `05.md` ✗

## Template Reference

Always refer to `apps/docs/src/content/docs/guides/_template.md` for the canonical structure.

## Common Mistakes to Avoid

1. **Don't skip the "why"** - This is the most valuable part
2. **Don't just list what changed** - Explain the reasoning and context
3. **Don't forget to update sidebar** - The guide won't appear otherwise
4. **Don't use generic titles** - Be specific about what this guide covers
5. **Don't forget code examples** - Show how things work in practice

## Output

After creating the guide:
1. Confirm the file was created at the correct path
2. Confirm the sidebar was updated
3. Provide a brief summary of what was documented
4. Note the guide number for reference

This ensures the development journey remains comprehensive and valuable for future developers and AI assistants.
