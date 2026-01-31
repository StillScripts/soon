import { sharedConfig } from "@repo/vitest-config"
import { defineConfig, mergeConfig } from "vitest/config"

export default mergeConfig(
	sharedConfig,
	defineConfig({
		test: {
			environment: "edge-runtime",
			include: ["convex/**/*.test.ts"],
			server: {
				deps: {
					inline: ["convex-test"],
				},
			},
		},
	})
)
