import { describe, expect, it } from "vitest"

import { thingInputSchema } from "./things.js"

describe("thingInputSchema", () => {
	describe("title field", () => {
		it("should validate a valid title", () => {
			const result = thingInputSchema.safeParse({ title: "My Thing" })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.title).toBe("My Thing")
			}
		})

		it("should accept a title with exactly 1 character", () => {
			const result = thingInputSchema.safeParse({ title: "A" })
			expect(result.success).toBe(true)
		})

		it("should accept a title with exactly 200 characters", () => {
			const title = "A".repeat(200)
			const result = thingInputSchema.safeParse({ title })
			expect(result.success).toBe(true)
		})

		it("should reject an empty title", () => {
			const result = thingInputSchema.safeParse({ title: "" })
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe("Title is required")
			}
		})

		it("should reject a title longer than 200 characters", () => {
			const title = "A".repeat(201)
			const result = thingInputSchema.safeParse({ title })
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe("Title must be 200 characters or less")
			}
		})

		it("should reject missing title field", () => {
			const result = thingInputSchema.safeParse({})
			expect(result.success).toBe(false)
		})

		it("should reject non-string title", () => {
			const result = thingInputSchema.safeParse({ title: 123 })
			expect(result.success).toBe(false)
		})

		it("should reject null title", () => {
			const result = thingInputSchema.safeParse({ title: null })
			expect(result.success).toBe(false)
		})
	})

	describe("description field", () => {
		it("should accept valid description", () => {
			const result = thingInputSchema.safeParse({
				title: "Test",
				description: "A description",
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.description).toBe("A description")
			}
		})

		it("should accept missing description (optional)", () => {
			const result = thingInputSchema.safeParse({ title: "Test" })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.description).toBeUndefined()
			}
		})

		it("should accept description with exactly 2000 characters", () => {
			const description = "A".repeat(2000)
			const result = thingInputSchema.safeParse({ title: "Test", description })
			expect(result.success).toBe(true)
		})

		it("should reject description longer than 2000 characters", () => {
			const description = "A".repeat(2001)
			const result = thingInputSchema.safeParse({ title: "Test", description })
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe("Description must be 2000 characters or less")
			}
		})

		it("should reject non-string description", () => {
			const result = thingInputSchema.safeParse({ title: "Test", description: 123 })
			expect(result.success).toBe(false)
		})
	})

	describe("imageId field", () => {
		it("should accept valid imageId", () => {
			const result = thingInputSchema.safeParse({
				title: "Test",
				imageId: "img_123",
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.imageId).toBe("img_123")
			}
		})

		it("should accept missing imageId (optional)", () => {
			const result = thingInputSchema.safeParse({ title: "Test" })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.imageId).toBeUndefined()
			}
		})

		it("should reject non-string imageId", () => {
			const result = thingInputSchema.safeParse({ title: "Test", imageId: 123 })
			expect(result.success).toBe(false)
		})
	})

	describe("complete object", () => {
		it("should accept all fields together", () => {
			const result = thingInputSchema.safeParse({
				title: "My Thing",
				description: "A description",
				imageId: "img_123",
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).toEqual({
					title: "My Thing",
					description: "A description",
					imageId: "img_123",
				})
			}
		})

		it("should accept title only (minimal valid input)", () => {
			const result = thingInputSchema.safeParse({ title: "Just a title" })
			expect(result.success).toBe(true)
		})

		it("should strip unknown fields", () => {
			const result = thingInputSchema.safeParse({
				title: "Test",
				unknownField: "should be stripped",
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).not.toHaveProperty("unknownField")
			}
		})
	})
})
