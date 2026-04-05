import { boolean, convexTable, defineSchema, index, integer, text } from "kitcn/orm"

// Auth tables (required by kitcn auth / Better Auth)
export const userTable = convexTable(
	"user",
	{
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean().notNull(),
		image: text(),
		createdAt: integer().notNull(),
		updatedAt: integer().notNull(),
	},
	(t) => [index("email").on(t.email)]
)

export const sessionTable = convexTable(
	"session",
	{
		expiresAt: integer().notNull(),
		token: text().notNull(),
		createdAt: integer().notNull(),
		updatedAt: integer().notNull(),
		ipAddress: text(),
		userAgent: text(),
		userId: text().notNull(),
	},
	(t) => [index("token").on(t.token), index("userId").on(t.userId)]
)

export const accountTable = convexTable(
	"account",
	{
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text().notNull(),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: integer(),
		refreshTokenExpiresAt: integer(),
		scope: text(),
		password: text(),
		createdAt: integer().notNull(),
		updatedAt: integer().notNull(),
	},
	(t) => [index("accountId_providerId").on(t.accountId, t.providerId), index("userId").on(t.userId)]
)

export const verificationTable = convexTable(
	"verification",
	{
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer().notNull(),
		createdAt: integer().notNull(),
		updatedAt: integer().notNull(),
	},
	(t) => [index("identifier").on(t.identifier)]
)

export const jwksTable = convexTable("jwks", {
	publicKey: text().notNull(),
	privateKey: text().notNull(),
	createdAt: integer().notNull(),
	expiresAt: integer(),
})

// App tables
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
	user: userTable,
	session: sessionTable,
	account: accountTable,
	verification: verificationTable,
	jwks: jwksTable,
	things: thingsTable,
}

export default defineSchema(tables, { strict: false })
