import { defineConfig } from "vitest/config"
import { sharedConfig } from "@repo/vitest-config"

/**
 * Root Vitest configuration for running tests across the monorepo.
 * Uses Vitest's projects feature to test packages and apps with different environments.
 *
 * Usage:
 * - `bun test` - Run all tests via Turborepo (cached)
 * - `bun test:watch` - Watch mode for development
 */
export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
          include: ["**/tests/**/*.test.{ts,tsx}", "**/src/**/*.test.{ts,tsx}"],
        },
      },
      {
        root: "./apps",
        test: {
          ...sharedConfig.test,
          environment: "jsdom",
          include: ["**/tests/**/*.test.{ts,tsx}", "**/src/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
})
