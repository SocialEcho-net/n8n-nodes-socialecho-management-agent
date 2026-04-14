# n8n-nodes-socialecho-management-agent

n8n community node for SocialEcho external APIs.

## Included operations

- `Get Team` -> `GET /v1/team`
- `List Accounts` -> `GET /v1/account`
- `List Articles` -> `GET /v1/article`
- `Get Report` -> `GET /v1/report`

Success criteria in node runtime:

- HTTP status must be `200`
- Response JSON field `code` must be `200`

Otherwise the node throws an execution error.

## Credentials

Create credential type **SocialEcho API**:

- `Base URL` (example: `https://api-dev.socialecho.net`)
- `API Key` (team API key from SocialEcho)
- `Language` (`zh_CN` or `en`)
- `Team ID` (optional)

Headers sent by this node:

- `Authorization: Bearer <API_KEY>`
- `X-Lang: <lang>`
- `X-Team-Id: <teamId>` (only when provided)

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
