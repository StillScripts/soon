---
name: document-skill
description: Document adding new Claude Code skills to the repository. Use when a new skill is added to .claude/skills/ to update all relevant documentation.
---

# Document Skill Addition

Create documentation for new Claude Code skills added to the repository.

## When to Use This Skill

Use this skill whenever:

- A new skill is added to `.claude/skills/`
- An existing skill is significantly updated
- Skill documentation needs to be synchronized across files

## Files to Update

When documenting a new skill, update these files:

1. **`.claude/README.md`** - Add skill to structure and Available Skills section
2. **`CLAUDE.md`** - Add skill to Available Skills list
3. **`apps/docs/src/content/docs/guides/`** - Create a development journey guide (optional, for significant skills)
4. **`apps/docs/astro.config.mjs`** - Update sidebar if guide is created

## Process

### Step 1: Read the New Skill

Read the skill's `SKILL.md` to understand:

- What the skill does
- When to use it
- Key features and patterns

```bash
cat .claude/skills/<skill-name>/SKILL.md
```

### Step 2: Update .claude/README.md

Add the skill to the structure tree:

```markdown
└── skills/
├── ...existing skills...
├── <skill-name>/
...
```

Add a description under **Available Skills**:

```markdown
### <skill-name>

Brief description of what the skill does and when to use it.
```

### Step 3: Update CLAUDE.md

Add the skill to the **Available Skills** list:

```markdown
**Available Skills:**

- ...existing skills...
- `/<skill-name>` - Brief description
```

### Step 4: Create Development Guide (for significant skills)

For major skills that add significant functionality, create a guide:

1. Determine next guide number:

   ```bash
   ls apps/docs/src/content/docs/guides/
   ```

2. Create guide following this structure:

   ```markdown
   ---
   title: <Skill Name> Skill
   description: Adding the <skill-name> Claude Code skill for <purpose>.
   ---

   ## What We Did

   Added the `/<skill-name>` skill to `.claude/skills/<skill-name>/`.

   ## Why This Skill

   [Explain the purpose and benefits of the skill]

   ## Skill Structure

   [Document the skill's file structure if it has multiple files]

   ## Key Features

   [List the main capabilities and patterns the skill provides]

   ## Usage

   Invoke the skill with:
   ```

   /<skill-name>

   ```

   [Include usage examples]

   ## References

   - [Link to source if applicable]
   - Related internal documentation
   ```

3. Update `apps/docs/astro.config.mjs` sidebar

### Step 5: Verify Updates

Ensure all files are consistent:

- Skill name matches across all files
- Descriptions are accurate and concise
- Structure tree is correct
- Guide appears in sidebar (if created)

## Example: Documenting a New Skill

**Scenario:** Added `turborepo` skill

**Updates needed:**

1. **`.claude/README.md`:**
   - Add `turborepo/` to structure tree
   - Add description under Available Skills

2. **`CLAUDE.md`:**

   ```markdown
   - `/turborepo` - Turborepo monorepo build system guidance
   ```

3. **Guide (optional):**
   - Create `apps/docs/src/content/docs/guides/NN-turborepo-skill.md`
   - Update sidebar in `astro.config.mjs`

## Skill Description Guidelines

When writing skill descriptions:

- **Be concise** - 10-20 words for inline lists
- **Focus on the "what"** - What does the skill help with?
- **Include trigger context** - When should it be used?
- **Use active voice** - "Guides Turborepo configuration" not "Is used for..."

**Good examples:**

- `Turborepo monorepo build system guidance for tasks, caching, and CI optimization`
- `Comprehensive Convex development guidelines and best practices`
- `Document development updates in the guides folder`

**Avoid:**

- Vague descriptions like "Helps with code"
- Too much detail in short descriptions
- Passive voice

## Output

After documenting a skill:

1. Confirm all files were updated
2. List the specific changes made
3. Note if a guide was created and its number
4. Verify skill appears correctly in all locations
