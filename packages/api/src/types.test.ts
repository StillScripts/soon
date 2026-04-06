import { describe, expectTypeOf, it } from "vitest"

import type { Thing, ThingId } from "./types"

describe("Thing type", () => {
	it("has schema fields", () => {
		expectTypeOf<Thing>().toHaveProperty("_id")
		expectTypeOf<Thing>().toHaveProperty("title")
		expectTypeOf<Thing>().toHaveProperty("description")
		expectTypeOf<Thing>().toHaveProperty("imageId")
		expectTypeOf<Thing>().toHaveProperty("userId")
		expectTypeOf<Thing>().toHaveProperty("_creationTime")
	})

	it("has computed imageUrl field", () => {
		expectTypeOf<Thing["imageUrl"]>().toEqualTypeOf<string | null>()
	})

	it("has string title", () => {
		expectTypeOf<Thing["title"]>().toBeString()
	})

	it("has optional description", () => {
		expectTypeOf<Thing["description"]>().toEqualTypeOf<string | undefined>()
	})
})

describe("ThingId type", () => {
	it("is assignable to string", () => {
		expectTypeOf<ThingId>().toMatchTypeOf<string>()
	})
})
