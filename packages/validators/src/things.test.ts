import { describe, expect, it } from "vitest"
import {
  createThingSchema,
  getThingSchema,
  listThingsSchema,
  removeThingSchema,
} from "./things.js"

describe("createThingSchema", () => {
  it("should validate a valid title", () => {
    const result = createThingSchema.safeParse({ title: "My Thing" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("My Thing")
    }
  })

  it("should accept a title with exactly 1 character", () => {
    const result = createThingSchema.safeParse({ title: "A" })
    expect(result.success).toBe(true)
  })

  it("should accept a title with exactly 200 characters", () => {
    const title = "A".repeat(200)
    const result = createThingSchema.safeParse({ title })
    expect(result.success).toBe(true)
  })

  it("should reject an empty title", () => {
    const result = createThingSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Title is required")
    }
  })

  it("should reject a title longer than 200 characters", () => {
    const title = "A".repeat(201)
    const result = createThingSchema.safeParse({ title })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Title must be 200 characters or less"
      )
    }
  })

  it("should reject missing title field", () => {
    const result = createThingSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("should reject non-string title", () => {
    const result = createThingSchema.safeParse({ title: 123 })
    expect(result.success).toBe(false)
  })

  it("should reject null title", () => {
    const result = createThingSchema.safeParse({ title: null })
    expect(result.success).toBe(false)
  })
})

describe("getThingSchema", () => {
  it("should validate a valid id", () => {
    const result = getThingSchema.safeParse({ id: "123abc" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe("123abc")
    }
  })

  it("should accept any string as id", () => {
    const result = getThingSchema.safeParse({ id: "" })
    expect(result.success).toBe(true)
  })

  it("should reject missing id field", () => {
    const result = getThingSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("should reject non-string id", () => {
    const result = getThingSchema.safeParse({ id: 123 })
    expect(result.success).toBe(false)
  })

  it("should reject null id", () => {
    const result = getThingSchema.safeParse({ id: null })
    expect(result.success).toBe(false)
  })
})

describe("removeThingSchema", () => {
  it("should validate a valid id", () => {
    const result = removeThingSchema.safeParse({ id: "456def" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe("456def")
    }
  })

  it("should accept any string as id", () => {
    const result = removeThingSchema.safeParse({ id: "" })
    expect(result.success).toBe(true)
  })

  it("should reject missing id field", () => {
    const result = removeThingSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("should reject non-string id", () => {
    const result = removeThingSchema.safeParse({ id: 123 })
    expect(result.success).toBe(false)
  })

  it("should reject null id", () => {
    const result = removeThingSchema.safeParse({ id: null })
    expect(result.success).toBe(false)
  })
})

describe("listThingsSchema", () => {
  it("should validate when limit is not provided", () => {
    const result = listThingsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBeUndefined()
    }
  })

  it("should validate a valid limit", () => {
    const result = listThingsSchema.safeParse({ limit: 50 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(50)
    }
  })

  it("should accept limit of 1", () => {
    const result = listThingsSchema.safeParse({ limit: 1 })
    expect(result.success).toBe(true)
  })

  it("should accept limit of 100", () => {
    const result = listThingsSchema.safeParse({ limit: 100 })
    expect(result.success).toBe(true)
  })

  it("should reject limit of 0", () => {
    const result = listThingsSchema.safeParse({ limit: 0 })
    expect(result.success).toBe(false)
  })

  it("should reject limit less than 1", () => {
    const result = listThingsSchema.safeParse({ limit: -5 })
    expect(result.success).toBe(false)
  })

  it("should reject limit greater than 100", () => {
    const result = listThingsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it("should reject non-number limit", () => {
    const result = listThingsSchema.safeParse({ limit: "50" })
    expect(result.success).toBe(false)
  })

  it("should reject null limit", () => {
    const result = listThingsSchema.safeParse({ limit: null })
    expect(result.success).toBe(false)
  })

  it("should reject decimal limit", () => {
    const result = listThingsSchema.safeParse({ limit: 50.5 })
    expect(result.success).toBe(false)
  })
})
