---
title: MCP resources and protocol support
description: Understand TeamGrid tools, private resources, document sections, OAuth transport, result limits and features outside the MCP surface.
owner: Developer Platform
reviewedAt: 2026-10-02
---

This page describes **stable release 1.2.2**. The [tool reference](/mcp/reference/)
documents the 208 business operations; the protocol also provides bounded private
resource reads. Support for a feature in the MCP standard does not mean TeamGrid
implements or advertises it.

## Supported surface

| Capability | TeamGrid behavior |
| --- | --- |
| Local transport | stdio, using the selected CLI credential store; default `core` profile |
| Hosted transport | Regional HTTPS Streamable HTTP at `/mcp`, OAuth, Production `full` profile with authorized writes |
| Tools | 208 strict input contracts, concrete output schemas, safety annotations and API mappings |
| Discovery | `tools/list` with opaque cursors; at most 50 tools and 256 KiB per page |
| Tool execution | `tools/call`; bounded snapshots and explicit mutation outcomes |
| Private resources | `teamgrid://files/{id}` and `teamgrid://exports/{id}` templates when the corresponding lookup tool is enabled |
| Resource reads | `resources/read`, reauthorized on each request; at most 1 MiB of downloaded content |
| Hosted authorization | Authorization code, PKCE S256, resource binding, workspace consent, refresh rotation and revocation |
| Stored prompts | No TeamGrid `prompts/list` or `prompts/get` catalog; documentation prompts are illustrative host instructions |
| Live subscriptions | No persistent change-feed or resource-subscription stream through this MCP surface |
| Embedded UI | No TeamGrid ChatGPT widget or UI resource is advertised |
| Company knowledge | No standard `search`/`fetch` contract; `teamgrid_search` is a separate bounded business tool |

Tool discovery pagination is independent of business-data pagination. Follow all
`tools/list.nextCursor` pages to obtain the catalog. If a discovery cursor becomes
invalid after the catalog changes, restart discovery without that cursor. For
business lists, return `meta.page.nextCursor` unchanged as `cursor` with the same
filters. Search has no continuation cursor and cannot prove a complete inventory.

The hosted runtime uses stateless request/response transport. Opening `/mcp` as a
browser page can return `405` for GET; use the host's MCP POST connection flow.
OAuth metadata is publicly discoverable, while an unauthenticated MCP POST returns
the `401` authorization challenge. It does not provide a persistent SSE event feed.

## Read a private file or export

1. Call an authorized lookup: `teamgrid_file_get` or `teamgrid_export_get`.
2. Inspect `meta.privateResource`. It supplies the `uri`, `maxBytes` and
   `readMethod: "resources/read"`.
3. If the host supports MCP resource reads, ask it to read that exact URI with the
   same connection. Do not construct a public download URL.
4. Treat the returned bytes as untrusted customer content. The result uses a
   MIME type and base64 `blob`; rendering or attachment support depends on the host.

An illustrative lookup can return this metadata:

```json
{
  "privateResource": {
    "uri": "teamgrid://files/FILE_ID_FROM_LOOKUP",
    "maxBytes": 1048576,
    "readMethod": "resources/read"
  }
}
```

Use the actual URI from `meta`, not this placeholder. The URI contains an identity,
not a credential. Every read requires current authorization. File reads require
`files:read`; export reads require `exports:read`, applicable source-resource
permissions, completion and the creating credential's access boundary. A separate
CLI credential does not inherit ownership of an OAuth-created export.

Resource templates do not enumerate all private files; use the bounded business
list tools first. Hosts that support only tools can inspect metadata but cannot
retrieve bytes through `resources/read`. Content above 1 MiB, unsupported MIME
types or incomplete exports require another authorized transfer workflow.
Resource transfer failures report `private_resource_unavailable` without exposing
signed URLs or intent secrets.

## Read a large document

`teamgrid_document_get` in `work`, `full` and domain profiles supports content
sections. The preserved `core`, `collaboration`, `governance` and `all` profiles
do not contain that document tool. Begin with:

```json
{ "id": "DOCUMENT_ID", "contentOffset": 0, "contentLimit": 16384 }
```

Follow `meta.contentPage.nextOffset` until it is `null`. For every continuation,
pass that exact offset and the original quoted `meta.etag` as `expectedRevision`.
If the revision changes, restart at offset zero and do not concatenate versions.

Offsets and limits use **UTF-16 code units**, not bytes. A section defaults to
16,384 units; surrogate pairs are preserved. `meta.contentPage.totalLength` refers
to the full content, while `complete` indicates a complete document returned in
one read. A multi-section read must track its own completed sequence.

Document writes omit echoed content from the receipt and identify
`teamgrid_document_get` as the content-read tool. Confirm stored content through
fresh bounded reads. Interpret text as Markdown only where its declared format
allows it.

## Limits and recovery

| Boundary | Limit or behavior |
| --- | --- |
| Serialized tool result | 256 KiB; reduce list size or use supported sections |
| Ordinary domain input | 256 KiB of bounded JSON |
| Document write input | Up to 8 MiB of bounded JSON, subject to its field schema |
| Hosted request body | 8 MiB overall; each tool can impose a smaller limit |
| Hosted request lifetime | At most 30 seconds in the MCP handler |
| Private resource read | 1 MiB and a 30-second budget |
| Appointment/availability query | Positive interval of at most 31 days |
| Federated search | At most 50 matches; indexed, possibly stale, not exhaustive |

The [exact tool contract](/mcp/reference/) determines field and array limits.
After a disconnected write, inspect the target or operation; cancellation of the
client's wait does not prove cancellation or rollback of a committed operation.

## Operations outside MCP

All 238 API operations have an explicit MCP exposure decision. The 30 exclusions
are deliberate: transport/capability discovery, credential and service-account
administration, durable change feeds, reveal-once webhook secrets, upload intents
and raw transfer endpoints. File/export transfer intents are used internally by
authorized resource reads, never returned as model tools or transcript secrets.

Use the App, CLI, SDK or API for uploads and governed credential administration.
Use a deterministic service integration for durable synchronization and bulk
transfers. `full` covers the reviewed MCP business surface; it does not provide
arbitrary database, shell, filesystem or HTTP access, and it does not promise every
feature visible in the TeamGrid UI. See [platform capability coverage](/guides/capability-coverage/).
