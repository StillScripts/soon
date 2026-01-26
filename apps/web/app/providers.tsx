"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConvexAuthProvider } from "better-convex/auth-client"
import {
	ConvexReactClient,
	getConvexQueryClientSingleton,
	getQueryClientSingleton,
	useAuthStore,
} from "better-convex/react"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"

import { CRPCProvider } from "@/lib/convex/crpc"
import { authClient } from "../lib/auth-client"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Convex handles real-time updates via WebSocket
				staleTime: Number.POSITIVE_INFINITY,
				refetchOnWindowFocus: false,
				refetchOnMount: false,
				refetchOnReconnect: false,
			},
		},
	})
}

function QueryProvider({
	children,
	convex,
}: {
	children: ReactNode
	convex: ConvexReactClient
}) {
	const authStore = useAuthStore()
	const queryClient = getQueryClientSingleton(createQueryClient)
	const convexQueryClient = getConvexQueryClientSingleton({
		authStore,
		convex,
		queryClient,
	})

	return (
		<QueryClientProvider client={queryClient}>
			<CRPCProvider convexClient={convex} convexQueryClient={convexQueryClient}>
				{children}
			</CRPCProvider>
		</QueryClientProvider>
	)
}

export function Providers({
	children,
	initialToken,
}: { children: ReactNode; initialToken?: string | null }) {
	const router = useRouter()
	const [convex] = useState(() => new ConvexReactClient(convexUrl))

	if (!convexUrl) {
		return (
			<div style={{ padding: "2rem", fontFamily: "system-ui" }}>
				<h1>Convex Not Configured</h1>
				<p>
					Missing <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable.
				</p>
			</div>
		)
	}

	return (
		<ConvexAuthProvider
			authClient={authClient}
			client={convex}
			initialToken={initialToken ?? undefined}
			onMutationUnauthorized={() => {
				router.push("/login")
			}}
			onQueryUnauthorized={() => {
				router.push("/login")
			}}
		>
			<QueryProvider convex={convex}>{children}</QueryProvider>
		</ConvexAuthProvider>
	)
}
