import starlight from "@astrojs/starlight"
// @ts-check
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Ember Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Development Journey",
          items: [
            { label: "Overview", slug: "guides/00-overview" },
            {
              label: "Initial Turborepo Setup",
              slug: "guides/01-initial-turborepo-setup",
            },
            { label: "Astro Documentation Site", slug: "guides/02-astro-docs" },
            { label: "Claude Code Integration", slug: "guides/03-claude-code" },
            {
              label: "Professional Claude Code Skills",
              slug: "guides/04-claude-skills",
            },
            { label: "Convex Backend", slug: "guides/05-convex-backend" },
            { label: "Turborepo Skill", slug: "guides/06-turborepo-skill" },
            {
              label: "shadcn/ui Components",
              slug: "guides/07-shadcn-ui-components",
            },
            {
              label: "Better Auth Integration",
              slug: "guides/08-better-auth",
            },
            {
              label: "Biome Migration",
              slug: "guides/09-biome-migration",
            },
            {
              label: "Vitest Testing Setup",
              slug: "guides/10-vitest-testing",
            },
            {
              label: "Authentication",
              slug: "guides/11-authentication",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Quick Reference", slug: "reference/quick-reference" },
            { label: "Turborepo", slug: "reference/turborepo" },
            { label: "UI Components", slug: "reference/ui-components" },
            { label: "Convex API", slug: "reference/convex" },
            { label: "Biome", slug: "reference/biome" },
          ],
        },
      ],
    }),
  ],
})
