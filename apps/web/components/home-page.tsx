"use client"

import { AuthForm } from "@/components/auth-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThingsManager } from "@/components/things-manager"
import { UserHeader } from "@/components/user-header"
import { authClient } from "@/lib/auth-client"

/**
 * Client component for the home page.
 * Handles authentication state and renders either login or the Things manager.
 * Data is prefetched on the server via RSC and hydrated for instant display.
 */
export function HomePage() {
	const { data: session, isPending } = authClient.useSession()

	if (isPending) {
		return (
			<div className="grid min-h-screen place-items-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		)
	}

	if (!session) {
		return (
			<div className="grid min-h-screen place-items-center p-4">
				<div className="absolute top-4 right-4">
					<ThemeToggle />
				</div>
				<AuthForm />
			</div>
		)
	}

	return (
		<div className="grid min-h-screen grid-rows-[auto_1fr_auto] gap-8 p-8">
			<header className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Things Manager</h1>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<UserHeader />
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
				<ThingsManager />
			</main>

			<footer className="text-muted-foreground text-center text-sm">
				Powered by Convex + Better Auth + TanStack Query
			</footer>
		</div>
	)
}
