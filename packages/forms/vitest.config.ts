import { sharedConfig } from "@repo/vitest-config"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * Forms package test configuration.
 * Uses jsdom environment for React component testing.
 */
export default defineConfig({
	plugins: [react()],
	...sharedConfig,
	test: {
		...sharedConfig.test,
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
	},
})
