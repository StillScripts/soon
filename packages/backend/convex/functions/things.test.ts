/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import { describe, expect, it } from "vitest"

import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

/** Type for a thing returned from list/get queries */
type ThingResult = {
	_id: Id<"things">
	_creationTime: number
	title: string
	description?: string
	imageId?: Id<"_storage">
	userId: string
	imageUrl: string | null
}

/**
 * Tests for Things CRUD operations.
 *
 * These tests use convex-test's withIdentity() to mock authentication,
 * which works with our auth middleware that checks ctx.auth.getUserIdentity()
 * before falling back to better-auth.
 *
 * This approach tests the actual production code (things.ts) rather than
 * internal duplicates, ensuring test coverage matches real behavior.
 */

// Module loading for convex-test
const modules = import.meta.glob("./**/*.ts")

/** Create a test instance with a mocked user identity */
function asUser(userId: string) {
	return convexTest(schema, modules).withIdentity({ subject: userId })
}

describe("things.create", () => {
	it("should create a thing with just a title", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "My First Thing",
		})

		expect(id).toBeDefined()
		expect(typeof id).toBe("string")
	})

	it("should create a thing with title and description", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Thing With Description",
			description: "This is a detailed description of my thing.",
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing).toMatchObject({
			title: "Thing With Description",
			description: "This is a detailed description of my thing.",
			userId: "user_123",
		})
	})

	it("should create multiple things for the same user", async () => {
		const t = asUser("user_123")

		await t.mutation(api.things.create, { title: "Thing 1" })
		await t.mutation(api.things.create, { title: "Thing 2" })
		await t.mutation(api.things.create, { title: "Thing 3" })

		const things = await t.query(api.things.list, {})

		expect(things).toHaveLength(3)
	})

	it("should store the correct userId with the thing", async () => {
		const userId = "specific_user_id"
		const t = asUser(userId)

		const id = await t.mutation(api.things.create, {
			title: "User's Thing",
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing?.userId).toBe(userId)
	})
})

describe("things.get", () => {
	it("should return a thing by id", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Get This Thing",
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing).toMatchObject({
			title: "Get This Thing",
			userId: "user_123",
		})
		expect(thing?._id).toBe(id)
		expect(thing?._creationTime).toBeDefined()
	})

	it("should return null for non-existent id", async () => {
		const t = asUser("user_123")

		const thing = await t.query(api.things.get, {
			id: "nonexistent_id_12345",
		})

		expect(thing).toBeNull()
	})

	it("should return null when accessing another user's thing", async () => {
		const t = convexTest(schema, modules)

		// Create thing as user_1
		const id = await t.withIdentity({ subject: "user_1" }).mutation(api.things.create, {
			title: "User 1's Private Thing",
		})

		// Try to access as user_2
		const thing = await t.withIdentity({ subject: "user_2" }).query(api.things.get, { id })

		expect(thing).toBeNull()
	})

	it("should return imageUrl as null when no image is attached", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Thing Without Image",
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing?.imageUrl).toBeNull()
		expect(thing?.imageId).toBeUndefined()
	})
})

describe("things.list", () => {
	it("should return empty array when user has no things", async () => {
		const t = asUser("user_with_no_things")

		const things = await t.query(api.things.list, {})

		expect(things).toEqual([])
	})

	it("should return all things for a user", async () => {
		const t = asUser("user_123")

		await t.mutation(api.things.create, { title: "Thing A" })
		await t.mutation(api.things.create, { title: "Thing B" })

		const things = await t.query(api.things.list, {})

		expect(things).toHaveLength(2)
		expect(things.map((thing: ThingResult) => thing.title)).toContain("Thing A")
		expect(things.map((thing: ThingResult) => thing.title)).toContain("Thing B")
	})

	it("should only return things owned by the specified user", async () => {
		const t = convexTest(schema, modules)

		await t.withIdentity({ subject: "user_1" }).mutation(api.things.create, {
			title: "User 1's Thing",
		})
		await t.withIdentity({ subject: "user_2" }).mutation(api.things.create, {
			title: "User 2's Thing",
		})
		await t.withIdentity({ subject: "user_1" }).mutation(api.things.create, {
			title: "User 1's Second Thing",
		})

		const user1Things = await t.withIdentity({ subject: "user_1" }).query(api.things.list, {})
		const user2Things = await t.withIdentity({ subject: "user_2" }).query(api.things.list, {})

		expect(user1Things).toHaveLength(2)
		expect(user2Things).toHaveLength(1)
		expect(user1Things.every((thing: ThingResult) => thing.userId === "user_1")).toBe(true)
		expect(user2Things.every((thing: ThingResult) => thing.userId === "user_2")).toBe(true)
	})

	it("should respect the limit parameter", async () => {
		const t = asUser("user_123")

		// Create 5 things
		for (let i = 1; i <= 5; i++) {
			await t.mutation(api.things.create, { title: `Thing ${i}` })
		}

		const limitedThings = await t.query(api.things.list, { limit: 3 })

		expect(limitedThings).toHaveLength(3)
	})

	it("should return all things when limit is not provided", async () => {
		const t = asUser("user_123")

		// Create 5 things
		for (let i = 1; i <= 5; i++) {
			await t.mutation(api.things.create, { title: `Thing ${i}` })
		}

		const allThings = await t.query(api.things.list, {})

		expect(allThings).toHaveLength(5)
	})

	it("should include imageUrl as null for things without images", async () => {
		const t = asUser("user_123")

		await t.mutation(api.things.create, { title: "Thing Without Image" })

		const things = await t.query(api.things.list, {})

		expect(things[0]?.imageUrl).toBeNull()
	})
})

describe("things.update", () => {
	it("should update the title of a thing", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, { title: "Original Title" })

		await t.mutation(api.things.update, { id, title: "Updated Title" })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.title).toBe("Updated Title")
	})

	it("should update the description of a thing", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Thing",
			description: "Original description",
		})

		await t.mutation(api.things.update, { id, description: "Updated description" })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.description).toBe("Updated description")
	})

	it("should clear description when set to null", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Thing",
			description: "Has a description",
		})

		await t.mutation(api.things.update, { id, description: null })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.description).toBeUndefined()
	})

	it("should not modify fields that are not provided", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Original Title",
			description: "Original description",
		})

		// Only update title, not description
		await t.mutation(api.things.update, { id, title: "New Title" })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.title).toBe("New Title")
		expect(thing?.description).toBe("Original description")
	})

	it("should throw when updating non-existent thing", async () => {
		const t = asUser("user_123")

		await expect(
			t.mutation(api.things.update, {
				id: "nonexistent_id",
				title: "New Title",
			})
		).rejects.toThrow("Not found or not authorized")
	})

	it("should throw when updating another user's thing", async () => {
		const t = convexTest(schema, modules)

		const id = await t.withIdentity({ subject: "user_1" }).mutation(api.things.create, {
			title: "User 1's Thing",
		})

		await expect(
			t.withIdentity({ subject: "user_2" }).mutation(api.things.update, {
				id,
				title: "Attempted Hijack",
			})
		).rejects.toThrow("Not found or not authorized")

		// Verify original is unchanged
		const thing = await t.withIdentity({ subject: "user_1" }).query(api.things.get, { id })
		expect(thing?.title).toBe("User 1's Thing")
	})

	it("should update multiple fields at once", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, { title: "Original" })

		await t.mutation(api.things.update, {
			id,
			title: "Updated Title",
			description: "Added description",
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing).toMatchObject({
			title: "Updated Title",
			description: "Added description",
		})
	})
})

describe("things.remove", () => {
	it("should remove a thing", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, { title: "Thing to Delete" })

		await t.mutation(api.things.remove, { id })

		const thing = await t.query(api.things.get, { id })

		expect(thing).toBeNull()
	})

	it("should throw when removing non-existent thing", async () => {
		const t = asUser("user_123")

		await expect(t.mutation(api.things.remove, { id: "nonexistent_id" })).rejects.toThrow(
			"Not found or not authorized"
		)
	})

	it("should throw when removing another user's thing", async () => {
		const t = convexTest(schema, modules)

		const id = await t.withIdentity({ subject: "user_1" }).mutation(api.things.create, {
			title: "User 1's Thing",
		})

		await expect(
			t.withIdentity({ subject: "user_2" }).mutation(api.things.remove, { id })
		).rejects.toThrow("Not found or not authorized")

		// Verify thing still exists
		const thing = await t.withIdentity({ subject: "user_1" }).query(api.things.get, { id })
		expect(thing).not.toBeNull()
	})

	it("should remove thing from list after deletion", async () => {
		const t = asUser("user_123")

		const id1 = await t.mutation(api.things.create, { title: "Thing 1" })
		const id2 = await t.mutation(api.things.create, { title: "Thing 2" })

		// Verify both exist
		let things = await t.query(api.things.list, {})
		expect(things).toHaveLength(2)

		// Remove one
		await t.mutation(api.things.remove, { id: id1 })

		// Verify only one remains
		things = await t.query(api.things.list, {})
		expect(things).toHaveLength(1)
		expect(things[0]?._id).toBe(id2)
	})
})

describe("things.generateUploadUrl", () => {
	it("should generate an upload URL", async () => {
		const t = asUser("user_123")

		const url = await t.mutation(api.things.generateUploadUrl, {})

		expect(url).toBeDefined()
		expect(typeof url).toBe("string")
		expect(url.length).toBeGreaterThan(0)
	})
})

describe("user isolation", () => {
	it("should maintain complete isolation between users", async () => {
		const t = convexTest(schema, modules)
		const user1 = t.withIdentity({ subject: "user_1" })
		const user2 = t.withIdentity({ subject: "user_2" })

		// User 1 creates things
		const user1Id1 = await user1.mutation(api.things.create, {
			title: "User 1 - Thing A",
		})
		await user1.mutation(api.things.create, { title: "User 1 - Thing B" })

		// User 2 creates things
		await user2.mutation(api.things.create, { title: "User 2 - Thing X" })

		// Verify user 1 only sees their things
		const user1Things = await user1.query(api.things.list, {})
		expect(user1Things).toHaveLength(2)
		expect(user1Things.every((thing: ThingResult) => thing.title.startsWith("User 1"))).toBe(true)

		// Verify user 2 only sees their things
		const user2Things = await user2.query(api.things.list, {})
		expect(user2Things).toHaveLength(1)
		expect(user2Things[0]?.title).toBe("User 2 - Thing X")

		// User 2 cannot get User 1's thing
		const cannotGet = await user2.query(api.things.get, { id: user1Id1 })
		expect(cannotGet).toBeNull()

		// User 2 cannot update User 1's thing
		await expect(
			user2.mutation(api.things.update, { id: user1Id1, title: "Hacked!" })
		).rejects.toThrow()

		// User 2 cannot delete User 1's thing
		await expect(user2.mutation(api.things.remove, { id: user1Id1 })).rejects.toThrow()
	})
})

describe("edge cases", () => {
	it("should reject empty string title", async () => {
		const t = asUser("user_123")

		// The validator requires title to be at least 1 character
		await expect(t.mutation(api.things.create, { title: "" })).rejects.toThrow()
	})

	it("should handle very long titles", async () => {
		const t = asUser("user_123")
		const longTitle = "A".repeat(200) // Max allowed by validator

		const id = await t.mutation(api.things.create, { title: longTitle })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.title).toBe(longTitle)
		expect(thing?.title.length).toBe(200)
	})

	it("should handle very long descriptions", async () => {
		const t = asUser("user_123")
		const longDescription = "B".repeat(2000) // Max allowed by validator

		const id = await t.mutation(api.things.create, {
			title: "Thing with long description",
			description: longDescription,
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing?.description).toBe(longDescription)
		expect(thing?.description?.length).toBe(2000)
	})

	it("should handle unicode in title and description", async () => {
		const t = asUser("user_123")
		const unicodeTitle = "日本語タイトル 🎉 Ümläuts"
		const unicodeDescription = "Описание на русском 中文描述 العربية"

		const id = await t.mutation(api.things.create, {
			title: unicodeTitle,
			description: unicodeDescription,
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing?.title).toBe(unicodeTitle)
		expect(thing?.description).toBe(unicodeDescription)
	})

	it("should handle rapid create/delete cycles", async () => {
		const t = asUser("user_123")

		// Create and immediately delete
		for (let i = 0; i < 5; i++) {
			const id = await t.mutation(api.things.create, { title: `Ephemeral Thing ${i}` })
			await t.mutation(api.things.remove, { id })
		}

		const things = await t.query(api.things.list, {})
		expect(things).toHaveLength(0)
	})

	it("should handle update to same values (idempotent)", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "Same Title",
			description: "Same Description",
		})

		// Update to same values multiple times
		for (let i = 0; i < 3; i++) {
			await t.mutation(api.things.update, {
				id,
				title: "Same Title",
				description: "Same Description",
			})
		}

		const thing = await t.query(api.things.get, { id })

		expect(thing?.title).toBe("Same Title")
		expect(thing?.description).toBe("Same Description")
	})
})

describe("storage integration", () => {
	it("should create thing with imageId", async () => {
		const t = asUser("user_123")

		// Create a storage entry first using t.run
		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["test image content"]))
		})

		const id = await t.mutation(api.things.create, {
			title: "Thing with Image",
			imageId: storageId as string,
		})

		const thing = await t.query(api.things.get, { id })

		expect(thing?.imageId).toBe(storageId)
		expect(thing?.imageUrl).toBeDefined()
		expect(thing?.imageUrl).not.toBeNull()
	})

	it("should update thing by adding imageId", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, { title: "Thing Without Image" })

		// Verify no image initially
		let thing = await t.query(api.things.get, { id })
		expect(thing?.imageId).toBeUndefined()
		expect(thing?.imageUrl).toBeNull()

		// Add an image
		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["new image"]))
		})

		await t.mutation(api.things.update, { id, imageId: storageId as string })

		thing = await t.query(api.things.get, { id })
		expect(thing?.imageId).toBe(storageId)
		expect(thing?.imageUrl).toBeDefined()
	})

	it("should clear imageId when set to null", async () => {
		const t = asUser("user_123")

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["image to remove"]))
		})

		const id = await t.mutation(api.things.create, {
			title: "Thing with Image to Remove",
			imageId: storageId as string,
		})

		// Clear the image
		await t.mutation(api.things.update, { id, imageId: null })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.imageId).toBeUndefined()
		expect(thing?.imageUrl).toBeNull()
	})

	it("should delete old image when replacing with new image", async () => {
		const t = asUser("user_123")

		// Create thing with first image
		const oldImageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["old image"]))
		})

		const id = await t.mutation(api.things.create, {
			title: "Thing with Replaceable Image",
			imageId: oldImageId as string,
		})

		// Replace with new image
		const newImageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["new image"]))
		})

		await t.mutation(api.things.update, { id, imageId: newImageId as string })

		const thing = await t.query(api.things.get, { id })

		expect(thing?.imageId).toBe(newImageId)
	})

	it("should delete associated image when removing thing", async () => {
		const t = asUser("user_123")

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["image to be deleted with thing"]))
		})

		const id = await t.mutation(api.things.create, {
			title: "Thing with Image to Delete",
			imageId: storageId as string,
		})

		// Delete the thing
		await t.mutation(api.things.remove, { id })

		// Thing should be gone
		const thing = await t.query(api.things.get, { id })
		expect(thing).toBeNull()
	})

	it("should not update imageId when same value is provided", async () => {
		const t = asUser("user_123")

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["stable image"]))
		})

		const id = await t.mutation(api.things.create, {
			title: "Thing with Stable Image",
			imageId: storageId as string,
		})

		// Update with same imageId
		await t.mutation(api.things.update, { id, imageId: storageId as string })

		const thing = await t.query(api.things.get, { id })

		// Image should still be there
		expect(thing?.imageId).toBe(storageId)
	})

	it("should include imageUrl in list results", async () => {
		const t = asUser("user_123")

		const storageId = await t.run(async (ctx) => {
			return ctx.storage.store(new Blob(["listed image"]))
		})

		await t.mutation(api.things.create, {
			title: "Thing in List with Image",
			imageId: storageId as string,
		})

		const things = await t.query(api.things.list, {})

		expect(things).toHaveLength(1)
		expect(things[0]?.imageUrl).toBeDefined()
		expect(things[0]?.imageUrl).not.toBeNull()
	})
})
