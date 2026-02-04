"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Api } from "../context"
import type { Thing, UpdateThingInput } from "../types"

type CRPC = ReturnType<typeof import("backend/react").createCRPCContext<Api>>["useCRPC"]

/**
 * Hook for listing all Things for the current user.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param options - Optional list parameters (limit)
 * @returns Query result with Things array
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const { data: things, isPending } = useThingsList(crpc)
 * ```
 */
export function useThingsList(crpc: ReturnType<CRPC>, options: { limit?: number } = {}) {
	return useQuery(crpc.things.list.queryOptions(options))
}

/**
 * Hook for getting a single Thing by ID.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param id - The Thing ID to fetch
 * @returns Query result with Thing or null
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const { data: thing } = useThingsGet(crpc, thingId)
 * ```
 */
export function useThingsGet(crpc: ReturnType<CRPC>, id: string) {
	return useQuery(crpc.things.get.queryOptions({ id }))
}

/**
 * Hook for creating a new Thing.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param options - Mutation options (onSuccess, onError, etc.)
 * @returns Mutation for creating Things
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const createThing = useThingsCreate(crpc, {
 *   onSuccess: () => queryClient.invalidateQueries(crpc.things.list.queryFilter({}))
 * })
 * await createThing.mutateAsync({ title: "New Thing" })
 * ```
 */
export function useThingsCreate(
	crpc: ReturnType<CRPC>,
	options?: Parameters<typeof crpc.things.create.mutationOptions>[0]
) {
	return useMutation(crpc.things.create.mutationOptions(options ?? {}))
}

/**
 * Hook for updating an existing Thing.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param options - Mutation options (onSuccess, onError, etc.)
 * @returns Mutation for updating Things
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const updateThing = useThingsUpdate(crpc, { onSuccess: invalidateThings })
 * await updateThing.mutateAsync({ id: thingId, title: "Updated" })
 * ```
 */
export function useThingsUpdate(
	crpc: ReturnType<CRPC>,
	options?: Parameters<typeof crpc.things.update.mutationOptions>[0]
) {
	return useMutation(crpc.things.update.mutationOptions(options ?? {}))
}

/**
 * Hook for deleting a Thing.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param options - Mutation options (onSuccess, onError, etc.)
 * @returns Mutation for removing Things
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const deleteThing = useThingsRemove(crpc, { onSuccess: invalidateThings })
 * await deleteThing.mutateAsync({ id: thingId })
 * ```
 */
export function useThingsRemove(
	crpc: ReturnType<CRPC>,
	options?: Parameters<typeof crpc.things.remove.mutationOptions>[0]
) {
	return useMutation(crpc.things.remove.mutationOptions(options ?? {}))
}

/**
 * Hook for generating an upload URL for Thing images.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @param options - Mutation options
 * @returns Mutation that returns an upload URL
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const generateUrl = useThingsGenerateUploadUrl(crpc)
 * const uploadUrl = await generateUrl.mutateAsync()
 * await fetch(uploadUrl, { method: "POST", body: file })
 * ```
 */
export function useThingsGenerateUploadUrl(
	crpc: ReturnType<CRPC>,
	options?: Parameters<typeof crpc.things.generateUploadUrl.mutationOptions>[0]
) {
	return useMutation(crpc.things.generateUploadUrl.mutationOptions(options ?? {}))
}

/**
 * Hook that provides all Things CRUD operations with automatic cache invalidation.
 *
 * This is a convenience hook that bundles all Things operations together
 * with proper cache invalidation on mutations.
 *
 * @param crpc - The CRPC client from useCRPC()
 * @returns Object with all Things operations
 *
 * @example
 * ```tsx
 * const crpc = useCRPC()
 * const { things, create, update, remove, generateUploadUrl, isLoading } = useThings(crpc)
 * ```
 */
export function useThings(crpc: ReturnType<CRPC>) {
	const queryClient = useQueryClient()

	const invalidateThings = () => queryClient.invalidateQueries(crpc.things.list.queryFilter({}))

	const listQuery = useQuery(crpc.things.list.queryOptions({}))

	const createMutation = useMutation(
		crpc.things.create.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const updateMutation = useMutation(
		crpc.things.update.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const removeMutation = useMutation(
		crpc.things.remove.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const generateUploadUrlMutation = useMutation(crpc.things.generateUploadUrl.mutationOptions({}))

	return {
		/** List of Things for the current user */
		things: listQuery.data,
		/** Whether the list is loading */
		isLoading: listQuery.isPending,
		/** Error from the list query */
		error: listQuery.error,
		/** Create a new Thing */
		create: createMutation,
		/** Update an existing Thing */
		update: updateMutation,
		/** Remove a Thing */
		remove: removeMutation,
		/** Generate an upload URL for images */
		generateUploadUrl: generateUploadUrlMutation,
		/** Manually invalidate the Things list cache */
		invalidate: invalidateThings,
		/** The raw list query for advanced use cases */
		listQuery,
	}
}

/** Re-export the Thing type for convenience */
export type { Thing, UpdateThingInput }
