import { convex } from "kitcn/auth"

import authConfig from "./auth.config"
import { defineAuth } from "./generated/auth"

export default defineAuth(() => ({
	baseURL: process.env.SITE_URL!,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	plugins: [
		convex({
			authConfig,
			jwks: process.env.JWKS,
		}),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24 * 15,
	},
	telemetry: { enabled: false },
	trustedOrigins: [process.env.SITE_URL!],
}))
