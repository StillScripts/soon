---
title: Astro Documentation Site
description: Replacing the Next.js docs app with Astro Starlight for better documentation experience.
---

## What We Did

Removed the original Next.js-based docs app and replaced it with an Astro site using the Starlight documentation theme.

## Why Astro Starlight

**Astro benefits:**

- Content-focused: Perfect for documentation sites
- Island architecture: Minimal JavaScript by default
- Fast build times and excellent performance
- Native Markdown/MDX support

**Starlight theme:**

- Purpose-built for documentation
- Built-in search, navigation, and accessibility
- Mobile-responsive design
- Automatic dark mode support
- Syntax highlighting for code blocks

**Why not Next.js for docs:**

- Next.js is optimized for web applications, not static documentation
- Starlight provides better DX for writing and organizing docs
- Lighter weight and faster for content-heavy sites

## Commands Used

### 1. Remove the original docs app

```bash
cd apps
rm -rf docs
```

### 2. Create new Astro site

```bash
bun create astro@latest
```

**Selections made:**

- Where should we create your new project? `./docs`
- How would you like to start your new project? `Use docs (Starlight) template`
- Install dependencies? `Yes`
- Initialize a new git repository? `No` (already in a git repo)

The launcher initiated with output:

```
Launch sequence initiated.
✓ Project initialized!
✓ Template copied
✓ Dependencies installed
```

## Project Structure

```
apps/docs/
├── src/
│   ├── assets/          # Images and embeddable assets
│   ├── content/
│   │   ├── docs/        # Documentation markdown files
│   │   │   ├── guides/
│   │   │   ├── reference/
│   │   │   └── index.mdx
│   │   └── content.config.ts
│   └── env.d.ts
├── public/              # Static assets (favicons, etc.)
├── astro.config.mjs     # Astro configuration
├── package.json
└── tsconfig.json
```

## Configuration

### astro.config.mjs

```javascript
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

export default defineConfig({
	integrations: [
		starlight({
			title: "My Docs",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/withastro/starlight",
				},
			],
			sidebar: [
				{
					label: "Guides",
					items: [{ label: "Example Guide", slug: "guides/example" }],
				},
				{
					label: "Reference",
					autogenerate: { directory: "reference" },
				},
			],
		}),
	],
})
```

### package.json scripts

```json
{
	"dev": "astro dev", // Runs on port 4321
	"start": "astro dev",
	"build": "astro build",
	"preview": "astro preview"
}
```

## Key Dependencies

- `astro`: ^5.6.1 - The Astro framework
- `@astrojs/starlight`: ^0.37.4 - Documentation theme
- `sharp`: ^0.34.2 - Image optimization

## Integration with TurboRepo

The Astro docs app automatically integrates with the TurboRepo:

- `turbo dev --filter=docs` runs the Astro dev server
- `turbo build --filter=docs` builds the static site
- Shares root-level TypeScript and tooling configurations

## Writing Documentation

### Content Location

All documentation goes in `src/content/docs/` as `.md` or `.mdx` files.

### File-based Routing

- `src/content/docs/index.mdx` → `/`
- `src/content/docs/guides/example.md` → `/guides/example`
- `src/content/docs/reference/config.md` → `/reference/config`

### Frontmatter Format

```markdown
---
title: Page Title
description: Page description for SEO and previews
---

Content goes here...
```

## Context for AI

When working with the docs:

- Add new guides to `src/content/docs/guides/`
- Use numbered prefixes (e.g., `01-`, `02-`) for chronological ordering
- Update `astro.config.mjs` sidebar if creating new sections
- Run `turbo dev --filter=docs` to preview changes at `localhost:4321`
- Images in `src/assets/` can be imported in MDX files
- Static assets go in `public/`

## Next Steps

After setting up Astro docs, we:

1. Initialized Claude Code for AI-assisted development (see [next guide](./03-claude-code))
2. Created this documentation system you're reading now
