---
title: HTTP examples by language
description: Make the same bounded TeamGrid API v1 request from curl, Python, PHP, Java, and C# without exposing a credential.
owner: Developer Experience
reviewedAt: 2026-08-10
---

These examples call the read-only workspace endpoint. Replace the German host only when the
credential belongs to the United States region. Production clients should derive or configure the
regional host once and must not follow a redirect with an Authorization header.

Set `TEAMGRID_API_TOKEN` in the process environment before running an example. Never place the
value in source code, shell history, a URL, or a support transcript.

## curl

```bash
curl --fail-with-body \
  --connect-timeout 5 \
  --max-time 30 \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header "Accept: application/json" \
  https://api.de.teamgrid.app/v1/workspace
```

## Python 3.11+

The standard-library example rejects redirects and bounds the request timeout.

```python
import json
import os
import urllib.error
import urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, new_url):
        return None

request = urllib.request.Request(
    "https://api.de.teamgrid.app/v1/workspace",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {os.environ['TEAMGRID_API_TOKEN']}",
    },
)

opener = urllib.request.build_opener(NoRedirect)
try:
    with opener.open(request, timeout=30) as response:
        print(json.load(response))
except urllib.error.HTTPError as error:
    print(error.status, error.headers.get("x-request-id"))
    raise
```

## PHP 8.2+

```php
<?php
$token = getenv('TEAMGRID_API_TOKEN');
$request = curl_init('https://api.de.teamgrid.app/v1/workspace');
curl_setopt_array($request, [
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Authorization: Bearer ' . $token,
    ],
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_RETURNTRANSFER => true,
]);
$body = curl_exec($request);
$status = curl_getinfo($request, CURLINFO_RESPONSE_CODE);
if ($body === false || $status < 200 || $status >= 300) {
    throw new RuntimeException('TeamGrid request failed with HTTP ' . $status);
}
echo $body;
curl_close($request);
```

## Java 21+

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

var client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .followRedirects(HttpClient.Redirect.NEVER)
    .build();
var request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.de.teamgrid.app/v1/workspace"))
    .timeout(Duration.ofSeconds(30))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + System.getenv("TEAMGRID_API_TOKEN"))
    .GET()
    .build();
var response = client.send(request, HttpResponse.BodyHandlers.ofString());
if (response.statusCode() < 200 || response.statusCode() >= 300) {
  throw new IllegalStateException("TeamGrid HTTP " + response.statusCode());
}
System.out.println(response.body());
```

## C# and .NET 8

```csharp
using System.Net.Http.Headers;

using var handler = new HttpClientHandler { AllowAutoRedirect = false };
using var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(30) };
using var request = new HttpRequestMessage(
    HttpMethod.Get,
    "https://api.de.teamgrid.app/v1/workspace"
);
request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
request.Headers.Authorization = new AuthenticationHeaderValue(
    "Bearer",
    Environment.GetEnvironmentVariable("TEAMGRID_API_TOKEN")
);
using var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());
```

## Continue with a business resource

After workspace discovery succeeds, choose the relevant operation in the
[API reference](/api/v1/reference/). Preserve its method, regional `/v1` path, required scopes,
query encoding, request schema, idempotency behavior, and concurrency requirements. Do not infer a
write request from these read-only examples.
