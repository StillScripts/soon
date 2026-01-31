import { convexTest } from "convex-test"
import { describe, expect, it } from "vitest"

import { internal } from "./_generated/api"
import schema from "./schema"

/**
 * Tests for Things CRUD operations.
 *
 * These tests use the internal functions which bypass the better-auth middleware,
 * allowing us to test the core business logic with convex-test.
 *
 * The auth middleware itself (which uses better-auth) is tested separately
 * through integration tests.
 */

// Module loading for convex-test
const modules = import.meta.glob("./**/*.ts")

describe("things.create", () => {
	it("should create a thing with just a title", async () => {
		const t = convexTest(schema, modules)

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: "My First Thing",
		})

		expect(id).toBeDefined()
		expect(typeof id).toBe("string")
	})

	it("should create a thing with title and description", async () => {
		const t = convexTest(schema, modules)

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: "Thing With Description",
			description: "This is a detailed description of my thing.",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: id as string,
		})

		expect(thing).toMatchObject({
			title: "Thing With Description",
			description: "This is a detailed description of my thing.",
			userId: "user_123",
		})
	})

	it("should create multiple things for the same user", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing 1",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing 2",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing 3",
		})

		const things = await t.query(internal.thingsInternal.listInternal, {
			userId,
		})

		expect(things).toHaveLength(3)
	})

	it("should store the correct userId with the thing", async () => {
		const t = convexTest(schema, modules)
		const userId = "specific_user_id"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "User's Thing",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.userId).toBe(userId)
	})
})

describe("things.get", () => {
	it("should return a thing by id", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Get This Thing",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing).toMatchObject({
			title: "Get This Thing",
			userId,
		})
		expect(thing?._id).toBe(id)
		expect(thing?._creationTime).toBeDefined()
	})

	it("should return null for non-existent id", async () => {
		const t = convexTest(schema, modules)

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: "nonexistent_id_12345",
		})

		expect(thing).toBeNull()
	})

	it("should return null when accessing another user's thing", async () => {
		const t = convexTest(schema, modules)

		// Create thing as user_1
		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1's Private Thing",
		})

		// Try to access as user_2
		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_2",
			id: id as string,
		})

		expect(thing).toBeNull()
	})

	it("should return imageUrl as null when no image is attached", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing Without Image",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.imageUrl).toBeNull()
		expect(thing?.imageId).toBeUndefined()
	})
})

describe("things.list", () => {
	it("should return empty array when user has no things", async () => {
		const t = convexTest(schema, modules)

		const things = await t.query(internal.thingsInternal.listInternal, {
			userId: "user_with_no_things",
		})

		expect(things).toEqual([])
	})

	it("should return all things for a user", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing A",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing B",
		})

		const things = await t.query(internal.thingsInternal.listInternal, {
			userId,
		})

		expect(things).toHaveLength(2)
		expect(things.map((t) => t.title)).toContain("Thing A")
		expect(things.map((t) => t.title)).toContain("Thing B")
	})

	it("should only return things owned by the specified user", async () => {
		const t = convexTest(schema, modules)

		await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1's Thing",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_2",
			title: "User 2's Thing",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1's Second Thing",
		})

		const user1Things = await t.query(internal.thingsInternal.listInternal, {
			userId: "user_1",
		})
		const user2Things = await t.query(internal.thingsInternal.listInternal, {
			userId: "user_2",
		})

		expect(user1Things).toHaveLength(2)
		expect(user2Things).toHaveLength(1)
		expect(user1Things.every((t) => t.userId === "user_1")).toBe(true)
		expect(user2Things.every((t) => t.userId === "user_2")).toBe(true)
	})

	it("should respect the limit parameter", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		// Create 5 things
		for (let i = 1; i <= 5; i++) {
			await t.mutation(internal.thingsInternal.createInternal, {
				userId,
				title: `Thing ${i}`,
			})
		}

		const limitedThings = await t.query(internal.thingsInternal.listInternal, {
			userId,
			limit: 3,
		})

		expect(limitedThings).toHaveLength(3)
	})

	it("should return all things when limit is not provided", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		// Create 5 things
		for (let i = 1; i <= 5; i++) {
			await t.mutation(internal.thingsInternal.createInternal, {
				userId,
				title: `Thing ${i}`,
			})
		}

		const allThings = await t.query(internal.thingsInternal.listInternal, {
			userId,
		})

		expect(allThings).toHaveLength(5)
	})

	it("should include imageUrl as null for things without images", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing Without Image",
		})

		const things = await t.query(internal.thingsInternal.listInternal, {
			userId,
		})

		expect(things[0]?.imageUrl).toBeNull()
	})
})

describe("things.update", () => {
	it("should update the title of a thing", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Original Title",
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			title: "Updated Title",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.title).toBe("Updated Title")
	})

	it("should update the description of a thing", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing",
			description: "Original description",
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			description: "Updated description",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.description).toBe("Updated description")
	})

	it("should clear description when set to null", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing",
			description: "Has a description",
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			description: null,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.description).toBeUndefined()
	})

	it("should not modify fields that are not provided", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Original Title",
			description: "Original description",
		})

		// Only update title, not description
		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			title: "New Title",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.title).toBe("New Title")
		expect(thing?.description).toBe("Original description")
	})

	it("should throw when updating non-existent thing", async () => {
		const t = convexTest(schema, modules)

		await expect(
			t.mutation(internal.thingsInternal.updateInternal, {
				userId: "user_123",
				id: "nonexistent_id",
				title: "New Title",
			})
		).rejects.toThrow("Not found or not authorized")
	})

	it("should throw when updating another user's thing", async () => {
		const t = convexTest(schema, modules)

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1's Thing",
		})

		await expect(
			t.mutation(internal.thingsInternal.updateInternal, {
				userId: "user_2",
				id: id as string,
				title: "Attempted Hijack",
			})
		).rejects.toThrow("Not found or not authorized")

		// Verify original is unchanged
		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_1",
			id: id as string,
		})
		expect(thing?.title).toBe("User 1's Thing")
	})

	it("should update multiple fields at once", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Original",
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			title: "Updated Title",
			description: "Added description",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing).toMatchObject({
			title: "Updated Title",
			description: "Added description",
		})
	})
})

describe("things.remove", () => {
	it("should remove a thing", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing to Delete",
		})

		await t.mutation(internal.thingsInternal.removeInternal, {
			userId,
			id: id as string,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing).toBeNull()
	})

	it("should throw when removing non-existent thing", async () => {
		const t = convexTest(schema, modules)

		await expect(
			t.mutation(internal.thingsInternal.removeInternal, {
				userId: "user_123",
				id: "nonexistent_id",
			})
		).rejects.toThrow("Not found or not authorized")
	})

	it("should throw when removing another user's thing", async () => {
		const t = convexTest(schema, modules)

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1's Thing",
		})

		await expect(
			t.mutation(internal.thingsInternal.removeInternal, {
				userId: "user_2",
				id: id as string,
			})
		).rejects.toThrow("Not found or not authorized")

		// Verify thing still exists
		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_1",
			id: id as string,
		})
		expect(thing).not.toBeNull()
	})

	it("should remove thing from list after deletion", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id1 = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing 1",
		})
		const id2 = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing 2",
		})

		// Verify both exist
		let things = await t.query(internal.thingsInternal.listInternal, { userId })
		expect(things).toHaveLength(2)

		// Remove one
		await t.mutation(internal.thingsInternal.removeInternal, {
			userId,
			id: id1 as string,
		})

		// Verify only one remains
		things = await t.query(internal.thingsInternal.listInternal, { userId })
		expect(things).toHaveLength(1)
		expect(things[0]?._id).toBe(id2)
	})
})

describe("things.generateUploadUrl", () => {
	it("should generate an upload URL", async () => {
		const t = convexTest(schema, modules)

		const url = await t.mutation(internal.thingsInternal.generateUploadUrlInternal, {})

		expect(url).toBeDefined()
		expect(typeof url).toBe("string")
		expect(url.length).toBeGreaterThan(0)
	})
})

describe("user isolation", () => {
	it("should maintain complete isolation between users", async () => {
		const t = convexTest(schema, modules)

		// User 1 creates things
		const user1Id1 = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1 - Thing A",
		})
		await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_1",
			title: "User 1 - Thing B",
		})

		// User 2 creates things
		await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_2",
			title: "User 2 - Thing X",
		})

		// Verify user 1 only sees their things
		const user1Things = await t.query(internal.thingsInternal.listInternal, {
			userId: "user_1",
		})
		expect(user1Things).toHaveLength(2)
		expect(user1Things.every((t) => t.title.startsWith("User 1"))).toBe(true)

		// Verify user 2 only sees their things
		const user2Things = await t.query(internal.thingsInternal.listInternal, {
			userId: "user_2",
		})
		expect(user2Things).toHaveLength(1)
		expect(user2Things[0]?.title).toBe("User 2 - Thing X")

		// User 2 cannot get User 1's thing
		const cannotGet = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_2",
			id: user1Id1 as string,
		})
		expect(cannotGet).toBeNull()

		// User 2 cannot update User 1's thing
		await expect(
			t.mutation(internal.thingsInternal.updateInternal, {
				userId: "user_2",
				id: user1Id1 as string,
				title: "Hacked!",
			})
		).rejects.toThrow()

		// User 2 cannot delete User 1's thing
		await expect(
			t.mutation(internal.thingsInternal.removeInternal, {
				userId: "user_2",
				id: user1Id1 as string,
			})
		).rejects.toThrow()
	})
})

describe("edge cases", () => {
	it("should handle empty string title (if allowed by schema)", async () => {
		const t = convexTest(schema, modules)

		// This should work at the Convex level (schema allows empty strings)
		// Validation happens at the validator layer, which is tested separately
		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: "",
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: id as string,
		})

		expect(thing?.title).toBe("")
	})

	it("should handle very long titles", async () => {
		const t = convexTest(schema, modules)
		const longTitle = "A".repeat(200) // Max allowed by validator

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: longTitle,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: id as string,
		})

		expect(thing?.title).toBe(longTitle)
		expect(thing?.title.length).toBe(200)
	})

	it("should handle very long descriptions", async () => {
		const t = convexTest(schema, modules)
		const longDescription = "B".repeat(2000) // Max allowed by validator

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: "Thing with long description",
			description: longDescription,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: id as string,
		})

		expect(thing?.description).toBe(longDescription)
		expect(thing?.description?.length).toBe(2000)
	})

	it("should handle unicode in title and description", async () => {
		const t = convexTest(schema, modules)
		const unicodeTitle = "日本語タイトル 🎉 Ümläuts"
		const unicodeDescription = "Описание на русском 中文描述 العربية"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId: "user_123",
			title: unicodeTitle,
			description: unicodeDescription,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId: "user_123",
			id: id as string,
		})

		expect(thing?.title).toBe(unicodeTitle)
		expect(thing?.description).toBe(unicodeDescription)
	})

	it("should handle rapid create/delete cycles", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		// Create and immediately delete
		for (let i = 0; i < 5; i++) {
			const id = await t.mutation(internal.thingsInternal.createInternal, {
				userId,
				title: `Ephemeral Thing ${i}`,
			})
			await t.mutation(internal.thingsInternal.removeInternal, {
				userId,
				id: id as string,
			})
		}

		const things = await t.query(internal.thingsInternal.listInternal, { userId })
		expect(things).toHaveLength(0)
	})

	it("should handle update to same values (idempotent)", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Same Title",
			description: "Same Description",
		})

		// Update to same values multiple times
		for (let i = 0; i < 3; i++) {
			await t.mutation(internal.thingsInternal.updateInternal, {
				userId,
				id: id as string,
				title: "Same Title",
				description: "Same Description",
			})
		}

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.title).toBe("Same Title")
		expect(thing?.description).toBe("Same Description")
	})
})

describe("storage integration", () => {
	it("should create thing with imageId", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		// Create a storage entry first using t.run
		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["test image content"]))
		})

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing with Image",
			imageId: storageId as string,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.imageId).toBe(storageId)
		expect(thing?.imageUrl).toBeDefined()
		expect(thing?.imageUrl).not.toBeNull()
	})

	it("should update thing by adding imageId", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing Without Image",
		})

		// Verify no image initially
		let thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})
		expect(thing?.imageId).toBeUndefined()
		expect(thing?.imageUrl).toBeNull()

		// Add an image
		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["new image"]))
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			imageId: storageId as string,
		})

		thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})
		expect(thing?.imageId).toBe(storageId)
		expect(thing?.imageUrl).toBeDefined()
	})

	it("should clear imageId when set to null", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["image to remove"]))
		})

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing with Image to Remove",
			imageId: storageId as string,
		})

		// Clear the image
		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			imageId: null,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.imageId).toBeUndefined()
		expect(thing?.imageUrl).toBeNull()
	})

	it("should delete old image when replacing with new image", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		// Create thing with first image
		const oldImageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["old image"]))
		})

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing with Replaceable Image",
			imageId: oldImageId as string,
		})

		// Replace with new image
		const newImageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["new image"]))
		})

		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			imageId: newImageId as string,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		expect(thing?.imageId).toBe(newImageId)
	})

	it("should delete associated image when removing thing", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["image to be deleted with thing"]))
		})

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing with Image to Delete",
			imageId: storageId as string,
		})

		// Delete the thing
		await t.mutation(internal.thingsInternal.removeInternal, {
			userId,
			id: id as string,
		})

		// Thing should be gone
		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})
		expect(thing).toBeNull()
	})

	it("should not update imageId when same value is provided", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["stable image"]))
		})

		const id = await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing with Stable Image",
			imageId: storageId as string,
		})

		// Update with same imageId
		await t.mutation(internal.thingsInternal.updateInternal, {
			userId,
			id: id as string,
			imageId: storageId as string,
		})

		const thing = await t.query(internal.thingsInternal.getInternal, {
			userId,
			id: id as string,
		})

		// Image should still be there
		expect(thing?.imageId).toBe(storageId)
	})

	it("should include imageUrl in list results", async () => {
		const t = convexTest(schema, modules)
		const userId = "user_123"

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["listed image"]))
		})

		await t.mutation(internal.thingsInternal.createInternal, {
			userId,
			title: "Thing in List with Image",
			imageId: storageId as string,
		})

		const things = await t.query(internal.thingsInternal.listInternal, {
			userId,
		})

		expect(things).toHaveLength(1)
		expect(things[0]?.imageUrl).toBeDefined()
		expect(things[0]?.imageUrl).not.toBeNull()
	})
})
