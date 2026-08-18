---
title: TeamGrid CLI
description: Inspect and automate TeamGrid API v1 from a terminal or CI job with structured output and stable exit codes.
owner: Developer Experience
reviewedAt: 2026-08-10
---

`@teamgrid/cli` provides the `teamgrid` command for API v1. It is suited to interactive operator workflows, shell scripts, and CI jobs. The CLI derives the regional API endpoint from the credential and shares its profiles with the optional MCP server.

Install the exact verified stable package version:

```bash
npm install --global @teamgrid/cli@1.1.0
teamgrid --version
```

## What the CLI adds

- Browser login with workspace selection, scope approval, PKCE, and a loopback callback
- Credentials in macOS Keychain, Linux Secret Service, or Windows Credential Manager instead of the profile JSON
- Named profiles for different workspaces or environments
- Human-readable tables and machine-readable JSON or JSONL
- Cursor pagination with bounded `--all` traversal
- Stable exit codes for automation
- A read-only, redacted `doctor` report for configuration, credential, routing, network, and API checks
- Server-verified credential status and optional fail-safe self-revocation during logout
- Confirmation before destructive archive or remove operations
- Bounded resource pagination and structured output for reconciliation scripts
- Required `--if-match` guards and actionable stale-revision errors for all 52 protected
  operations, including task, project, and project-template mutations

The CLI is a client of API v1. It does not create another API surface or bypass TeamGrid scopes, tenant isolation, or regional routing.

[Install and authenticate](/cli/install-and-authenticate/), follow the complete
[browser-login flow](/cli/browser-login/), browse the workflow-oriented
[command guide](/cli/commands/), or use the generated [exact command reference](/cli/reference/).
For upgrades, removal, shell behavior, private certificate authorities, and recovery, see
[maintenance and troubleshooting](/cli/maintenance-and-troubleshooting/).
