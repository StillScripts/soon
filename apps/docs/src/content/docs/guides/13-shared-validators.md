---
title: Shared Validators Package
description: Creating a shared validation layer with Zod for frontend and backend consistency.
---

## What We Did

Created `@repo/validators` as a shared monorepo package that provides Zod validation schemas used by both the Convex backend and Next.js frontend. This eliminates validation duplication and ensures consistent data validation across the entire application stack.

## Why Shared Validators

**Key reasons:**
- **Single source of truth**: Validation rules defined once, used everywhere
- **Type safety**: Zod schemas provide automatic TypeScript type inference
- **DRY principle**: Eliminates duplication between frontend form validation and backend API validation
- **Consistency**: Ensures users see the same validation errors in the UI that the backend enforces
- **Maintainability**: Changes to validation rules only need to happen in one place
- **Testability**: Validation logic can be unit tested independently from UI or backend concerns

**Alternatives considered:**
- **Inline validation**: Duplicating validation between frontend and backend would lead to inconsistencies and maintenance burden
- **Backend-only validation**: Would require round-trip API calls for every validation, poor UX
- **Frontend-only validation**: Would be insecure and allow invalid data into the database

## Package Structure

```
packages/validators/
├── src/
│   ├── things.ts       # Thing validation schemas
│   ├── things.test.ts  # Comprehensive test suite (28 tests)
│   └── index.ts        # Barrel export
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── biome.json
```

## Implementation Details

### Validation Schemas

Created four schemas for thing operations in `packages/validators/src/things.ts`:

```typescript
import { z } from "zod"

// Create a new thing
export const createThingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
})

// Get a thing by ID
export const getThingSchema = z.object({
  id: z.string(),
})

// Remove a thing
export const removeThingSchema = z.object({
  id: z.string(),
})

// List things with optional limit
export const listThingsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
})

// Type inference helpers
export type CreateThingInput = z.infer<typeof createThingSchema>
export type GetThingInput = z.infer<typeof getThingSchema>
export type RemoveThingInput = z.infer<typeof removeThingSchema>
export type ListThingsInput = z.infer<typeof listThingsSchema>
```

### Package Configuration

The package exports schemas through named exports:

```json
{
  "name": "@repo/validators",
  "exports": {
    "./things": {
      "types": "./src/things.ts",
      "default": "./src/things.ts"
    }
  }
}
```

**Important:** When using `moduleResolution: "NodeNext"` in TypeScript, imports must include the `.js` extension even though the source files are `.ts`:

```typescript
import { createThingSchema } from "@repo/validators/things.js"
```

## Key Dependencies

- `zod`: ^4.3.6 - Schema validation with TypeScript type inference
- `vitest`: ^3.0.0 - Testing framework for validator unit tests

## Integration with Existing Code

### Backend Integration (Convex)

Updated `packages/backend/convex/things.ts` to use shared validators:

```typescript
import {
  createThingSchema,
  getThingSchema,
  listThingsSchema,
  removeThingSchema,
} from "@repo/validators/things.js"
import { authMutation, authQuery } from "./crpc"

export const create = authMutation
  .input(createThingSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", {
      title: input.title,
      userId: ctx.userId,
    })
  })

export const list = authQuery
  .input(listThingsSchema)
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))

    if (input.limit) {
      return query.take(input.limit)
    }
    return query.collect()
  })
```

### Frontend Integration (TanStack Form)

Updated `apps/web/app/page.tsx` to use shared validators with TanStack Form:

```typescript
import { createThingSchema } from "@repo/validators/things.js"
import { useForm } from "@tanstack/react-form"

const form = useForm({
  defaultValues: {
    title: "",
  },
  onSubmit: async ({ value }) => {
    await createThing.mutateAsync({ title: value.title.trim() })
    form.reset()
  },
})

// Field-level validation using the shared schema
<form.Field
  name="title"
  validators={{
    onChange: ({ value }) => {
      const result = createThingSchema.shape.title.safeParse(value)
      return result.success
        ? undefined
        : result.error.issues[0]?.message
    },
  }}
>
  {(field) => (
    // Field rendering...
  )}
</form.Field>
```

## Testing

Created comprehensive test suite with 28 test cases covering:

```bash
bun test --filter=@repo/validators
```

**Test coverage includes:**
- ✅ Valid inputs (boundary conditions, typical cases)
- ✅ Invalid inputs (empty, too long, wrong types)
- ✅ Edge cases (exactly at min/max limits)
- ✅ Type validation (strings, numbers, nulls, undefined)
- ✅ Optional fields behavior

Example test:

```typescript
describe("createThingSchema", () => {
  it("should validate a valid title", () => {
    const result = createThingSchema.safeParse({ title: "My Thing" })
    expect(result.success).toBe(true)
  })

  it("should reject an empty title", () => {
    const result = createThingSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Title is required")
    }
  })
})
```

All tests pass: **28 passed (28)**

## Context for AI

When working with validators:
- Always import with `.js` extension when using `moduleResolution: "NodeNext"`
- Use `safeParse()` for validation that returns `{ success: boolean, data?: T, error?: ZodError }`
- Use `parse()` for validation that throws on failure
- Access schema shape with `.shape.fieldName` to validate individual fields
- Type inference with `z.infer<typeof schema>` provides automatic TypeScript types
- Zod 4.x uses `error.issues` instead of `error.errors` for validation errors
- Add `.int()` to number schemas when only integers are valid

## Outcomes

### Before
- Validation logic duplicated between frontend and backend
- Frontend form used simple `useState` with manual validation
- No type safety between validation schemas and TypeScript types
- Backend schemas defined inline in Convex functions

### After
- Single source of truth for validation rules
- Frontend upgraded to TanStack Form with proper field validation
- Full type safety with Zod type inference
- Backend imports schemas from shared package
- Comprehensive test coverage for all validators
- Users see consistent validation messages across the stack

## Related Documentation

- [Zod Documentation](https://zod.dev)
- [TanStack Form Documentation](https://tanstack.com/form)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-nodenext)
