import { sharedConfig } from "@repo/vitest-config"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * Web app test configuration.
 * Uses jsdom environment for React component testing with Next.js.
 */
export default defineConfig({
	plugins: [react()],
	...sharedConfig,
	test: {
		...sharedConfig.test,
		environment: "jsdom",
		passWithNoTests: true,
		setupFiles: ["./vitest.setup.ts"],
		alias: {
			"@/": new URL("./", import.meta.url).pathname,
		},
	},
})
