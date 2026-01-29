---
title: oxlint + Prettier Migration
description: Replacing Biome with oxlint for linting and Prettier for formatting.
---

## What We Did

Migrated the codebase from Biome (all-in-one linter/formatter) to a split setup:

- **oxlint** - Fast linter from the oxc project
- **Prettier** - Industry-standard code formatter

## Why This Approach

Biome's formatter was causing issues with unwanted code transformations (adding semicolons despite configuration, changing indentation). Rather than fight the tool, we switched to a more predictable setup.

**Key reasons:**

- **oxlint** is extremely fast and focused purely on linting
- **Prettier** is battle-tested and respects configuration reliably
- Separating concerns (linting vs formatting) provides better control
- Both tools are well-maintained with active communities

**Alternatives considered:**

- **Keep Biome**: Configuration issues were causing developer friction
- **ESLint + Prettier**: Slower than oxlint, more configuration overhead

## Commands Used

```bash
# Remove Biome, add oxlint and Prettier
bun remove @biomejs/biome
bun add -d oxlint prettier

# Rename config package
mv packages/biome-config packages/oxlint-config
```

## Implementation Details

### Package Structure

Created `@repo/oxlint-config` with layered configurations:

```
packages/oxlint-config/
├── package.json
├── base.json      # Core rules for all packages
├── react.json     # React-specific rules (extends base)
└── next.json      # Next.js rules (extends react)
```

### oxlint Configuration

**Base config** (`packages/oxlint-config/base.json`):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"categories": {
		"correctness": "error",
		"suspicious": "warn",
		"perf": "warn"
	},
	"rules": {
		"no-unused-vars": "warn",
		"no-console": "off",
		"eqeqeq": "error",
		"no-var": "error",
		"prefer-const": "warn"
	},
	"env": {
		"browser": true,
		"node": true,
		"es2024": true
	},
	"overrides": [
		{
			"files": ["**/*.test.ts", "**/*.test.tsx", "**/tests/**"],
			"rules": {
				"no-constant-binary-expression": "off"
			}
		}
	]
}
```

**React config** (`packages/oxlint-config/react.json`):

```json
{
	"extends": ["./base.json"],
	"plugins": ["react", "react-hooks", "jsx-a11y"],
	"rules": {
		"react/jsx-key": "error",
		"react/react-in-jsx-scope": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn"
	}
}
```

### Prettier Configuration

**Root config** (`.prettierrc`):

```json
{
	"useTabs": true,
	"semi": false,
	"singleQuote": false,
	"trailingComma": "es5",
	"printWidth": 100
}
```

**Ignore file** (`.prettierignore`):

```
node_modules
dist
.next
.astro
.turbo
bun.lock
coverage
**/convex/_generated
```

### VS Code Integration

Added `.vscode/settings.json` for consistent editor experience:

```json
{
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.formatOnSave": true,
	"editor.insertSpaces": false,
	"typescript.tsdk": "node_modules/typescript/lib"
}
```

Recommended extensions in `.vscode/extensions.json`:

- `esbenp.prettier-vscode` - Prettier formatter
- `oxc.oxc-vscode` - oxlint integration
- `bradlc.vscode-tailwindcss` - Tailwind IntelliSense
- `astro-build.astro-vscode` - Astro support

### Package Updates

Each package references the appropriate config via `.oxlintrc.json`:

**Web app** (`apps/web/.oxlintrc.json`):

```json
{
	"extends": ["../../packages/oxlint-config/next.json"]
}
```

**UI package** (`packages/ui/.oxlintrc.json`):

```json
{
	"extends": ["../oxlint-config/react.json"]
}
```

Updated lint scripts in each `package.json`:

```json
{
	"scripts": {
		"lint": "oxlint ."
	}
}
```

## Key Dependencies

- `oxlint`: ^1.42.0 - Fast Rust-based linter
- `prettier`: ^3.8.1 - Code formatter

## Integration with Existing Code

The migration was seamless:

1. Removed all `biome.json` files
2. Added `.oxlintrc.json` files referencing shared configs
3. Updated lint scripts from `biome check --write` to `oxlint .`
4. Added format scripts using Prettier

## Context for AI

When working with linting and formatting:

- **Linting**: Run `bun lint` (uses oxlint via Turborepo)
- **Formatting**: Run `bun format` (uses Prettier)
- **Config location**: `packages/oxlint-config/` for lint rules
- **Style**: Tabs, no semicolons, double quotes
- oxlint doesn't auto-fix - it only reports issues
- Prettier handles all formatting concerns

## Outcomes

### Before

- Single tool (Biome) for linting and formatting
- Configuration issues causing unwanted code changes
- Semicolons being added despite `asNeeded` setting

### After

- oxlint for fast, reliable linting
- Prettier for predictable formatting
- Clear separation of concerns
- VS Code integration with format-on-save

## Testing/Verification

```bash
# Run linting
bun lint

# Check formatting
bun format:check

# Apply formatting
bun format
```

Expected results:

- `bun lint` passes with no errors
- `bun format:check` passes after running `bun format`
- Code uses tabs and no semicolons

## Related Documentation

- [oxlint Documentation](https://oxc.rs/docs/guide/usage/linter)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Biome Migration Guide](./09-biome-migration) (previous setup)
