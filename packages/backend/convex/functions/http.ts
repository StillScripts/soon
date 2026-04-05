import { httpRouter } from "convex/server"
import { registerRoutes } from "kitcn/auth/http"

import { getAuth } from "./generated/auth"

const http = httpRouter()

registerRoutes(http, getAuth, {
	cors: {
		allowedOrigins: [process.env.SITE_URL!],
	},
})

export default http
