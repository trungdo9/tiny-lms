# Project Documentation Management

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.

### Documentation Files

| File | Purpose |
|------|---------|
| `./docs/project-roadmap.md` | Living document tracking project phases, milestones, and progress |
| `./docs/changelog.md` | Detailed record of all significant changes, features, and fixes |
| `./docs/system-architecture.md` | System architecture design and component relationships |
| `./docs/code-standards.md` | Code conventions and standards for the project |

### Automatic Updates Required

- **After Feature Implementation**: Update roadmap progress status and changelog entries
- **After Major Milestones**: Review and adjust roadmap phases, update success metrics
- **After Bug Fixes**: Document fixes in changelog with severity and impact
- **After Security Updates**: Record security improvements and version updates
- **Weekly Reviews**: Update progress percentages and milestone statuses

### Documentation Triggers

The `project-manager` agent MUST update these documents when:
- A development phase status changes (e.g., from "In Progress" to "Complete")
- Major features are implemented or released
- Significant bugs are resolved or security patches applied
- Project timeline or scope adjustments are made
- External dependencies or breaking changes occur

### Update Protocol

1. **Before Updates**: Always read current roadmap and changelog status
2. **During Updates**: Maintain version consistency and proper formatting
3. **After Updates**: Verify links, dates, and cross-references are accurate
4. **Quality Check**: Ensure updates align with actual implementation progress

### Documentation Structure

```
./docs/
├── project-overview-pdr.md    # Project overview and PDR
├── project-roadmap.md         # Milestones and progress
├── changelog.md              # Version history
├── system-architecture.md    # Architecture design
├── code-standards.md         # Coding conventions
├── deployment-guide.md       # Deployment instructions
└── codebase-summary.md      # Auto-generated summary
```