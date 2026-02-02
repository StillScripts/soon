---
title: Input-Only Validators
description: Refactored @repo/validators to focus exclusively on user input validation for forms
---

## What We Did

Refactored `@repo/validators` to only contain input schemas for form validation, moving backend-specific schemas (ID operations, pagination) into the Convex backend. This creates a clear separation between user-facing form validation and backend API schemas.

## Why This Approach

**Key reasons:**

- **Single responsibility**: Validators package should only handle user input validation
- **Clear boundaries**: Backend schemas (get by ID, delete, list pagination) are implementation details
- **Form focus**: Input schemas represent data users submit, not API operations
- **Simpler frontend**: Forms only need the core input schema, not operation-specific variants

**Alternatives considered:**

- Keep all schemas in validators: Creates confusion about which schemas are for forms vs API
- Duplicate schemas: Would lead to drift and maintenance burden

## Implementation Details

### Before (validators/things.ts)

The package exported multiple schema types:

```typescript
// Form input schemas
export const createThingSchema = z.object({...})
export const updateThingSchema = z.object({ id, ...fields })

// Backend operation schemas (not for forms)
export const getThingSchema = z.object({ id })
export const removeThingSchema = z.object({ id })
export const listThingsSchema = z.object({ limit })
```

### After (validators/things.ts)

A single, focused input schema:

```typescript
/**
 * Core input schema for Thing entity
 * Used for: Create forms (all fields as-is), Update forms (use .partial() in backend)
 */
export const thingInputSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z.string().max(2000, "Description must be 2000 characters or less").optional(),
	imageId: z.string().optional(),
})

export type ThingInput = z.infer<typeof thingInputSchema>
```

### Backend (convex/functions/things.ts)

Backend now defines its own operation schemas:

```typescript
import { thingInputSchema } from "@repo/validators/things"

// Backend-specific schemas
const idSchema = z.object({ id: z.string() })
const listSchema = z.object({ limit: z.number().int().min(1).max(100).optional() })

// Update derives from input schema with nullable support
const updateSchema = idSchema.extend({
	title: thingInputSchema.shape.title.optional(),
	description: z.string().max(2000).nullable().optional(),
	imageId: z.string().nullable().optional(),
})

// Create uses the shared input schema directly
export const create = authMutation.input(thingInputSchema).mutation(...)

// Get/Remove use the local ID schema
export const get = authQuery.input(idSchema).query(...)
export const remove = authMutation.input(idSchema).mutation(...)

// List uses the local list schema
export const list = authQuery.input(listSchema).query(...)
```

### Frontend (page.tsx)

Forms use the single input schema:

```typescript
import { thingInputSchema } from "@repo/validators/things"

// Validation uses schema shape
validators={{
  onChange: ({ value }) => {
    const result = thingInputSchema.shape.title.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  },
}}
```

## Key Benefits

1. **Validators package is simpler** - Only exports what forms need
2. **Backend owns its API** - Operation schemas are co-located with handlers
3. **Type safety preserved** - Backend derives update schema from input schema
4. **No duplication** - Core validation rules defined once

## Context for AI

When working with validators and schemas:

- `@repo/validators` contains ONLY input schemas for user data
- Backend operation schemas (id-based, pagination) live in the backend
- Use `thingInputSchema.shape.fieldName` for field-level validation in forms
- Backend can derive update schemas: `inputSchema.partial().extend({ id })`
- Nullable fields (for clearing) are backend concerns, not form concerns

## Testing/Verification

```bash
# Run validator tests
turbo test --filter=@repo/validators

# Run backend tests
turbo test --filter=backend

# Run web tests
turbo test --filter=web

# Type check affected packages
turbo check-types --filter=@repo/validators --filter=backend --filter=web
```

Expected results:

- 19 validator tests pass (focused on thingInputSchema)
- 40 backend tests pass (unchanged behavior)
- 6 web tests pass
- All type checks pass

## Related Documentation

- [Shared Validators Package](./13-shared-validators) - Original validators setup
- [Better Convex Folder Structure](./16-better-convex-folder-structure) - Backend organization
