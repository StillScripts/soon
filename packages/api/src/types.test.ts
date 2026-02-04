import { describe, expect, it } from "vitest"

import type { ApiInputs, ApiOutputs, ListThingsInput, Thing, UpdateThingInput } from "./types"

describe("@repo/api/types", () => {
	it("exports Thing type", () => {
		const thing: Thing = {
			_id: "test-id" as Thing["_id"],
			_creationTime: Date.now(),
			title: "Test Thing",
			userId: "user-123",
			imageUrl: null,
		}
		expect(thing.title).toBe("Test Thing")
	})

	it("exports ApiInputs type", () => {
		const inputs: ApiInputs = {} as ApiInputs
		expect(inputs).toBeDefined()
	})

	it("exports ApiOutputs type", () => {
		const outputs: ApiOutputs = {} as ApiOutputs
		expect(outputs).toBeDefined()
	})

	it("exports UpdateThingInput type", () => {
		const input: UpdateThingInput = {
			id: "test-id",
			title: "Updated Title",
		}
		expect(input.id).toBe("test-id")
	})

	it("exports ListThingsInput type", () => {
		const input: ListThingsInput = {
			limit: 10,
		}
		expect(input.limit).toBe(10)
	})
})
