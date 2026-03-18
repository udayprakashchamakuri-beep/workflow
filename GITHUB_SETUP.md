# GitHub Setup For Hackathon Repo

This repository is prepared for a CodeRabbit-centered pull request workflow.

## What Is Already Set Up

- local git repository initialized on `main`
- `.coderabbit.yaml` in the repo root
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- stage and review docs inside the workflow folders

## What You Need To Do On GitHub

1. Create an empty GitHub repository
2. Add the new remote locally
3. Push `main`
4. Install the CodeRabbit GitHub app on that repository
5. Open draft pull requests from feature branches for each milestone

## Local Git Commands

Use these after you create the empty GitHub repo:

```powershell
git remote add origin <YOUR_GITHUB_REPO_URL>
git add .
git commit -m "Initialize Hackathon workflow repo"
git push -u origin main
```

## Milestone PR Flow

For every build milestone:

```powershell
git checkout -b codex/milestone-01
```

Build the milestone, then:

```powershell
git add .
git commit -m "Implement milestone 01"
git push -u origin codex/milestone-01
```

After pushing:
- open a draft PR into `main`
- let CodeRabbit review it
- copy important findings into `07_review/`
- fix issues on the same branch
- push again
- wait for approval before merging

## Suggested GitHub Repo Settings

- protect `main`
- require pull requests before merging
- disable direct pushes to `main`
- require at least one approval if you want manual discipline
- keep auto-merge off until you trust the workflow

## Suggested CodeRabbit Behavior

The repo config is set so CodeRabbit reviews:
- normal PRs
- draft PRs
- incremental updates on the same PR

This is important because your process uses draft PRs as the review gate before final approval.

## Exact Human Approval Sequence

1. Build milestone locally
2. Update `06_build/implementation_notes.md`
3. Fill `handoffs/codex_to_coderabbit.md`
4. Push feature branch
5. Open draft PR
6. Wait for CodeRabbit review
7. Save findings into `07_review/`
8. Approve or request changes in `approvals/stage_07.txt`
9. Merge only after explicit approval

## Notes

- CodeRabbit works best when it reviews PRs, not unpushed local changes.
- Keep each PR focused on one milestone or one review cycle.
- Do not merge if stage 07 or stage 08 is still pending.

