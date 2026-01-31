# Convex File Storage

Handle file uploads, storage, serving, and management in Convex applications with proper patterns for images, documents, and generated files.

## Documentation Sources

- Primary: https://docs.convex.dev/file-storage
- Upload Files: https://docs.convex.dev/file-storage/upload-files
- Serve Files: https://docs.convex.dev/file-storage/serve-files
- LLM-optimized: https://docs.convex.dev/llms.txt

## Generating Upload URLs

```typescript
export const generateUploadUrl = mutation({
	args: {},
	returns: v.string(),
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl()
	},
})
```

## Client-Side Upload

```typescript
const handleUpload = async (file: File) => {
	// Step 1: Get upload URL
	const uploadUrl = await generateUploadUrl()

	// Step 2: Upload file to storage
	const result = await fetch(uploadUrl, {
		method: "POST",
		headers: { "Content-Type": file.type },
		body: file,
	})

	const { storageId } = await result.json()

	// Step 3: Save file reference to database
	await saveFile({
		storageId,
		fileName: file.name,
		fileType: file.type,
		fileSize: file.size,
	})
}
```

## Saving File References

```typescript
export const saveFile = mutation({
	args: {
		storageId: v.id("_storage"),
		fileName: v.string(),
		fileType: v.string(),
		fileSize: v.number(),
	},
	returns: v.id("files"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("files", {
			storageId: args.storageId,
			fileName: args.fileName,
			fileType: args.fileType,
			fileSize: args.fileSize,
			uploadedAt: Date.now(),
		})
	},
})
```

## Serving Files via URL

```typescript
export const getFileUrl = query({
	args: { storageId: v.id("_storage") },
	returns: v.union(v.string(), v.null()),
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId)
	},
})

export const getFile = query({
	args: { fileId: v.id("files") },
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.fileId)
		if (!file) return null

		const url = await ctx.storage.getUrl(file.storageId)

		return { ...file, url }
	},
})
```

## Storing Generated Files from Actions

```typescript
"use node"

export const generatePDF = action({
	args: { content: v.string() },
	returns: v.id("_storage"),
	handler: async (ctx, args) => {
		const pdfBuffer = await generatePDFFromContent(args.content)
		const blob = new Blob([pdfBuffer], { type: "application/pdf" })
		return await ctx.storage.store(blob)
	},
})
```

## Deleting Files

```typescript
export const deleteFile = mutation({
	args: { fileId: v.id("files") },
	returns: v.null(),
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.fileId)
		if (!file) return null

		// Delete from storage
		await ctx.storage.delete(file.storageId)

		// Delete database record
		await ctx.db.delete(args.fileId)

		return null
	},
})
```

## Best Practices

- Validate file types and sizes on the client before uploading
- Store file metadata (name, type, size) in your own table
- Delete storage files when deleting database references
- Use appropriate Content-Type headers when uploading

## Common Pitfalls

1. **Not setting Content-Type header** - Files may not serve correctly
2. **Forgetting to delete storage** - Orphaned files waste storage
3. **Not validating file types** - Security risk for malicious uploads
4. **Using deprecated getMetadata** - Use ctx.db.system.get instead
