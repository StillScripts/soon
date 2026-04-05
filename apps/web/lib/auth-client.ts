"use client"
import { createAuthClient } from "better-auth/react"
import { convexClient } from "kitcn/auth/client"

export const authClient = createAuthClient({
	plugins: [convexClient()],
})
