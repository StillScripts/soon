---
title: Vitest Testing Setup
description: Setting up Vitest for unit testing across the Turborepo monorepo with shared configuration.
---

## What We Did

Added Vitest as the testing framework for the monorepo, following the official [Turborepo with-vitest example](https://github.com/vercel/turborepo/tree/main/examples/with-vitest). This provides a consistent testing setup across all packages and apps with Turborepo caching integration.

## Why Vitest

**Key reasons:**
- **Fast**: Built on Vite, uses native ES modules for instant test startup
- **TypeScript-first**: Works with TypeScript out of the box, no configuration needed
- **Turborepo integration**: Test results are cached, only changed packages re-run tests
- **Watch mode**: Multi-project watch mode for development
- **jsdom built-in**: Easy browser environment simulation for React testing

**Alternatives considered:**
- **Jest**: More mature but slower, requires more configuration for TypeScript/ESM
- **Bun test**: Built into Bun but less ecosystem support for React Testing Library
- **Playwright**: Better for E2E, overkill for unit tests

## Commands Used

```bash
# Run all tests via Turborepo (cached)
bun run test

# Watch mode for development
bun test:watch

# Run tests for specific package
turbo run test --filter=@repo/ui

# Run with coverage
turbo run test -- --coverage
```

## Implementation Details

### Package Structure

```
packages/vitest-config/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts          # Shared configuration export

packages/ui/
├── vitest.config.ts      # Uses shared config + jsdom
└── tests/
    └── utils.test.ts     # Example test

apps/web/
└── vitest.config.ts      # Uses shared config + jsdom + React plugin

vitest.config.ts          # Root config for multi-project watch mode
```

### Shared Configuration (`@repo/vitest-config`)

```typescript
// packages/vitest-config/src/index.ts
import type { UserConfig } from "vitest/config"

export const sharedConfig: UserConfig = {
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
    },
  },
}
```

### Package Configuration (Node.js packages)

```typescript
// packages/ui/vitest.config.ts
import { defineConfig } from "vitest/config"
import { sharedConfig } from "@repo/vitest-config"

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: "jsdom",
  },
})
```

### App Configuration (Next.js)

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { sharedConfig } from "@repo/vitest-config"

export default defineConfig({
  plugins: [react()],
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: "jsdom",
    passWithNoTests: true,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
})
```

### Turborepo Task Configuration

```json
// turbo.json
{
  "tasks": {
    "test": {
      "dependsOn": ["transit"],
      "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/vitest.config.ts"],
      "outputs": ["coverage/**"]
    },
    "transit": {
      "dependsOn": ["^transit"]
    }
  }
}
```

**Why `transit` pattern?**
- Tests can run in parallel (don't need built output from dependencies)
- But cache must invalidate when dependency source code changes
- `transit` creates dependency relationships without matching any script, allowing parallel execution with correct cache invalidation

### Root Configuration (Watch Mode)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import { sharedConfig } from "@repo/vitest-config"

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
          include: ["**/tests/**/*.test.{ts,tsx}", "**/src/**/*.test.{ts,tsx}"],
        },
      },
      {
        root: "./apps",
        test: {
          ...sharedConfig.test,
          environment: "jsdom",
          include: ["**/tests/**/*.test.{ts,tsx}", "**/src/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
})
```

## Key Dependencies

**Root `package.json`:**
- `vitest`: ^3.0.0 - Test runner
- `@repo/vitest-config`: * - Shared configuration

**`@repo/ui` package:**
- `vitest`: ^3.0.0 - Test runner
- `jsdom`: ^26.0.0 - Browser environment simulation
- `@testing-library/react`: ^16.0.0 - React testing utilities

**`apps/web`:**
- `vitest`: ^3.0.0 - Test runner
- `@vitejs/plugin-react`: ^4.4.0 - React JSX transform for Vitest
- `jsdom`: ^26.0.0 - Browser environment simulation
- `@testing-library/react`: ^16.0.0 - React testing utilities

## Context for AI

When working with tests in this codebase:

- **Shared config**: Import from `@repo/vitest-config` to get consistent settings
- **Environment**: Use `jsdom` for React/DOM testing, `node` for pure utilities
- **File location**: Tests go in `tests/` directory or colocated as `*.test.ts`
- **Watch mode**: Use `bun test:watch` for development (runs root multi-project config)
- **CI mode**: Use `bun run test` for Turborepo caching

### Adding Tests to a New Package

1. Add dependencies to `package.json`:
```json
{
  "devDependencies": {
    "@repo/vitest-config": "*",
    "vitest": "^3.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch"
  }
}
```

2. Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config"
import { sharedConfig } from "@repo/vitest-config"

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: "node", // or "jsdom" for UI
  },
})
```

3. Create tests in `tests/` directory

### Example Test

```typescript
import { describe, expect, test } from "vitest"
import { cn } from "../src/lib/utils"

describe("cn utility", () => {
  test("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  test("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  test("merges Tailwind classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })
})
```

## Outcomes

### Before
- No testing framework configured
- No shared test configuration
- No CI caching for test results

### After
- Vitest configured for all packages/apps
- `@repo/vitest-config` provides shared settings
- Tests cached by Turborepo (only changed packages re-test)
- Watch mode available for development
- React Testing Library ready for component tests

## Testing/Verification

```bash
# Run all tests
bun run test

# Should see output like:
# @repo/ui:test: ✓ tests/utils.test.ts (5 tests)
# web:test: No test files found, exiting with code 0

# Verify caching works (run again)
bun run test
# Should see: cache hit, replaying logs
```

Expected results:
- `@repo/ui` tests pass (5 tests for cn utility)
- `apps/web` passes with no tests (passWithNoTests: true)
- Second run shows cache hits

## Next Steps

- Add component tests for `@repo/ui` components using React Testing Library
- Add integration tests for web app pages/features
- Configure coverage thresholds in CI
- Add visual regression testing with Playwright (for E2E)

## Related Documentation

- [Vitest Documentation](https://vitest.dev)
- [Turborepo with-vitest Example](https://github.com/vercel/turborepo/tree/main/examples/with-vitest)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [shadcn/ui Components Guide](./07-shadcn-ui-components)
