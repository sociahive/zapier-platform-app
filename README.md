# SociaHive — Zapier integration

Skeleton for the SociaHive Zapier Platform app. Built on Zapier Platform CLI
v16 (Node 20+).

**Status: scaffold only.** Submission to Zapier's app review is tracked in
[`docs/MCP/index.md` § Phase 4](../../docs/MCP/index.md#phase-4--no-code-reach).

## What's here

- `index.js` — app entry, request/response middleware (auth header injection,
  401 → re-auth, 429 → friendly error)
- `src/authentication.js` — custom API-key auth (graduates to OAuth once we
  round-trip the redirect with Zapier's editor)
- `src/triggers/new-published-post.js` — polling trigger that fires when a
  post finishes publishing
- `src/creates/create-post.js` — action that schedules/publishes a post

## Local dev

```bash
cd integrations/zapier
npm install
npm install -g zapier-platform-cli
zapier login
zapier validate
zapier test                 # run the integration's tests
zapier push                 # push as a private app to your Zapier account
```

## Path to public listing

1. Add 3 more triggers (`new_comment`, `flow_execution_completed`, `new_contact`)
2. Add 3 more actions (`update_post`, `cancel_post`, `add_tag`)
3. Swap auth from `custom` to `oauth2` — our `/api/oauth/authorize` already
   speaks OAuth 2.1 with PKCE; Zapier expects RFC 6749 §4.1 (no PKCE required
   on Zapier's side, but our server accepts both)
4. Write the Zapier reviewer guide as a new section in `docs/MCP/index.md`
   when we're ready to submit
5. Submit via `zapier promote 1.0.0` and respond to review comments

## Notes for reviewers (when we submit)

- Test account credentials: provided via email at submission time
- Sample posts.csv and walkthrough video: linked in submission form
- Rate limit: 1000 req/hr per API key; the integration's polling falls well
  under that
