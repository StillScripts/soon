/**
 * Generate skills documentation from .claude/skills SKILL.md files.
 *
 * This script reads all SKILL.md files from the .claude/skills directory,
 * extracts their frontmatter and content, and generates markdown files
 * in the docs src/content/docs/skills directory.
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

const SKILLS_SOURCE = join(import.meta.dirname, "../../../.claude/skills")
const SKILLS_OUTPUT = join(import.meta.dirname, "../src/content/docs/skills")

interface SkillMeta {
	name: string
	description: string
	content: string
	dirName: string
}

async function parseFrontmatter(
	content: string
): Promise<{ meta: Record<string, string>; body: string }> {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
	const match = content.match(frontmatterRegex)

	if (!match) {
		return { meta: {}, body: content }
	}

	const [, frontmatter, body] = match
	const meta: Record<string, string> = {}

	for (const line of frontmatter.split("\n")) {
		const colonIndex = line.indexOf(":")
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim()
			const value = line.slice(colonIndex + 1).trim()
			meta[key] = value
		}
	}

	return { meta, body }
}

async function getSkillDirs(): Promise<string[]> {
	const entries = await readdir(SKILLS_SOURCE, { withFileTypes: true })
	return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

async function readSkill(dirName: string): Promise<SkillMeta | null> {
	const skillPath = join(SKILLS_SOURCE, dirName, "SKILL.md")

	try {
		const content = await readFile(skillPath, "utf-8")
		const { meta, body } = await parseFrontmatter(content)

		if (!meta.name) {
			console.warn(`Skipping ${dirName}: missing 'name' in frontmatter`)
			return null
		}

		return {
			name: meta.name,
			description: meta.description ?? "",
			content: body,
			dirName,
		}
	} catch {
		// No SKILL.md file in this directory
		return null
	}
}

function generateSkillDoc(skill: SkillMeta): string {
	return `---
title: "${skill.name}"
description: "${skill.description.replace(/"/g, '\\"')}"
---

${skill.content}
`
}

function generateIndexDoc(skills: SkillMeta[]): string {
	const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name))

	const skillsList = sorted
		.map(
			(s) =>
				`- [**/${s.name}**](/skills/${s.dirName}/) - ${s.description || "No description"}`
		)
		.join("\n")

	return `---
title: Claude Code Skills
description: Available skills for enhancing Claude Code workflows
---

This repository includes professional skills from [Sentry](https://github.com/getsentry/skills) and [Vercel](https://github.com/vercel-labs/agent-skills) that enhance AI-assisted development workflows.

## Available Skills

${skillsList}

## Usage

Skills are invoked with the \`/skill-name\` format in Claude Code:

\`\`\`bash
# Create a commit
/commit

# Create a pull request
/create-pr

# Review code for security issues
/code-review
\`\`\`

## Sources

- **Sentry Skills**: Professional engineering workflows from [Sentry](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills)
- **Vercel Skills**: React/Next.js best practices from [Vercel Labs](https://github.com/vercel-labs/agent-skills)
`
}

async function main() {
	console.log("Generating skills documentation...")

	// Clear and recreate output directory
	try {
		await rm(SKILLS_OUTPUT, { recursive: true })
	} catch {
		// Directory doesn't exist, that's fine
	}
	await mkdir(SKILLS_OUTPUT, { recursive: true })

	// Read all skills
	const skillDirs = await getSkillDirs()
	const skills: SkillMeta[] = []

	for (const dirName of skillDirs) {
		const skill = await readSkill(dirName)
		if (skill) {
			skills.push(skill)
		}
	}

	console.log(`Found ${skills.length} skills`)

	// Generate individual skill docs
	for (const skill of skills) {
		const docPath = join(SKILLS_OUTPUT, `${skill.dirName}.md`)
		await writeFile(docPath, generateSkillDoc(skill))
		console.log(`  Generated: ${skill.dirName}.md`)
	}

	// Generate index page
	const indexPath = join(SKILLS_OUTPUT, "index.md")
	await writeFile(indexPath, generateIndexDoc(skills))
	console.log(`  Generated: index.md`)

	console.log("Done!")
}

main().catch(console.error)
