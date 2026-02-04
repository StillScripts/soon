import { sharedConfig } from "@repo/vitest-config"
import { defineConfig } from "vitest/config"

/**
 * API package test configuration.
 * Uses jsdom environment for React hooks testing.
 */
export default defineConfig({
	...sharedConfig,
	test: {
		...sharedConfig.test,
		environment: "jsdom",
	},
})
