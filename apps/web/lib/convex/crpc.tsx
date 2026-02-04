"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import { type Api, createCRPCContext } from "@repo/api/context"

const crpcContext = createCRPCContext<Api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const useCRPC = crpcContext.useCRPC
export const useCRPCClient = crpcContext.useCRPCClient
export const CRPCProvider = crpcContext.CRPCProvider
