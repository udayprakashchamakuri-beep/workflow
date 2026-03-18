# Hackathon Workflow Workspace

This folder contains a manual, approval-gated workflow for turning a website idea into a shipped GitHub project.

Stage order:
1. `01_prd` - create the PRD
2. `02_pitch` - create the pitch deck
3. `03_research_qa` - research and Q&A prep
4. `04_build_plan` - step-by-step engineering plan
5. `05_ui_flow` - UI and product flow
6. `06_build` - implementation
7. `07_review` - review and security testing
8. `08_release` - README, release docs, GitHub push

Rules:
- Do not advance to the next stage until the current stage is approved.
- Store every artifact in the matching stage folder.
- Log your approval decision in `approvals/`.
- Leave one short handoff note in `handoffs/` after every stage.
- Keep `project_state.md` updated so any agent can resume work.

Quick start:
1. Fill `00_intake/idea.md`
2. Fill `00_intake/constraints.md`
3. Fill `00_intake/success-criteria.md`
4. Use `prompts/01_prd_prompt.md` with your first AI
5. Approve or request changes in `approvals/stage_01.txt`

Integration helpers:
- Antigravity MCP template: `.vscode/mcp.json`
- GitHub and CodeRabbit review flow: `07_review/GITHUB_PR_WORKFLOW.md`
- PR-stage review prompt: `prompts/07_github_pr_review_prompt.md`
- GitHub repo setup guide: `GITHUB_SETUP.md`
- CodeRabbit repo config: `.coderabbit.yaml`
- Free security workflow: `.github/workflows/security-scans.yml`
- Free scan notes: `07_review/FREE_SECURITY_SCANS.md`
