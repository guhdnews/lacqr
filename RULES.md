# Project Rules

## Security
- **NEVER** commit API keys, secrets, or credentials to git.
- Always use environment variables (e.g., `.env.local`) for sensitive data.
- Ensure `.env` files are listed in `.gitignore`.
- If a key is exposed, immediately rotate it and update the environment variables.

## Workflow & Tools
- **Sequential Thinking**: Use the `sequential-thinking` MCP tool for complex problem-solving, multi-step tasks, and architectural decisions. This helps in breaking down problems and maintaining context.
- **Context Updates**: Before finishing a session, always update `PROJECT_CONTEXT.md` to ensure the next agent has the latest information.

## Preservation & Iteration
- **Build, Don't Break**: When refining features (AI accuracy, CRM flows, Pricing), **DO NOT** overwrite existing working logic unless absolutely necessary.
- **Iterative Improvement**: Add to the existing codebase. For example, when improving AI, refine the prompt or add a post-processing step; do not delete the entire pipeline.
- **Regression Testing**: Always verify that core flows (Scanning -> Quote -> Booking) remain functional after any change.

## 4. Execution Standards
- **Complete All Steps**: Never truncate or skip steps. If a task requires multiple actions, complete EVERY single one. Do not leave "TODOs" for the user unless explicitly agreed upon.
- **Double-Check Work**: Verify every change. Don't just assume it works. Check for syntax errors, logic flaws, and missing imports immediately after editing.
- **Continuous Auditing**: While fixing, continue to look for "holes", edge cases, and missing logic. Be proactive in identifying issues even if they weren't in the original plan.
- **No Shortcuts**: Do not use placeholders or "mock" logic for core features unless strictly prototyping. Build for production.
