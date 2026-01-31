---
title: "Guide 17: Things Description & Image Upload"
description: Adding description and image fields to Things with Convex file storage
---

# Things Description & Image Upload

This guide documents how we added description and image upload capabilities to the Things entity using Convex file storage.

## What We Did

Extended the Things entity to support:
- **Description**: Optional text field (max 2000 characters)
- **Image**: Optional image upload using Convex storage

## Schema Changes

Updated `packages/backend/convex/functions/schema.ts`:

```typescript
things: defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  imageId: v.optional(v.id("_storage")),
  userId: v.string(),
}).index("by_user", ["userId"]),
```

The `imageId` references Convex's built-in `_storage` table which handles file storage automatically.

## Validators

Updated `packages/validators/src/things.ts`:

```typescript
export const createThingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  imageId: z.string().optional(),
})

export const updateThingSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  imageId: z.string().nullable().optional(),
})
```

Note: `nullable().optional()` allows setting fields back to `null` (remove) vs `undefined` (no change).

## Backend Mutations

### Generate Upload URL

Added a mutation to get a signed upload URL from Convex storage:

```typescript
export const generateUploadUrl = authMutation
  .output(z.string())
  .mutation(async ({ ctx }) => {
    return await ctx.storage.generateUploadUrl()
  })
```

### Create with Image

The create mutation accepts an optional `imageId`:

```typescript
export const create = authMutation
  .input(createThingSchema)
  .output(zid("things"))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", {
      title: input.title,
      description: input.description,
      imageId: input.imageId as Id<"_storage"> | undefined,
      userId: ctx.userId,
    })
  })
```

### List with Image URLs

The list query resolves `imageId` to actual URLs:

```typescript
export const list = authQuery
  .input(listThingsSchema)
  .output(z.array(thingOutputSchema))
  .query(async ({ ctx, input }) => {
    const things = await ctx.db.query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .collect()

    return Promise.all(
      things.map(async (thing) => ({
        ...thing,
        imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
      }))
    )
  })
```

### Delete with Image Cleanup

When deleting a thing, we also delete its associated image:

```typescript
export const remove = authMutation
  .input(removeThingSchema)
  .mutation(async ({ ctx, input }) => {
    const thing = await ctx.db.get(input.id as Id<"things">)
    if (!thing || thing.userId !== ctx.userId) {
      throw new Error("Not found or not authorized")
    }
    if (thing.imageId) {
      await ctx.storage.delete(thing.imageId)
    }
    await ctx.db.delete(input.id as Id<"things">)
  })
```

## Frontend Implementation

### Image Upload Flow

1. User selects a file
2. Call `generateUploadUrl` to get a signed URL
3. POST the file to that URL
4. Receive `storageId` in response
5. Pass `storageId` as `imageId` when creating/updating

```typescript
const handleImageUpload = async (file: File) => {
  // Get signed upload URL
  const uploadUrl = await generateUploadUrl.mutateAsync()

  // Upload file directly to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  })

  const { storageId } = await result.json()
  // Use storageId as imageId in create/update
}
```

### Create Form

The create form includes:
- Image upload area with preview
- Title input (required)
- Description textarea (optional)

```typescript
const form = useForm({
  defaultValues: {
    title: "",
    description: "",
  },
  onSubmit: async ({ value }) => {
    let imageId: string | undefined

    if (imageFile) {
      const uploadUrl = await generateUploadUrl.mutateAsync()
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      })
      const json = await result.json()
      imageId = json.storageId
    }

    await createThing.mutateAsync({
      title: value.title.trim(),
      description: value.description.trim() || undefined,
      imageId,
    })
  },
})
```

### Inline Editing

Each thing item has an "Edit" button that switches to edit mode:
- Shows current image with option to replace/remove
- Editable title and description fields
- Save/Cancel buttons

### Displaying Images

The list displays images from the `imageUrl` field returned by the server:

```tsx
{thing.imageUrl && (
  <img
    src={thing.imageUrl}
    alt={thing.title}
    className="h-16 w-16 shrink-0 rounded-lg object-cover"
  />
)}
```

## Tailwind CSS Fix

During this feature, we discovered that Tailwind wasn't scanning the UI package for classes. Fixed by adding `@source` directive in `apps/web/app/globals.css`:

```css
@import "@repo/ui/styles/globals.css";

/* Scan UI package components for Tailwind classes */
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

This tells Tailwind v4 to scan the UI package's component files when generating CSS.

## Key Patterns

### Convex File Storage

- Files are stored in Convex's `_storage` system table
- Use `generateUploadUrl()` to get a signed URL for direct uploads
- Store the `storageId` as a reference (`v.id("_storage")`)
- Use `storage.getUrl(id)` to get a public URL for display
- Use `storage.delete(id)` to remove files

### Nullable vs Optional in Updates

For update operations:
- `undefined` = don't change this field
- `null` = remove/clear this field

This is why `updateThingSchema` uses `.nullable().optional()` for fields that can be cleared.

## Files Changed

| File | Change |
|------|--------|
| `packages/backend/convex/functions/schema.ts` | Added `description` and `imageId` fields |
| `packages/backend/convex/functions/things.ts` | Added `generateUploadUrl`, updated all mutations |
| `packages/validators/src/things.ts` | Added validators for new fields |
| `apps/web/app/page.tsx` | Image upload UI, description field, inline editing |
| `apps/web/app/globals.css` | Added `@source` for UI package |
