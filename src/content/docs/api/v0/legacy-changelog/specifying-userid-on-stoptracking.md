---
title: "Specifying userId on stopTracking"
description: "Historical API v0 release note for stopping task time tracking for a specific user."
---

This archived release added an optional `userId` parameter to
[`POST /tasks/{_id}/stopTracking`](/api/v0/reference/operations/v0_post_tasks_id_stopTracking/).
Existing integrations could omit it; integrations tracking multiple users could select whose active
timer should stop.
