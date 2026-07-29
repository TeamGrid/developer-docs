---
title: Upload a file safely
description: Use private upload intents without exposing TeamGrid storage URLs or long-lived credentials.
owner: Developer Experience
reviewedAt: 2026-07-29
---

TeamGrid file uploads use short-lived intents. The API never asks a client to invent a storage path
or attach a bearer credential to an object-storage URL.

## 1. Create an upload intent

Call `POST /file-upload-intents` with the target resource, file name, media type, and byte size. Use
a stable idempotency key so a retry cannot allocate unrelated upload reservations.

Store the returned intent ID only for the duration of the upload. Treat every upload header and
opaque upload token as a secret.

## 2. Transfer the exact file

Upload directly to the returned destination with the required headers. Do not add the TeamGrid API
bearer token. Enforce the declared maximum byte count locally and reject redirects.

## 3. Finalize

Call the finalize operation with the intent ID. TeamGrid verifies the reservation and creates the
file resource in the workspace. If the reservation expired, create a new intent instead of
replaying the old upload URL.

## Failure handling

- Cancel an intent when the user abandons an upload.
- Never log upload URLs, opaque tokens, or private file contents.
- Retry the transfer only when the destination explicitly allows it.
- Treat a finalize conflict as an instruction to inspect the current intent state.
- Create downloads through a private download intent; do not persist its temporary destination.

Use the API reference filter to locate the upload-intent, finalize, cancellation, and download
operations.
