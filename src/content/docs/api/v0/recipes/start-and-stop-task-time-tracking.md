---
title: "Start and stop task time tracking"
description: "Resolve a TeamGrid user, start task time tracking through API v0, and close the running timer with an explicit timestamp."
owner: Developer Platform
reviewedAt: 2026-07-29
---

```bash Shell
USER_ID=$(curl "https://api.teamgrid.app/users?email=alex@example.com" \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Accept: application/json" \
  | jq -r '.data[0]._id')

TASK_ID="TASK_ID_FROM_YOUR_WORKFLOW"

curl "https://api.teamgrid.app/tasks/$TASK_ID/startTracking" \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"time\": \"2026-07-01T09:00:00Z\"
  }"

curl "https://api.teamgrid.app/tasks/$TASK_ID/stopTracking" \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"time\": \"2026-07-01T10:15:00Z\"
  }"
```

> **Production note:** Use UTC timestamps and avoid overlapping active timers for the same user
> unless that is intentional for your workflow.

## Resolve the user and task ids

Use GET /users to find the TeamGrid user id and store the task id from your task workflow.

## Start tracking

Send userId and the start timestamp to `POST /tasks/{_id}/startTracking`.

## Stop tracking

Send the stop timestamp to `POST /tasks/{_id}/stopTracking`. Include userId when your integration tracks multiple users.
