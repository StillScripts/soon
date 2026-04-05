import { convexTable, defineSchema, index, text } from "kitcn/orm"

export const thingsTable = convexTable(
	"things",
	{
		title: text().notNull(),
		description: text(),
		imageId: text(),
		userId: text().notNull(),
	},
	(t) => [index("by_user").on(t.userId)]
)

export const tables = {
	things: thingsTable,
}

export default defineSchema(tables, { strict: false })
