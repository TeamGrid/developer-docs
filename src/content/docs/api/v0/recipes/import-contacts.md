---
title: "Import contacts"
description: "Map contacts from another system to TeamGrid API v0, create each record, and preserve identifiers for repeatable updates."
owner: Developer Platform
reviewedAt: 2026-07-29
---

```bash Shell
CONTACT_PAYLOAD='{
  "type": "person",
  "firstname": "Alex",
  "lastname": "Miller",
  "category": "customer",
  "emails": [
    {
      "type": "work",
      "email": "alex@example.com"
    }
  ],
  "phoneNumbers": [
    {
      "type": "work",
      "number": "+49 30 123456"
    }
  ]
}'

CONTACT_RESPONSE=$(curl https://api.teamgrid.app/contacts \
  -X POST \
  -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$CONTACT_PAYLOAD")

CONTACT_ID=$(printf '%s' "$CONTACT_RESPONSE" | jq -r '.data._id')
echo "Created contact $CONTACT_ID"
```

> **Production note:** For repeat imports, keep a mapping from your source identifier to the
> TeamGrid `_id`. If you do not have that mapping yet, search existing contacts first and create
> only records that are missing.

## Prepare one contact payload per record

Map your source record to the TeamGrid contact fields. Use type person or company and include email addresses where available.

## Create the contact

Send the contact to POST /contacts. TeamGrid assigns teamId from the API token.

## Persist the TeamGrid id

Store the returned _id next to your source-system id. Use `PUT /contacts/{_id}` for future changes instead of creating another contact.
