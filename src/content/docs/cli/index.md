---
title: TeamGrid CLI
description: Inspect and automate TeamGrid API v1 from a terminal or CI job with structured output and stable exit codes.
---

`@teamgrid/cli` provides the `teamgrid` command for API v1. It is suited to interactive operator workflows, shell scripts, and CI jobs. The CLI derives the regional API endpoint from the credential and shares its profiles with the optional MCP server.

Install the exact verified stable package version:

```bash
npm install --global @teamgrid/cli@1.0.0
teamgrid --version
```

## What the CLI adds

- Credentials in macOS Keychain or Linux Secret Service instead of the profile JSON
- Named profiles for different workspaces or environments
- Human-readable tables and machine-readable JSON or JSONL
- Cursor pagination with bounded `--all` traversal
- Stable exit codes for automation
- Confirmation before destructive archive or remove operations
- Bounded resource pagination and structured output for reconciliation scripts
- Required `--if-match` guards and actionable stale-revision errors for all 52 protected
  operations, including task, project, and project-template mutations

The CLI is a client of API v1. It does not create another API surface or bypass TeamGrid scopes, tenant isolation, or regional routing.

[Install and authenticate](/cli/install-and-authenticate/) or [browse all commands](/cli/commands/).
