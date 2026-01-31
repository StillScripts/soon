# Documentation Site

Astro Starlight documentation site for the Soon monorepo.

## Development

From the monorepo root:

```bash
turbo dev --filter=docs
```

Opens at [http://localhost:4321](http://localhost:4321).

## Structure

```
src/
├── assets/           # Embeddable images and assets
├── content/
│   └── docs/
│       ├── guides/   # Development journey (numbered chronologically)
│       ├── skills/   # Auto-generated Claude Code skill docs
│       └── reference/# Quick reference pages
└── content.config.ts # Content collection config
```

## Content

- **Guides**: Chronological documentation of how the project was built (01-18)
- **Skills**: Auto-generated documentation for Claude Code skills
- **Reference**: Quick lookup for common patterns and APIs

## Adding Content

### New Guide

1. Copy `src/content/docs/guides/_template.md`
2. Name it with the next number: `19-your-feature.md`
3. Add to sidebar in `astro.config.mjs`

### New Reference Page

Create a `.md` or `.mdx` file in `src/content/docs/reference/` and add to sidebar.

## Build

```bash
turbo build --filter=docs
```

Output goes to `dist/` (configured in `vercel.json`).
