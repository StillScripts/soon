"use client"

import type { api as ApiType } from "@convex/api"
import { type ConvexQueryClient, createCRPCContext } from "backend/react"

export { createCRPCContext }
export type { ConvexQueryClient }

/**
 * Type of the Convex API.
 * Use this with createCRPCContext for proper type inference.
 */
export type Api = typeof ApiType
