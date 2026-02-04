import { describe, expect, it } from "vitest"

import { type Api, type ConvexQueryClient, createCRPCContext } from "./index"

describe("@repo/api/context", () => {
	it("exports createCRPCContext function", () => {
		expect(createCRPCContext).toBeDefined()
		expect(typeof createCRPCContext).toBe("function")
	})

	it("exports Api type", () => {
		// Type-level test - if this compiles, the type is exported correctly
		const apiTypeCheck: Api | null = null
		expect(apiTypeCheck).toBeNull()
	})

	it("exports ConvexQueryClient type", () => {
		// Type-level test
		const clientTypeCheck: ConvexQueryClient | null = null
		expect(clientTypeCheck).toBeNull()
	})
})
