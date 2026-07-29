---
title: "Sync time entries for reporting"
description: "Page through TeamGrid API v0 time entries, synchronize a bounded time window, and upsert records safely into reporting systems."
owner: Developer Platform
reviewedAt: 2026-07-29
---

```bash Shell
START_FROM="2026-07-01T00:00:00Z"
PAGE=1
LIMIT=100

while true; do
  RESPONSE=$(curl "https://api.teamgrid.app/times?startFrom=$START_FROM&page=$PAGE&limit=$LIMIT" \
    -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
    -H "Accept: application/json")

  printf '%s' "$RESPONSE" | jq -c '.data[]' | while read -r TIME_ENTRY; do
    TIME_ID=$(printf '%s' "$TIME_ENTRY" | jq -r '._id')
    echo "Upsert time entry $TIME_ID"
  done

  TOTAL_PAGES=$(printf '%s' "$RESPONSE" | jq -r '.pagination.pages')
  if [ "$PAGE" -ge "$TOTAL_PAGES" ]; then
    break
  fi
  PAGE=$((PAGE + 1))
done
```

> **Production note:** Run incremental syncs with a small overlap if downstream processing can be
> delayed. Upsert by TeamGrid `_id` so repeated synchronization remains safe.

## Choose a synchronization window

Use an ISO 8601 UTC timestamp for startFrom. Store the latest completed sync timestamp in your own system.

## Page through time entries

Request a stable page size and continue until the pagination metadata indicates that no more pages remain.

## Upsert by TeamGrid id

Use each time entry _id as the primary external key in the reporting system.
