---
title: Biome Migration
description: Migrating from ESLint + Prettier to Biome for faster, unified linting and formatting.
---

## What We Did

Replaced ESLint and Prettier with Biome, a fast all-in-one linter and formatter written in Rust. This consolidates two tools into one while providing significant performance improvements.

## Why Biome

**Key reasons:**

- **Performance**: Biome is 10-100x faster than ESLint + Prettier combined (written in Rust)
- **Unified tooling**: Single tool for both linting and formatting reduces configuration complexity
- **Zero dependencies**: No plugin ecosystem to manage or version conflicts to resolve
- **Better defaults**: Sensible rules out of the box with easy customization

**Alternatives considered:**

- **Keep ESLint + Prettier**: More ecosystem support but slower and more complex configuration
- **ESLint with built-in formatting**: Still slower than Biome, less mature formatting
- **oxlint**: Fast but less mature, no formatting support

## Commands Used

```bash
# Install Biome as a root dev dependency
bun add -D @biomejs/biome

# Remove Prettier (no longer needed)
bun remove prettier

# Run format with Biome
bun format

# Run lint with Biome
bun lint
```

## Implementation Details

### Package Structure

Created a new `@repo/biome-config` package to share configurations across the monorepo:

```
packages/biome-config/
├── package.json
├── base.json           # Core rules for all packages
├── next.json           # Next.js + React rules (extends base)
└── react-internal.json # React library rules (extends base)
```

### Configuration Files

**`packages/biome-config/package.json`:**

```json
{
	"name": "@repo/biome-config",
	"version": "0.0.0",
	"private": true,
	"exports": {
		"./base": "./base.json",
		"./next-js": "./next.json",
		"./react-internal": "./react-internal.json"
	}
}
```

**`packages/biome-config/base.json`** (key settings):

```json
{
	"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
	"organizeImports": { "enabled": true },
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"correctness": {
				"noUnusedImports": "warn",
				"noUnusedVariables": "warn"
			},
			"style": {
				"noNonNullAssertion": "off"
			},
			"suspicious": {
				"noExplicitAny": "warn"
			}
		}
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "space",
		"indentWidth": 2,
		"lineWidth": 80
	},
	"javascript": {
		"formatter": {
			"semicolons": "asNeeded",
			"quoteStyle": "double",
			"trailingCommas": "es5"
		}
	}
}
```

**Consumer configs** (e.g., `apps/web/biome.json`):

```json
{
	"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
	"extends": ["@repo/biome-config/next-js"]
}
```

### Files Created

| File                                        | Purpose                 |
| ------------------------------------------- | ----------------------- |
| `packages/biome-config/package.json`        | Config package manifest |
| `packages/biome-config/base.json`           | Core lint/format rules  |
| `packages/biome-config/next.json`           | Next.js + React rules   |
| `packages/biome-config/react-internal.json` | React library rules     |
| `biome.json` (root)                         | Workspace-level config  |
| `apps/web/biome.json`                       | Web app config          |
| `packages/ui/biome.json`                    | UI package config       |

### Files Deleted

| File                                         | Reason                   |
| -------------------------------------------- | ------------------------ |
| `packages/eslint-config/` (entire directory) | Replaced by biome-config |
| `apps/web/eslint.config.js`                  | Using biome.json instead |
| `packages/ui/eslint.config.mjs`              | Using biome.json instead |

### Script Changes

**Root `package.json`:**

```diff
- "format": "prettier --write \"**/*.{ts,tsx,md}\""
+ "format": "biome format --write ."
```

**`apps/web/package.json` and `packages/ui/package.json`:**

```diff
- "lint": "eslint --max-warnings 0"
+ "lint": "biome check --write"
```

## Key Dependencies

- `@biomejs/biome`: ^1.9.4 - All-in-one linter and formatter

**Removed:**

- `prettier`: ^3.7.4 - Replaced by Biome formatter
- `eslint`: ^9.39.1 - Replaced by Biome linter
- `@repo/eslint-config`: Replaced by `@repo/biome-config`

## Integration with Existing Code

The migration required minimal code changes:

1. **Fixed lint errors surfaced by Biome:**
   - `packages/ui/src/components/ui/field.tsx`: Changed `==` to `===` for strict equality
   - `packages/ui/src/components/ui/field.tsx`: Used `error.message` as key instead of array index

2. **Config inheritance:**
   - Each config extends the base with additional rules
   - `next.json` adds React hooks and a11y rules
   - `react-internal.json` disables `noLabelWithoutControl` for component libraries

## Context for AI

When working with linting and formatting:

- Use `bun lint` to run Biome linting across all packages
- Use `bun format` to format all files with Biome
- Use `biome check --write` to lint AND format in one command
- Biome configs use JSON (not JavaScript), so no dynamic configuration
- The `extends` field in child configs points to the package export path

**Key configuration decisions:**

- `semicolons: "asNeeded"` - No semicolons unless required for ASI
- `noNonNullAssertion: "off"` - Allow `!` assertions (common in env vars)
- `noExplicitAny: "warn"` - Discourage but don't block `any` types
- `noLabelWithoutControl: "off"` (react-internal) - Labels get `htmlFor` via props

## Outcomes

### Before

- Two separate tools: ESLint for linting, Prettier for formatting
- Complex plugin ecosystem with version compatibility issues
- Slower execution (JavaScript-based tools)
- Multiple config files per package

### After

- Single tool handles both linting and formatting
- No plugin dependencies to manage
- 10-100x faster execution
- Simpler JSON-based configuration
- Consistent code style enforced automatically

## Testing/Verification

```bash
# Verify lint passes
bun lint

# Verify format works
bun format

# Verify build still works
bun run build

# Test specific packages
turbo lint --filter=web
turbo lint --filter=@repo/ui
```

Expected results:

- All lint commands pass without errors
- Format command completes and fixes files
- Build completes successfully
- No semicolons in formatted code

## Related Documentation

- [Biome Documentation](https://biomejs.dev)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Turborepo with-biome example](https://github.com/vercel/turborepo/tree/main/examples/with-biome)
- [Initial Turborepo Setup](./01-initial-turborepo-setup) - Original ESLint setup
