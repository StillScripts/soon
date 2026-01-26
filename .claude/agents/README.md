# Subagents Directory Overview

This directory houses subagent definitions for Claude Code integration. According to the documentation, "Subagents are specialized AI agents that operate autonomously to perform specific tasks."

The key distinction from other components is that subagents function independently, whereas skills merely provide instructions to the main agent.

**Currently Available:**
The code-simplifier subagent is documented here, drawing from Anthropic's official implementation. Its purpose involves "refining code immediately after it's written or modified" to enhance clarity and maintainability.

**Implementation Guide:**
Adding new subagents requires creating a markdown file with YAML frontmatter containing essential metadata. The process also involves updating the main README with appropriate documentation and external attribution when applicable.

For comprehensive details on subagent functionality and integration, the documentation points to https://code.claude.com/docs/en/sub-agents.
