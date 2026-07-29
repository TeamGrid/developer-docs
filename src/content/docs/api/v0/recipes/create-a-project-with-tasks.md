---
title: "Create a project with tasks"
description: "Create a TeamGrid project through API v0, add its first tasks, and retain the returned identifiers for later synchronization."
owner: Developer Platform
reviewedAt: 2026-07-29
---

```bash Shell
PROJECT_RESPONSE=$(curl https://api.teamgrid.app/projects \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Website relaunch",
    "description": "Implementation project for the new website.",
    "plannedStart": "2026-07-01T09:00:00Z",
    "plannedEnd": "2026-07-31T17:00:00Z"
  }')

PROJECT_ID=$(printf '%s' "$PROJECT_RESPONSE" | jq -r '.data._id')
echo "Created project $PROJECT_ID"

curl https://api.teamgrid.app/tasks \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"Prepare launch checklist\",
    \"projectId\": \"$PROJECT_ID\",
    \"plannedTime\": 120
  }"

curl https://api.teamgrid.app/tasks \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"QA launch flow\",
    \"projectId\": \"$PROJECT_ID\",
    \"plannedTime\": 90
  }"
```

> **Production note:** Use the returned identifiers as the durable link between your system and
> TeamGrid. Avoid retrying POST requests blindly after a timeout unless your integration can detect
> duplicates.

## Create the project

Send the project name and optional planning fields to POST /projects. TeamGrid assigns the team from the API token, so do not send teamId.

## Store the project id

Persist the returned project _id in your own system. Use that id when creating tasks and when reconciling later updates.

## Create tasks for the project

Create each task with the returned project id. Keep the returned task ids so future updates target the existing tasks instead of creating duplicates.
