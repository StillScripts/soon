import { sharedConfig } from "@repo/vitest-config"
import path from "node:path"
import { defineConfig, mergeConfig } from "vitest/config"

export default mergeConfig(
	sharedConfig,
	defineConfig({
		resolve: {
			alias: {
				"@convex": path.resolve(__dirname, "../backend/convex/functions/_generated"),
			},
		},
		test: {
			environment: "node",
			include: ["src/**/*.{test,spec}.ts"],
		},
	})
)
