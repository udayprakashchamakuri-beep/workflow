# Free Security Scans

This repository uses two free GitHub Actions security checks:

- `Semgrep`
- `Trivy`

## What Each Scanner Does

`Semgrep`
- scans application code for risky patterns
- helps catch input validation mistakes, unsafe logic, insecure coding patterns, and some injection-style issues
- runs with `semgrep scan --config auto` so it works without a Semgrep account

`Trivy`
- scans the repository filesystem for known dependency vulnerabilities and security issues
- is configured to fail on `HIGH` and `CRITICAL` findings
- uploads a JSON report as a workflow artifact

## When They Run

The workflow runs on:
- pull requests
- pushes to `main`
- manual trigger from GitHub Actions

Workflow file:
- `.github/workflows/security-scans.yml`

## How To Use Them In Your Process

1. Push a feature branch
2. Open a draft pull request
3. Let the `Security Scans` workflow run
4. Review the job results and artifacts
5. Record important issues in:
   - `07_review/coderabbit_findings.md`
   - `07_review/security_findings.md`
   - `07_review/fix_log.md`
6. Fix issues before merge

## Important Limitation

This setup does not replace a conversational PR reviewer like CodeRabbit.
It is a strong free baseline for:
- static code scanning
- dependency vulnerability scanning
- fail-fast security checks in CI

Use this together with manual review and targeted code review for best results.

