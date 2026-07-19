---
title: TeamGrid CLI
description: Inspect and automate TeamGrid API v1 from a terminal or CI job with structured output and stable exit codes.
---

`@teamgrid/cli` provides the `teamgrid` command for API v1. It is suited to interactive operator workflows, shell scripts, and CI jobs. The CLI derives the regional API endpoint from the credential and shares its profiles with the optional MCP server.

The current prerelease is distributed through npm's explicit `next` channel:

```bash
npm install --global @teamgrid/cli@next
teamgrid --version
```

## What the CLI adds

- Credentials in macOS Keychain or Linux Secret Service instead of the profile JSON
- Named profiles for different workspaces or environments
- Human-readable tables and machine-readable JSON or JSONL
- Cursor pagination with bounded `--all` traversal
- Stable exit codes for automation
- Confirmation before destructive archive or remove operations

The CLI is a client of API v1. It does not create another API surface or bypass TeamGrid scopes, tenant isolation, or regional routing.

[Install and authenticate](/cli/install-and-authenticate/) or [browse all commands](/cli/commands/).
