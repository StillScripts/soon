import { api } from "@convex/api"
import type { Api } from "@repo/api/context"
import { convexBetterAuth } from "kitcn/auth/nextjs"

export const { createContext, createCaller, handler } = convexBetterAuth<Api>({
	api,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})
