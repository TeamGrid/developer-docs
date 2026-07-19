---
title: "Start and stop task time tracking"
description: "USER_ID=$(curl \"https://api.teamgrid.app/users?email=alex@example.com\" \\"
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

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

```json Response Example
Use UTC timestamps and avoid overlapping active timers for the same user unless that is intentional for your workflow.
```

# Resolve the user and task ids

<!-- bash@1-7 -->

Use GET /users to find the TeamGrid user id and store the task id from your task workflow.

# Start tracking

<!-- bash@9-18 -->

Send userId and the start timestamp to `POST /tasks/{_id}/startTracking`.

# Stop tracking

<!-- bash@20-29 -->

Send the stop timestamp to `POST /tasks/{_id}/stopTracking`. Include userId when your integration tracks multiple users.
