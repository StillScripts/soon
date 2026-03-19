---
title: Remotion Video App
description: Adding programmatic video creation with Remotion for demo videos and product showcases.
---

## What

Added a new `video` app to the monorepo using [Remotion](https://remotion.dev) 4.0 for programmatic video creation with React. Also installed the official Remotion Claude Code skills (37 rule files) for AI-assisted video workflows.

## Why

Creating demo videos, product showcases, and marketing content programmatically with React enables:

- **Consistent branding** using the same `@repo/ui` components from the web app
- **Version-controlled videos** where compositions are code, not binary files
- **AI-assisted creation** via Claude Code with Remotion-specific skills for animations, transitions, audio, and more
- **Rapid iteration** on video content without manual video editing tools

## How

### Package Setup

Created `apps/video/` as a new workspace app with:

- **Remotion 4.0.436** for the video framework
- **Tailwind CSS v4** via `@remotion/tailwind-v4` for styling
- **React 19** matching the rest of the monorepo
- **`@repo/ui`** dependency for shared component access

### Key Files

```
apps/video/
├── remotion.config.ts          # Webpack override for Tailwind v4
├── src/
│   ├── index.ts                # Entry point (registerRoot)
│   ├── index.css               # Tailwind + oklch theme tokens
│   ├── Root.tsx                 # Composition definitions
│   └── compositions/
│       └── DemoShowcase.tsx     # Starter demo composition
├── package.json
└── tsconfig.json
```

### Remotion Config

The `remotion.config.ts` enables Tailwind CSS v4 support:

```ts
import { Config } from "@remotion/cli/config"
import { enableTailwind } from "@remotion/tailwind-v4"

Config.overrideWebpackConfig((currentConfiguration) => {
	return enableTailwind(currentConfiguration)
})
```

### Claude Code Skills

Installed 37 Remotion rule files in `.claude/skills/remotion/rules/` covering:

- Animations, transitions, timing, and sequencing
- Audio, voiceover, sound effects, and audio visualization
- Video embedding, trimming, and transparent videos
- Text animations, fonts, and measuring
- Charts, 3D content, maps, and more

Invoke with `/remotion` to load best practices when working on video compositions.

## Commands

```bash
# Open Remotion Studio (visual editor)
turbo dev --filter=video

# Render a composition to video
cd apps/video && bunx remotion render DemoShowcase

# Bundle for deployment
turbo build --filter=video
```

## Outcomes

- New `video` workspace app in `apps/video/`
- 37 Remotion skill rule files in `.claude/skills/remotion/`
- Updated `CLAUDE.md` and `.claude/README.md` with video app documentation
- Type checking and linting configured with shared monorepo configs

## Context for AI

- Use `/remotion` skill when creating or modifying video compositions
- Compositions live in `apps/video/src/compositions/`
- New compositions must be registered in `apps/video/src/Root.tsx`
- Tailwind classes work directly in Remotion components
- The `@repo/ui` package styles can be replicated via Tailwind classes for visual consistency
- Remotion uses `interpolate()` for linear animations and `spring()` for physics-based ones
- Use `bunx` instead of `npx` for all Remotion CLI commands
