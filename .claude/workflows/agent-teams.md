# Agent Teams Structure

## Team Overview

```
.claude/agents/
├── development/          # Code implementation & quality (5 agents)
├── research/            # Information gathering (3 agents)
├── project/             # Project coordination (3 agents)
├── operations/          # Git & integrations (3 agents)
└── specialists/         # Domain experts (5 agents)
```

---

## Development Team

**Agents:** `planner` → `tester` → `code-reviewer` → `debugger` → `performance-agent`

**Location:** `.claude/agents/development/`

### Flow
```
planner (create plan) → code (implementation) → tester (run tests) → code-reviewer (review)
                                                              ↓
                                                        debugger (fix issues)
                                                              ↓
                                                        tester (re-run)
```

### Rules
1. **planner** creates implementation plan with TODO tasks
2. After implementation, **tester** runs tests first
3. If tests pass → **code-reviewer** reviews
4. If tests fail → **debugger** investigates root cause
5. Fix → **tester** re-runs → loop until pass
6. Never skip failing tests to pass build

### Activation
- Use `planning` skill for technical planning
- Use `test-automation` skill for E2E testing
- Use `code-review` skill for quality assessment

---

## Research Team

**Agents:** `researcher` → `scout` → `scout-external`

**Location:** `.claude/agents/research/`

### Flow
```
scout/scout-external (find files) → researcher (analyze & synthesize)
                    ↓
              planner receives research output
```

### Rules
1. **scout/scout-external** locates relevant files first
2. **researcher** synthesizes information from multiple sources
3. Research output goes to **planner** for decision-making
4. Keep research reports concise (≤150 lines)
5. Use parallel execution for independent research

### Activation
- Use `research` skill for technical research
- Use `docs-seeker` skill for documentation lookup

---

## Project Team

**Agents:** `project-manager` ↔ `docs-manager` ← `journal-writer`

**Location:** `.claude/agents/project/`

### Flow
```
project-manager (track progress)
       ↓
docs-manager (update docs)
       ↓
journal-writer (document issues)
```

### Rules
1. **project-manager** tracks progress in `./plans` and `./docs/project-roadmap.md`
2. **docs-manager** updates technical docs in `./docs`
3. **journal-writer** documents failures/lessons in `./docs/journals`
4. All three coordinate after feature completion
5. Update docs automatically after each phase

### Activation
- Use `planning` skill for project planning

---

## Operations Team

**Agents:** `git-manager` → `mcp-manager` → `integration-agent`

**Location:** `.claude/agents/operations/`

### Flow
```
mcp-manager (setup integrations) → git-manager (deploy)
```

### Rules
1. **git-manager** handles all Git operations
   - Stage → Commit → Push (if requested)
   - Security check for secrets before commit
   - Conventional commit format
2. **mcp-manager** handles MCP server integrations
   - Discover available MCP tools
   - Execute MCP capabilities
   - Report results to main agent

### Activation
- Use `mcp-management` skill for MCP operations

---

## Specialists Team

**Agents:** `security-auditor`, `database-admin`, `seo-specialist`, `copywriter`, `ui-ux-designer`

**Location:** `.claude/agents/specialists/`

### Flow
```
Main Agent → Specialist (domain expertise) → Main Agent (incorporate)
```

### Rules
1. **security-auditor** - Review for OWASP vulnerabilities
2. **database-admin** - Optimize queries, schema design
3. **seo-specialist** - SEO audits, keyword research, schema
4. **copywriter** - Marketing copy, content
5. **ui-ux-designer** - UI implementation, design assets

### Activation
- Use `security-audit` skill for security reviews
- Use `databases` / `supabase-postgres` skills for DB work
- Use `seo` skill for SEO tasks

---

## Cross-Team Communication

### Handoff Protocol
1. Output file to shared location: `./plans/<plan-name>/reports/`
2. Format: `YYMMDD-from-agent-to-agent-task-report.md`
3. Include actionable next steps in report

### Error Handling
- If agent fails → escalate to main agent
- Main agent decides next agent to invoke
- Never loop infinitely between agents (max 3 retries)

### Context Preservation
- Pass only essential context between agents
- Use files for large context
- Use minimal handoff for Plan→Code transition