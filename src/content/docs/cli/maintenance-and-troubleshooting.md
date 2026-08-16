---
title: CLI maintenance and troubleshooting
description: Upgrade or remove the TeamGrid CLI, use it safely from common shells, configure private certificate authorities, and diagnose automation failures.
owner: Developer Experience
reviewedAt: 2026-08-10
---

## Confirm which CLI is running

Check the package version before comparing behavior with this documentation:

```bash
teamgrid --version
npm list --global @teamgrid/cli --depth=0
```

On macOS or Linux, `command -v teamgrid` shows the executable selected by `PATH`. In PowerShell,
use `Get-Command teamgrid`. If those commands point to an old Node installation or package prefix,
remove that stale path before reinstalling. CLI `1.0.7` requires Node.js 22.14 through 24.

The CLI does not provide a shell-completion generator in `1.0.7`. Use the exact generated
[command reference](/cli/reference/) or the nested help available at every level:

```bash
teamgrid --help
teamgrid tasks --help
teamgrid tasks update --help
```

## Upgrade and pin a version

Install the exact stable version again to upgrade or repair a global installation:

```bash
npm install --global @teamgrid/cli@1.0.7
teamgrid --version
teamgrid auth status --check
```

Pin the full version in developer workstations, build images, and CI bootstrap scripts. Do not use
an unreviewed floating version in unattended automation. Upgrading the npm package does not rotate
or revoke credentials; existing named profiles remain subject to their original scopes and expiry.

## Remove the CLI and credentials

List and remove local profiles before uninstalling when the machine should no longer retain their
credentials:

```bash
teamgrid auth profiles
teamgrid --profile default auth logout --revoke
npm uninstall --global @teamgrid/cli
```

Repeat the command for every named profile. `--revoke` stops server access first and removes local
state only after TeamGrid confirms the revocation. Unset `TEAMGRID_API_TOKEN` while doing this so
the selected saved profile is unambiguous. Use plain `auth logout` only when local cleanup without a
network call is intentional; then revoke the corresponding credential in Developer Center if
server access must stop.

Removing only the npm package deliberately leaves profiles and OS credential-store entries in
place. If the CLI was already removed, reinstall the same version temporarily and use
`auth profiles`/`auth logout` rather than deleting credential-store records by guesswork.

## Shell-safe JSON input

Prefer a file for non-trivial request bodies. The `@` prefix tells the CLI to read the named file:

```bash
teamgrid tasks create --data @task.json --idempotency-key import-42 --output json
```

Use `--data -` to read one JSON object from standard input. This avoids shell-specific quoting:

```bash
printf '%s' '{"name":"Prepared through stdin"}' \
  | teamgrid tasks create --data - --idempotency-key import-43 --output json
```

PowerShell:

```powershell
Get-Content -Raw .\task.json |
  teamgrid tasks create --data - --idempotency-key import-44 --output json |
  ConvertFrom-Json
```

Do not parse table output in a script. Use `--output json` for a response envelope and
`--output jsonl` when `--all` should stream resources. Secret and binary stdout modes are
exceptions: `--secret-stdout` emits only a reveal-once secret, while export `--stdout` emits raw
bytes. Never pipe either through JSON tools or into ordinary CI logs.

## Non-interactive confirmations

Archive, remove, rotate, abort, clear, and complete-replacement commands can require an interactive
confirmation. Without a TTY they fail with exit code `2` unless the reviewed step opts in:

```bash
teamgrid tasks archive "$TASK_ID" --if-match "$REVISION" --yes --output json
```

`TEAMGRID_CLI_ASSUME_YES=1` is also supported, but `--yes` keeps the authorization visible next to
the individual destructive command and is safer for most scripts. An operator who declines an
interactive confirmation gets exit code `0` and no mutation.

## Corporate networks, proxies, and private CAs

CLI `1.0.7` has no dedicated proxy option. `--base-url` changes the API endpoint and is not a
forward-proxy setting. A machine must have an approved HTTPS path to the credential's regional
TeamGrid cell; verify that path with:

```bash
teamgrid auth status --check
teamgrid workspace --output json
```

If your organization terminates TLS with a private certificate authority, Node can load an
additional PEM trust bundle when the process starts:

```bash
NODE_EXTRA_CA_CERTS=/absolute/path/company-ca.pem teamgrid workspace --output json
```

PowerShell:

```powershell
$env:NODE_EXTRA_CA_CERTS = "C:\certificates\company-ca.pem"
teamgrid workspace --output json
Remove-Item Env:NODE_EXTRA_CA_CERTS
```

The CLI does not modify Node's TLS trust behavior. Have the certificate bundle and network path
approved by the responsible administrator. Never work around certificate validation with
`NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Diagnose a failed command

Start with the read-only diagnostic:

```bash
teamgrid doctor
teamgrid --output json doctor
```

Doctor validates local configuration, the selected credential and its routing metadata, the
resolved regional base URL, HTTPS reachability, API/CLI compatibility, and authenticated capability
discovery. Later checks are marked `skipped` when an earlier prerequisite fails. The report never
contains the credential, authorization header, credential-store contents, raw API body, or raw
exception text.

Exit `0` means every required check passed. Invalid local configuration or routing uses `2`; a
missing, invalid, or expired credential uses `3`; authorization uses `4`; rate limiting uses `7`;
network, server, protocol, or compatibility failures use `1`. An expiring-soon credential is a
warning and does not fail an otherwise healthy diagnosis.

Start with the structured exit code and the request ID printed for API errors. The stable meanings
are listed under [CLI automation](/cli/automation/#exit-codes). Then check:

| Symptom | Check | Safe next action |
| --- | --- | --- |
| `teamgrid` not found | `command -v teamgrid` or `Get-Command teamgrid` | Fix the npm global executable path or reinstall the pinned version |
| Exit `2` | Arguments, JSON input, required `--if-match`, confirmation, profile configuration | Run the exact command with `--help`; do not retry a rejected mutation blindly |
| Exit `3` | Expiry, revocation, selected profile | Run `doctor` or `auth status --check`; renew or replace the credential |
| Exit `4` | Token scopes, user permission, service-account resource grants | Grant only the missing access or select the correct credential |
| Exit `5` | Resource ID, workspace, archive state | Confirm that the ID belongs to the selected workspace and is visible to the credential |
| Exit `6` | `409` conflict or `412` stale revision | Read the resource again, reconcile, and use its latest revision or ETag |
| Exit `7` | API rate limit | Respect the server retry guidance and reduce concurrency |
| Network or certificate failure | Regional HTTPS reachability and CA trust | Validate the approved network path; do not disable TLS checks |
| JSON pipeline breaks | Output mode or secret/binary stdout | Use `--output json`/`jsonl`; keep secret and export byte streams separate |

For an unexpected failure, enable the built-in debug path for one reproduction:

```bash
TEAMGRID_DEBUG=1 teamgrid workspace --output json
```

Debug output is passed through TeamGrid's credential redaction and terminal sanitization before it
is written to stderr. It can still contain local paths, resource IDs, and request IDs, so review it
before sharing. Never share the profile credential, an authorization URL, a pairing phrase,
reveal-once output, or raw configuration files.

## Automation recovery checklist

1. Record the CLI version, command path, exit code, and API request ID.
2. Confirm the intended named profile or `TEAMGRID_API_TOKEN`; never print the token.
3. Re-run a read-only status or resource GET before repeating a mutation.
4. For exit `6`, reconcile against the latest representation instead of reusing an old revision.
5. Reuse the original idempotency key only for the same logical create request.
6. Keep explicit `--timeout`, `--retries`, `--max-pages`, and lifecycle `--max-wait` bounds in long-running jobs.
7. Capture JSON or JSONL on stdout and diagnostics on stderr as separate CI artifacts.
