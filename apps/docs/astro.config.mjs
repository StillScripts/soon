// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Ember Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Development Journey',
					items: [
						{ label: 'Overview', slug: 'guides/00-overview' },
						{ label: 'Initial Setup', slug: 'guides/01-initial-setup' },
						{ label: 'Astro Documentation Site', slug: 'guides/02-astro-docs' },
						{ label: 'Claude Code Integration', slug: 'guides/03-claude-code' },
						{ label: 'Professional Claude Code Skills', slug: 'guides/04-claude-skills' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
