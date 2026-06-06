# MangoOS Agent Workflow

> Synchronization protocol for ClaudeCoda + Codex multi-agent development.

---

## Core Principle

**ClaudeCoda** pushes product experience forward.
**Codex** verifies, hardens, tests, and stabilizes the engineering implementation.

Neither agent should do the other's core job without explicit coordination.

---

## Branch Rules

| Branch | Purpose | Who works here |
|--------|---------|---------------|
| `main` | Stable, deployable | Nobody directly |
| `claude/*` | Product feature branches | ClaudeCoda |
| `codex/*` | Audit and hardening branches | Codex |

- No two agents may modify the same branch simultaneously.
- Codex branches are created **from ClaudeCoda checkpoint commits**.
- Merge to `main` only after:
  1. All checks pass (lint + typecheck + build)
  2. Diff is reviewed
  3. Core workflow is verified

---

## Handoff Rules

Every handoff between agents must include:

```
Branch:       <name>
Commit:       <hash>
Files changed: <count>
What changed:  <summary>
Do not touch:  <protected directories/files>
Known issues:  <list>
Checks run:    <lint / typecheck / build / workflow>
Next task:     <recommended action for receiving agent>
```

---

## ClaudeCoda → Codex Handoff

After ClaudeCoda completes product work:

1. Update `PROJECT_STATE.md` with current architecture
2. Update `FEATURES.md` with new/changed features
3. Update `UPDATE_LOG.md` with version entry
4. Commit with clear checkpoint message
5. Create Codex audit branch: `git checkout -b codex/audit-claude-vXX`
6. Push both branches
7. Report handoff (branch, commit, files, known issues, protected areas)

**Important:** ClaudeCoda stops feature work after creating the checkpoint.
Codex takes over on the audit branch.

---

## Codex → ClaudeCoda Handoff

After Codex completes engineering work:

1. Update `BUGFIX_HISTORY.md` with bugs found and fixed
2. Update `REGRESSION_CHECKLIST.md` with test results
3. Update `UPDATE_LOG.md` with engineering entry
4. Commit with clear engineering message
5. Report handoff (branch, commit, files, checks, remaining risks)

After Codex branch is merged to main:
1. ClaudeCoda creates new `claude/*` branch from updated main
2. ClaudeCoda reads all updated project-memory before starting

---

## Synchronization Protocol

### Claudecoda sync points:
- After completing a feature milestone → commit + update PROJECT_STATE.md + FEATURES.md + UPDATE_LOG.md
- Before handing off to Codex → create checkpoint branch, push, report

### Codex sync points:
- After audit findings → update BUGFIX_HISTORY.md
- After each fix category → commit
- After all fixes → update REGRESSION_CHECKLIST.md + UPDATE_LOG.md

### Merge protocol:
1. Ensure all checks pass on the branch
2. Review diff (can be done by either agent)
3. `git checkout main && git merge <branch>`
4. Update PROJECT_STATE.md after merge
5. Do NOT merge if checks fail

---

## Currently Active (2026-06-06)

### ClaudeCoda v10 Checkpoint
- **Branch:** `claude/v10-study-pack`
- **Status:** Feature complete, handed off for audit
- **Scope:** Research Orchestrator, Exam Review Module, Mind Garden v2, Content Quality Engine, Feature Output Contracts, Knowledge Forest v4, Rich Text Editor, Bilibili/Douyin providers, 内测版 branding
- **Do not touch:** `components/onboarding/`, `components/auth/` during audit (branding + invite codes recently restructured)

### Codex Audit
- **Branch:** `codex/audit-claude-v10`
- **Status:** Pending first audit
- **First task:** Production-readiness audit (NO code changes)
