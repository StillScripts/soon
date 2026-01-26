"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import type { Api } from "@convex/types"
import { createCRPCContext } from "better-convex/react"

const crpcContext = createCRPCContext<Api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const CRPCProvider = crpcContext.CRPCProvider
export const useCRPC = crpcContext.useCRPC
export const useCRPCClient = crpcContext.useCRPCClient
