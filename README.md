# n8n-nodes-socialecho-management-agent

n8n community node for SocialEcho external APIs.

## Included operations

- `Get Team` → `GET /v1/team` (JSON body: `{}`)
- `List Accounts` → `GET /v1/account` (JSON body: `page`, `type`)
- `List Articles` → `GET /v1/article` (JSON body: `page`, optional `account_ids` as integer array)
- `Get Report` → `GET /v1/report` (JSON body: `start_date`, `end_date`, `time_type`, `group`, optional `account_ids`)

This matches the exported OpenAPI contract (GET with `application/json` body, not query string).

Success criteria in node runtime:

- HTTP status must be `200`
- Response JSON field `code` must be `200` or `0`

Otherwise the node throws an execution error.

## Credentials

Create credential type **SocialEcho API**:

- `Base URL` (default: `https://api.socialecho.net`)
- `API Key` (team API key from SocialEcho)
- `Language` (`zh_CN` or `en`)
- `Team ID` (optional; sent as `X-Team-Id` only when non-empty)

Headers sent by this node:

- `Authorization: Bearer <API_KEY>`
- `X-Lang: <lang>`
- `X-Team-Id` only when Team ID is configured

## Platform publish limits (reference)

When you build workflows that call SocialEcho **publish** APIs (outside this node’s query/report scope), use the bundled reference docs for per-network copy length, media counts, formats, and sizes:

| File | Language |
| --- | --- |
| `platform-publish-limits_cn.md` | Chinese |
| `platform-publish-limits_en.md` | English |

These files are kept in sync with the [social-media-autopilot](https://github.com/SocialEcho-net/social-media-autopilot) skill repository.

## Local build

```bash
npm install
npm run build
```

## Local load in n8n

Option A (development):

1. Build this package.
2. Copy or symlink this folder into your n8n custom nodes location.
3. Restart n8n.

Option B (published package):

```bash
npm install n8n-nodes-socialecho-management-agent
```

Then restart n8n.

## Verified pipeline (for n8n Creator Portal)

This repository includes GitHub Actions workflow:

- `.github/workflows/publish.yml`
- Publishes with npm provenance: `npm publish --provenance --access public`

Recommended release flow:

1. Configure npm Trusted Publisher for this GitHub repository.
2. Bump package version in `package.json`.
3. Push to `main`.
4. Create GitHub Release (or run workflow manually).
5. Confirm new version appears on npm.
6. Submit package URL in n8n Creator Portal for verification review.
