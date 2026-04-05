"use client"

import { type ReactNode, useState } from "react"

import { ThemeProvider } from "next-themes"

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"

import { authClient } from "../lib/auth-client"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!

export function Providers({ children }: { children: ReactNode }) {
	const [convex] = useState(() => new ConvexReactClient(convexUrl))

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<ConvexBetterAuthProvider client={convex} authClient={authClient}>
				{children}
			</ConvexBetterAuthProvider>
		</ThemeProvider>
	)
}
