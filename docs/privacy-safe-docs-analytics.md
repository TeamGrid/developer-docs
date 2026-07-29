# Privacy-safe documentation analytics

The portal records only two event types through `/api/docs-events`:

- `page_feedback`: static page path and a binary helpful/not-yet value;
- `search_performed`: static page path, selected documentation area, and result count.

The browser never sends the search phrase, credential, workspace slug, request-builder input,
request body, user identifier, customer identifier, referrer, or user-agent value. The Pages
Function does not read IP or cookie headers and rejects unknown event shapes.

For production, add an Analytics Engine binding named `DOCS_ANALYTICS` with dataset
`teamgrid_developer_docs` to the `teamgrid-developer-docs` Pages project. Cloudflare documents this
under Pages → Settings → Bindings → Analytics Engine. Redeploy after adding the binding.

Without the binding, the endpoint remains safe and returns `204`, but no aggregate is persisted.
The binding can be queried through the Analytics Engine SQL API using the documented blob layout:

1. event name;
2. static page path;
3. documentation filter;
4. numeric feedback value or result count.
