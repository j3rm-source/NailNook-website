# Subagents

Subagents are lightweight agents (Sonnet 4.5) with self-contained contexts, defined in `.claude/agents/`. They're cheaper, unbiased (no parent context leakage), and keep the parent context clean.

## Available Subagents
- `code-reviewer` — Unbiased code review with zero context. Returns issues by severity with a PASS/FAIL verdict.
- `research` — Deep research via web search, file reads, and codebase exploration. Returns concise sourced findings.
- `qa` — Generates tests for a code snippet, runs them, and reports pass/fail results.
- `email-classifier` — Classifies Gmail emails into Action Required, Waiting On, Reference.

## Design & Build Workflow

When building or modifying any non-trivial code (scripts, features, refactors), follow this loop:

1. **Write/edit the code** — Make your changes.
2. **Code Review** — Spawn `code-reviewer` subagent with the changed file(s). It reports issues back — it does NOT fix anything itself.
3. **QA** — Spawn `qa` subagent with the code. It generates tests, runs them, and reports results back — it does NOT fix anything itself.
4. **Fix** — The parent agent (you) reads the review and QA reports and applies all fixes.
5. **Ship** — Only after review passes and tests pass.

**Important:** Subagents are read-only reporters. All code changes happen in the parent agent.

For research-heavy tasks, spawn `research` subagent first to gather context without polluting the main conversation.

**Parallel execution:** When reviewing + QA'ing independent files, spawn both subagents in parallel using `run_in_background: true`.
