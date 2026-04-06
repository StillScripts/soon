"use client"

import { useMutation, useQuery } from "convex/react"

import { api } from "../index"
import type { Thing } from "../types"

/** Hook for listing all Things for the current user. */
export function useThingsList(options: { limit?: number } = {}) {
	return useQuery(api.things.list, options) as Thing[] | undefined
}

/** Hook for getting a single Thing by ID. */
export function useThingsGet(id: string) {
	return useQuery(api.things.get, { id }) as Thing | null | undefined
}

/** Hook for creating a new Thing. Returns a mutation function. */
export function useThingsCreate() {
	return useMutation(api.things.create)
}

/** Hook for updating an existing Thing. Returns a mutation function. */
export function useThingsUpdate() {
	return useMutation(api.things.update)
}

/** Hook for deleting a Thing. Returns a mutation function. */
export function useThingsRemove() {
	return useMutation(api.things.remove)
}

/** Hook for generating an upload URL for Thing images. Returns a mutation function. */
export function useThingsGenerateUploadUrl() {
	return useMutation(api.things.generateUploadUrl)
}

export type { Thing }
