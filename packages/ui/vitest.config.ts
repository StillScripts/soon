import { sharedConfig } from "@repo/vitest-config"
import { defineConfig } from "vitest/config"

/**
 * UI package test configuration.
 * Uses jsdom environment for React component testing.
 */
export default defineConfig({
	...sharedConfig,
	test: {
		...sharedConfig.test,
		environment: "jsdom",
	},
})
