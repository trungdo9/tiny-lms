# Orchestration Protocol

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.

## Sequential Chaining

Chain subagents when tasks have dependencies or require outputs from previous steps:

- **Research → Design → Code → Documentation**: New system components
- **Research → Planning → Review**: Complex feature planning
- Each agent completes fully before the next begins
- Pass context and outputs between agents in the chain

## Plan-to-Code Handoff

When a task requires explicit plan approval before coding:

- Finish planning first and present the plan for user review
- After the user approves the plan, run `/clear` to start a fresh implementation context
- Begin coding from the approved plan only after the review → clear handoff is complete
- Preserve only the minimum required handoff context: goal, approved approach, plan path, constraints, unresolved questions

## Parallel Execution

Spawn multiple subagents simultaneously for independent tasks:

- **Code + Tests + Docs**: Separate, non-conflicting components
- **Multiple Feature Branches**: Different agents on isolated features
- **Cross-platform Development**: iOS and Android specific implementations
- **Careful Coordination**: No file conflicts or shared resource contention

## Parallel Patterns

### Fan-Out Pattern
```
Main Agent
    ├── Agent A (Task 1)
    ├── Agent B (Task 2)
    └── Agent C (Task 3)
    ↓
Combine Results
```

### Pipeline Pattern
```
Agent A → Agent B → Agent C → Agent D
```

## Agent Selection Guidelines

| Scenario | Agent(s) |
|-----------|----------|
| Research & discovery | `researcher`, `scout` |
| Planning | `planner` |
| Implementation | Main agent + domain skills |
| Testing | `tester` |
| Code review | `code-reviewer` |
| Debugging | `debugger` |
| Documentation | `docs-manager` |
| Project management | `project-manager` |
| Git operations | `git-manager` |

## Conflict Resolution

When multiple agents work in parallel:
1. Define clear boundaries - each agent owns specific files
2. Use unique file prefixes/namespaces
3. Define integration points before execution
4. Designate a "merge agent" to consolidate changes

## Context Preservation

- Pass essential context between agents in chain
- Use shared file system for large context (plans/, reports/)
- Keep handoff minimal but sufficient