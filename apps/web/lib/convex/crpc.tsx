"use client"

import { createApiContext } from "@repo/api/context"

const crpcContext = createApiContext(process.env.NEXT_PUBLIC_CONVEX_SITE_URL!)

export const useCRPC = crpcContext.useCRPC
export const useCRPCClient = crpcContext.useCRPCClient
export const CRPCProvider = crpcContext.CRPCProvider
