# GitHub PR Workflow For CodeRabbit

This workflow makes GitHub the source of truth for review and uses CodeRabbit at the correct stage.

## Goal

Use:
- local files for stage artifacts
- Git branches for implementation changes
- draft pull requests for review
- CodeRabbit for code quality and security review
- manual approval before merge or release

## Branch Strategy

Recommended branches:
- `main` for approved stable code
- `codex/milestone-01`
- `codex/milestone-02`
- `codex/fixes-review`

Use one branch per milestone or review round. This keeps CodeRabbit feedback focused and easier to approve.

## When To Open A PR

Open a GitHub draft PR after:
- a meaningful milestone is implemented
- the app runs or the changed slice is reviewable
- `06_build/implementation_notes.md` is updated
- `handoffs/codex_to_coderabbit.md` is filled

Do not wait until the entire product is finished. CodeRabbit works best on incremental PRs.

## Review Flow

1. Codex builds a milestone in `06_build/`
2. Update:
   - `06_build/implementation_notes.md`
   - `handoffs/codex_to_coderabbit.md`
3. Commit changes to a feature branch
4. Push branch to GitHub
5. Open a draft pull request
6. Let CodeRabbit review the PR
7. Save important findings into:
   - `07_review/coderabbit_findings.md`
   - `07_review/security_findings.md`
   - `07_review/fix_log.md`
8. Decide:
   - approve review stage
   - request fixes
   - stop
9. If fixes are needed, Codex updates the same branch and CodeRabbit reviews again
10. Only merge after explicit approval

## Approval Gates

Use these approvals:
- `approvals/stage_06.txt` for implementation milestone approval
- `approvals/stage_07.txt` for CodeRabbit review approval
- `approvals/stage_08.txt` for final release approval

Suggested flow:
- approve milestone build
- open draft PR
- review with CodeRabbit
- approve fixes
- merge PR
- approve release

## PR Template

Use this structure in the pull request body:

```text
## Summary
- What this milestone adds

## Scope
- Files or areas changed

## Testing
- What was manually tested
- What still needs testing

## Review Focus
- Areas where CodeRabbit should pay extra attention

## Linked Artifacts
- 01_prd/...
- 04_build_plan/...
- 05_ui_flow/...
- 06_build/implementation_notes.md
```

## CodeRabbit Focus Areas

Ask CodeRabbit to focus on:
- auth and session handling
- input validation
- prompt injection risks
- unsafe file or API access
- secrets handling
- XSS or HTML injection
- SSRF and insecure fetch logic
- missing server-side authorization
- data leakage across users
- dependency and config risks

## What To Store Back In This Repo

After each review round, record:
- the main CodeRabbit findings in `07_review/coderabbit_findings.md`
- security-specific findings in `07_review/security_findings.md`
- fixed items in `07_review/fix_log.md`

This keeps the review history independent of GitHub comments and lets other tools continue from the same state.

## Recommended Human Approval Sequence

1. Approve the implementation milestone locally
2. Open the draft PR
3. Wait for CodeRabbit review
4. Request or approve fixes
5. Re-run review if needed
6. Approve stage 07
7. Approve final release
8. Merge and push release notes

## Practical Notes

- CodeRabbit is strongest when changes are in GitHub PRs.
- Keep PRs small enough to review but large enough to show one meaningful milestone.
- Use draft PRs until you are satisfied with CodeRabbit findings and the milestone quality.
- Do not merge directly to `main` without the stage 07 and stage 08 approvals.

