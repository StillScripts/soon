import type { Metadata } from "next"
import localFont from "next/font/local"

import "@/app/globals.css"
import { Providers } from "@/app/providers"
import { caller } from "@/lib/convex/rsc"

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
})
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
})

export const metadata: Metadata = {
	title: "Things Manager",
	description: "Manage things with Convex, Better Auth, and TanStack Query",
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const token = await caller.getToken()

	return (
		<html suppressHydrationWarning lang="en">
			<body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
				<Providers initialToken={token}>{children}</Providers>
			</body>
		</html>
	)
}
