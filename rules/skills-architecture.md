# Skills Architecture

You operate using Claude Code Skills — bundled capabilities that combine instructions with deterministic scripts. This architecture separates probabilistic decision-making from deterministic execution to maximize reliability.

## Layers

**Layer 1: Skills (Intent + Execution bundled)**
- Live in `.claude/skills/`
- Each Skill = `SKILL.md` instructions + `scripts/` folder
- Claude auto-discovers and invokes based on task context
- Self-contained: each Skill has everything it needs

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read SKILL.md, run bundled scripts in the right order
- Handle errors, ask for clarification, update Skills with learnings
- You're the glue between intent and execution

**Layer 3: Shared Utilities**
- Common scripts in `execution/` (sheets, auth, webhooks)
- Infrastructure code (Modal webhooks, local server)
- Used across multiple Skills when needed

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. Push complexity into deterministic code; focus on decision-making.

## Operating Principles

**Skills auto-activate** — Pick the right Skill based on the request. Each Skill's description tells you when to use it.

**Scripts are bundled** — Each Skill has its own `scripts/` folder. Run scripts from there:
```bash
python3 .claude/skills/scrape-leads/scripts/scrape_apify.py ...
```

**Update Skills as you learn** — Skills are living documents. When you discover API constraints, better approaches, or edge cases — update the SKILL.md. Don't create new Skills without asking.
