import type { AuthConfig } from "convex/server"
import { getAuthConfigProvider } from "kitcn/auth/config"

export default {
	providers: [
		process.env.JWKS ? getAuthConfigProvider({ jwks: process.env.JWKS }) : getAuthConfigProvider(),
	],
} satisfies AuthConfig
