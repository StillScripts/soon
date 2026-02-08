"use client"

import { type ReactNode, useCallback, useState } from "react"

import { ThemeProvider } from "next-themes"
import { useRouter } from "next/navigation"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConvexAuthProvider } from "better-convex/auth-client"
import {
	ConvexReactClient,
	getConvexQueryClientSingleton,
	getQueryClientSingleton,
	useAuthStore,
} from "better-convex/react"

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

function QueryProvider({ children, convex }: { children: ReactNode; convex: ConvexReactClient }) {
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
}: {
	children: ReactNode
	initialToken?: string | null
}) {
	const router = useRouter()
	const [convex] = useState(() => new ConvexReactClient(convexUrl))
	const handleUnauthorized = useCallback(() => {
		router.push("/login")
	}, [router])

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<ConvexAuthProvider
				authClient={authClient}
				client={convex}
				initialToken={initialToken ?? undefined}
				onMutationUnauthorized={handleUnauthorized}
				onQueryUnauthorized={handleUnauthorized}
			>
				<QueryProvider convex={convex}>{children}</QueryProvider>
			</ConvexAuthProvider>
		</ThemeProvider>
	)
}
