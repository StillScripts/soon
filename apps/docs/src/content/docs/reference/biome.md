---
title: Biome
description: Linting and formatting configuration with Biome.
---

## Overview

Biome is a fast, all-in-one linter and formatter written in Rust. It replaces ESLint + Prettier with a single tool.

## Configuration Structure

```
packages/biome-config/
├── package.json
├── base.json           # Core rules for all packages
├── next.json           # Next.js + React rules
└── react-internal.json # React library rules
```

## Available Configs

| Config | Export Path | Use For |
|--------|-------------|---------|
| Base | `@repo/biome-config/base` | TypeScript packages |
| Next.js | `@repo/biome-config/next-js` | Next.js applications |
| React Internal | `@repo/biome-config/react-internal` | React component libraries |

## Usage

### Package biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "extends": ["@repo/biome-config/next-js"]
}
```

### Commands

```bash
# Lint all packages
bun lint

# Lint specific package
turbo lint --filter=web

# Format all files
bun format

# Lint AND format in one command
biome check --write

# Check without fixing
biome check
```

## Configuration Details

### Base Config

Applied to all packages:

```json
{
  "organizeImports": { "enabled": true },
  "linter": {
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

### Next.js Config

Adds React-specific rules:

```json
{
  "extends": ["./base.json"],
  "linter": {
    "rules": {
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },
      "security": {
        "noDangerouslySetInnerHtml": "warn"
      },
      "a11y": {
        "recommended": true,
        "noBlankTarget": "error",
        "useAltText": "error"
      }
    }
  }
}
```

### React Internal Config

For component libraries (like `@repo/ui`):

```json
{
  "extends": ["./base.json"],
  "linter": {
    "rules": {
      "a11y": {
        "noLabelWithoutControl": "off"
      }
    }
  }
}
```

## Formatting Rules

| Setting | Value | Description |
|---------|-------|-------------|
| `semicolons` | `asNeeded` | No semicolons unless required |
| `quoteStyle` | `double` | Use double quotes |
| `trailingCommas` | `es5` | Trailing commas where valid in ES5 |
| `indentStyle` | `space` | Use spaces for indentation |
| `indentWidth` | `2` | 2-space indentation |
| `lineWidth` | `80` | Wrap at 80 characters |

## Linting Rules

### Enabled by Default

- **recommended**: All recommended rules enabled
- **noUnusedImports**: Warn on unused imports
- **noUnusedVariables**: Warn on unused variables
- **noExplicitAny**: Warn on `any` type usage

### Disabled

- **noNonNullAssertion**: Allow `!` assertions (common for env vars)

### React-Specific (Next.js config)

- **useExhaustiveDependencies**: Check hook dependency arrays
- **useHookAtTopLevel**: Hooks must be at component top level
- **noDangerouslySetInnerHtml**: Warn on dangerous HTML injection

### Accessibility (Next.js config)

- **noBlankTarget**: Error on `target="_blank"` without `rel`
- **useAltText**: Error on images without alt text
- **useKeyWithClickEvents**: Warn on click handlers without keyboard support

## Ignoring Rules

### Inline

```typescript
// biome-ignore lint/suspicious/noExplicitAny: reason here
const value: any = getData()
```

### File-Level

```json
{
  "files": {
    "ignore": ["**/generated/**", "**/dist/**"]
  }
}
```

## IDE Integration

### VS Code

Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome).

Settings:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

## Migration from ESLint

If migrating from ESLint:

1. Install Biome: `bun add -D @biomejs/biome`
2. Create `biome.json` extending appropriate config
3. Update lint script: `"lint": "biome check --write"`
4. Delete ESLint config files
5. Remove ESLint dependencies

## Related Documentation

- [Biome Documentation](https://biomejs.dev)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Biome Migration Guide](../guides/09-biome-migration)
