import type { Metadata } from "next"

import { HomePage } from "@/components/home-page"

export const metadata: Metadata = {
	title: "Things Manager",
	description: "Create and manage your things with Convex and Better Auth",
}

export default function Home() {
	return <HomePage />
}
