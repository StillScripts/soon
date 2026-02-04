"use client"

import { Button } from "@repo/ui/components/ui/button"

import { authClient } from "@/lib/auth-client"

/**
 * Client component displaying the current user and sign out button.
 */
export function UserHeader() {
	const { data: session } = authClient.useSession()

	const handleSignOut = async () => {
		await authClient.signOut()
	}

	return (
		<div className="flex items-center gap-4">
			<span className="text-muted-foreground text-sm">{session?.user?.email}</span>
			<Button variant="outline" size="sm" onClick={handleSignOut}>
				Sign out
			</Button>
		</div>
	)
}
