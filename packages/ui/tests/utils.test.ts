import { describe, expect, test } from "vitest"
import { cn } from "../src/lib/utils"

describe("cn utility", () => {
	test("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar")
	})

	test("handles conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
	})

	test("merges Tailwind classes correctly", () => {
		// tailwind-merge should resolve conflicts
		expect(cn("p-4", "p-2")).toBe("p-2")
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
	})

	test("handles arrays", () => {
		expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz")
	})

	test("handles undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
	})
})
