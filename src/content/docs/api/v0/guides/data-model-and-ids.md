---
title: "Data Model and IDs"
description: "Map public API names such as tasks, time entries, and journal entries to TeamGrid data concepts and ids."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Map public API names such as tasks, time entries, and journal entries to TeamGrid data concepts and ids.

TeamGrid has a long-running domain model. Some API names are intentionally
friendlier than internal collection names, and some legacy response fields may
reflect older internal naming.

This guide explains the mappings you are most likely to encounter.

## IDs

TeamGrid resources use string ids.

Common id fields:

* `_id`: id of the current resource
* `teamId`: team id assigned from the API token
* `userId`: user id
* `contactId`: contact id
* `projectId`: project id
* `taskId`: public API task id
* `cardId`: internal task/card id that can appear in some legacy responses
* `serviceId`: service id
* `listId`: list id
* `tagIds`: array of tag ids

## Tasks and Cards

The public API uses the word `task`.

Internally, tasks are stored in the same collection as other card-like objects.
For API integrations, use the public task endpoints and public `taskId` fields
where available.

Some time and scheduling responses may expose `cardId`. In those cases, `cardId`
refers to the same underlying object as a task id.

Relevant reference pages:

* [List tasks](/api/v0/reference/operations/v0_get_tasks/)
* [Create task](/api/v0/reference/operations/v0_post_tasks/)
* [List time entries](/api/v0/reference/operations/v0_get_times/)
* [List scheduled work](/api/v0/reference/operations/v0_get_scheduledwork/)

## Time Entries

Time entries belong to:

* a team
* a task
* a user
* optionally a service

Important fields:

* `start`: start timestamp
* `end`: end timestamp, absent while tracking is active
* `duration`: duration in minutes
* `userId`: user who tracked the time
* `taskId` or `cardId`: task reference
* `billable`: whether the time is billable
* `billed` or `locked`: billing/locking state, depending on endpoint behavior

## Journal Entries

The public API calls these records `journalEntries`.

In the TeamGrid app and codebase, they are project journal entries or project
statements. A journal entry belongs to a project and can represent a manual
entry, product entry, budget entry, or bundle entry.

Important fields:

* `type`
* `projectId`
* `productId`
* `title`
* `amount` or legacy `price`
* `count`
* `date`
* `isCharge`
* `purchasePrice`
* `productNumber`
* `description`

Relevant reference pages:

* [List journal entries](/api/v0/reference/operations/v0_get_journalentries/)
* [Create journal entry](/api/v0/reference/operations/v0_post_journalentries/)
* [Update journal entry](/api/v0/reference/operations/v0_put_journalentries_id/)

## Read-Only and Calculated Fields

Some responses include calculated or denormalized fields. Examples include:

* `_details`
* `_aggregated`
* `_projectSharing`

These fields are useful for reading enriched data, but they are not stable write
inputs. Use the documented top-level request fields when creating or updating
records.
