---
title: Vitest
description: Unit testing with Vitest.
---

## Configuration

Root `vitest.config.ts`:

```typescript
import { defineConfig } from "@repo/vitest-config"

export default defineConfig()
```

The shared config from `@repo/vitest-config` provides sensible defaults.

## Writing Tests

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"

describe("MyFeature", () => {
  beforeEach(() => {
    // Setup before each test
  })

  it("should do something", () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })

  it("should handle errors", () => {
    expect(() => errorFunction()).toThrow("Error message")
  })
})
```

## Assertions

```typescript
// Equality
expect(value).toBe(expected)          // Strict equality
expect(value).toEqual(expected)       // Deep equality
expect(value).toStrictEqual(expected) // Strict deep equality

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(10)
expect(value).toBeCloseTo(0.3, 5)

// Strings
expect(string).toContain("substring")
expect(string).toMatch(/pattern/)

// Arrays/Objects
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(object).toHaveProperty("key", "value")

// Errors
expect(() => fn()).toThrow()
expect(() => fn()).toThrow("message")
expect(() => fn()).toThrow(ErrorClass)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

## Mocking

### Mock Functions

```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockResolvedValue(data)      // Async
mockFn.mockImplementation((x) => x * 2)

// Verify calls
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(3)
```

### Mock Modules

```typescript
vi.mock("./module", () => ({
  myFunction: vi.fn(() => "mocked"),
}))

// Or with factory
vi.mock("./module", async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    myFunction: vi.fn(),
  }
})
```

### Spies

```typescript
const spy = vi.spyOn(object, "method")
spy.mockReturnValue("mocked")

// After test
spy.mockRestore()
```

## Test Organization

### File Naming

```
src/
├── things.ts
└── things.test.ts    # Co-located test
```

Or in dedicated folder:

```
src/
├── things.ts
└── __tests__/
    └── things.test.ts
```

### Test Validators

```typescript
// packages/validators/src/things.test.ts
import { describe, it, expect } from "vitest"
import { createThingSchema } from "./things"

describe("createThingSchema", () => {
  it("validates correct input", () => {
    const result = createThingSchema.safeParse({
      title: "Test",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    const result = createThingSchema.safeParse({
      title: "",
    })
    expect(result.success).toBe(false)
  })
})
```

## Commands

```bash
# Run all tests
bun test

# Watch mode
bun test:watch

# Run specific file
bun test src/things.test.ts

# With coverage
bun test --coverage

# Run in specific package
turbo test --filter=@repo/validators
```

## Configuration Options

In `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,           // Use global expect, describe, it
    environment: "node",     // or "jsdom" for browser
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**"],
  },
})
```
