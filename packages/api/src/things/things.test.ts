import { describe, expect, it } from "vitest"

import {
	useThings,
	useThingsCreate,
	useThingsGenerateUploadUrl,
	useThingsGet,
	useThingsList,
	useThingsRemove,
	useThingsUpdate,
} from "./index"

describe("@repo/api/things", () => {
	it("exports all hooks", () => {
		expect(useThingsList).toBeDefined()
		expect(typeof useThingsList).toBe("function")

		expect(useThingsGet).toBeDefined()
		expect(typeof useThingsGet).toBe("function")

		expect(useThingsCreate).toBeDefined()
		expect(typeof useThingsCreate).toBe("function")

		expect(useThingsUpdate).toBeDefined()
		expect(typeof useThingsUpdate).toBe("function")

		expect(useThingsRemove).toBeDefined()
		expect(typeof useThingsRemove).toBe("function")

		expect(useThingsGenerateUploadUrl).toBeDefined()
		expect(typeof useThingsGenerateUploadUrl).toBe("function")

		expect(useThings).toBeDefined()
		expect(typeof useThings).toBe("function")
	})
})
