# Development Journey Guides

This directory contains chronological documentation of how the Ember application was built.

## Purpose

These guides serve as:

- **Living Tutorial**: New developers can follow the journey from start to current state
- **AI Context**: Provides comprehensive context for AI assistants (especially Claude Code)
- **Decision Log**: Records why architectural choices were made
- **Onboarding**: Helps new team members understand the project's evolution

## Structure

Guides are numbered sequentially to show chronological order:

- `00-overview.md` - Overview and reading guide
- `01-initial-setup.md` - First step in the journey
- `02-astro-docs.md` - Second step
- `03-claude-code.md` - Third step
- etc.

## Adding New Guides

### 1. Copy the Template

```bash
cp _template.md 0X-your-feature-name.md
```

Replace `X` with the next sequential number.

### 2. Fill in All Sections

Follow the template structure:

- What We Did
- Why This Approach
- Commands Used
- Implementation Details
- Context for AI
- etc.

### 3. Update Sidebar

Edit `apps/docs/astro.config.mjs` and add your guide to the "Development Journey" section:

```javascript
{
  label: 'Development Journey',
  items: [
    // ... existing guides
    { label: 'Your Feature Name', slug: 'guides/0X-your-feature-name' },
  ],
}
```

### 4. Delete Template Comments

Remove the comment block at the top of your new guide.

## Writing Guidelines

### Be Specific

- Include exact commands used
- Show actual configuration snippets
- Reference specific files and line numbers when relevant

### Explain Why

- Don't just document what was done
- Explain the reasoning behind decisions
- Document alternatives that were considered

### Think About AI

- Include a "Context for AI" section
- Document non-obvious patterns
- Explain architectural decisions that span multiple files

### Stay Chronological

- Each guide should build on previous ones
- Reference earlier guides when relevant
- Update the overview when adding new guides

### Use Consistent Format

- Follow the template structure
- Use proper Markdown frontmatter
- Include code examples in fenced blocks

## Maintenance

- Update guides if the implementation changes significantly
- Add deprecation notices if approaches are superseded
- Keep the overview page updated with new guides
- Ensure all guides are linked in the Astro config sidebar

## For AI Assistants

When asked to add documentation:

1. Copy `_template.md` to a new numbered file
2. Fill in all sections completely
3. Update `astro.config.mjs` sidebar
4. Follow the established patterns in existing guides
5. Focus on providing context, not just commands
