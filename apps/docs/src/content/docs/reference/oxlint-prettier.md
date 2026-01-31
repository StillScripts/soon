---
title: oxlint + Prettier
description: Linting with oxlint and formatting with Prettier.
---

## Overview

This project uses **oxlint** for fast linting and **Prettier** for formatting.

## Configuration Structure

```
packages/oxlint-config/
├── base.json     # Core rules for all packages
├── react.json    # React-specific rules
└── next.json     # Next.js-specific rules

.prettierrc       # Prettier configuration (root)
.prettierignore   # Files to ignore
```

## oxlint

### Available Configs

| Config  | Export                      | Use For              |
| ------- | --------------------------- | -------------------- |
| Base    | `@repo/oxlint-config/base`  | TypeScript packages  |
| React   | `@repo/oxlint-config/react` | React libraries      |
| Next.js | `@repo/oxlint-config/next`  | Next.js applications |

### Usage

In package's `package.json`:

```json
{
	"scripts": {
		"lint": "oxlint -c @repo/oxlint-config/next"
	}
}
```

### Rules

Base config enables:

```json
{
	"categories": {
		"correctness": "error",
		"suspicious": "warn",
		"perf": "warn"
	},
	"rules": {
		"no-unused-vars": "warn",
		"no-console": "warn",
		"eqeqeq": "error",
		"no-var": "error",
		"prefer-const": "warn"
	}
}
```

### Ignoring Rules

```typescript
// oxlint-ignore-next-line no-console
console.log("debug")
```

## Prettier

### Configuration

Root `.prettierrc`:

```json
{
  "useTabs": true,
  "semi": false,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "importOrder": [
    "^react",
    "^next",
    "^@?\\w",
    "^@repo/",
    "^@/",
    "^\\./",
    "^\\.\\./
  ],
  "importOrderSeparation": true
}
```

### Formatting Rules

| Setting         | Value   | Description                 |
| --------------- | ------- | --------------------------- |
| `useTabs`       | `true`  | Use tabs for indentation    |
| `semi`          | `false` | No semicolons               |
| `singleQuote`   | `false` | Use double quotes           |
| `trailingComma` | `es5`   | Trailing commas where valid |
| `printWidth`    | `100`   | Line width                  |

### Plugins

- **@trivago/prettier-plugin-sort-imports** - Auto-sorts imports
- **prettier-plugin-tailwindcss** - Sorts Tailwind classes

### Ignored Files

In `.prettierignore`:

```
node_modules
dist
.next
.turbo
bun.lock
coverage
**/convex/_generated
**/next-env.d.ts
```

## Commands

```bash
# Lint all packages
bun lint

# Lint specific package
turbo lint --filter=web

# Format all files
bun format

# Check formatting (CI)
bun format:check
```

## IDE Integration

### VS Code

Install extensions:

- [oxc](https://marketplace.visualstudio.com/items?itemName=nicolo-ribaudo.oxc)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Settings:

```json
{
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.formatOnSave": true
}
```
