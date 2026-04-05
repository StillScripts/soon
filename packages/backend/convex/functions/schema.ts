import { convexTable, defineSchema, id, index, text } from "kitcn/orm"

export const thingsTable = convexTable(
	"things",
	{
		title: text().notNull(),
		description: text(),
		imageId: id("_storage"),
		userId: text().notNull(),
	},
	(t) => [index("by_user").on(t.userId)]
)

export const tables = {
	things: thingsTable,
}

export default defineSchema(tables, { strict: false })
