import type { ViteUserConfig } from "vitest/config"
/**
 * Shared Vitest configuration for all packages in the monorepo.
 * This provides consistent test settings across the codebase.
 */
export const sharedConfig: ViteUserConfig = {
	test: {
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
		},
	},
}
