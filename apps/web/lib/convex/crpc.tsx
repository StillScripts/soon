"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import { createCRPCContext } from "backend/react"

const crpcContext = createCRPCContext<typeof api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const useCRPC = crpcContext.useCRPC
export const useCRPCClient = crpcContext.useCRPCClient
export const CRPCProvider = crpcContext.CRPCProvider
