---
title: "Import contacts"
description: "CONTACT_PAYLOAD='{"
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

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

```json Response Example
For repeat imports, keep a mapping from your source id to TeamGrid _id. If you do not have that mapping yet, search existing contacts first and only create missing records.
```

# Prepare one contact payload per record

<!-- bash@1-16 -->

Map your source record to the TeamGrid contact fields. Use type person or company and include email addresses where available.

# Create the contact

<!-- bash@18-24 -->

Send the contact to POST /contacts. TeamGrid assigns teamId from the API token.

# Persist the TeamGrid id

<!-- bash@26-28 -->

Store the returned _id next to your source-system id. Use `PUT /contacts/{_id}` for future changes instead of creating another contact.
