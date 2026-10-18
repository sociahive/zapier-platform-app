<p align="center">
  <a href="https://www.sociahive.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-dark.svg">
      <img alt="SociaHive" src="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-light.svg" width="220">
    </picture>
  </a>
</p>

<p align="center">The SociaHive app for Zapier: start Zaps from your posts and automations.</p>

<p align="center">
  <a href="https://www.sociahive.com">Website</a> ·
  <a href="https://www.sociahive.com/developers">Developers</a> ·
  <a href="https://docs.sociahive.com">Docs</a> ·
  <a href="https://www.sociahive.com/auth/login?view=sign_up">Sign up</a>
</p>

# SociaHive for Zapier

Connect [SociaHive](https://www.sociahive.com) to thousands of apps on [Zapier](https://zapier.com): start a Zap when a post goes live or an automation collects a lead, and create posts or switch automations on and off from other apps.

**Status:** submitting to the Zapier app directory. The app is not listed on Zapier yet.

## What the app does

Sign in with a SociaHive API key. API access is part of the 7-day trial and every paid plan; on the free plan every call answers `403 upgrade_required`.

| Kind | Name | What it does |
|---|---|---|
| Trigger (instant) | Post Published | A scheduled post went live. |
| Trigger (instant) | Post Failed | A scheduled post failed to publish. |
| Trigger (instant) | Automation Started | An automation started for someone. |
| Trigger (instant) | Automation Error | An automation hit an error. |
| Trigger (instant) | New Lead Collected | A flow collected a value (email, phone, answer). Needs lead webhooks enabled on your SociaHive account. |
| Action | Create Post | Creates a post on a connected account: save as draft, publish now or schedule, with media by URL. |
| Action | Upload Media From URL | Copies an image or video from a public URL into SociaHive. |
| Action | Turn on Automation | Turns an automation on. |
| Action | Turn Off Automation | Turns an automation off (back to draft). |
| Search | Find Account | Finds one of your connected accounts. |

Triggers are instant: turning a Zap on creates a SociaHive webhook for that event, and turning it off removes it. Zapier webhooks don't count toward your plan's webhook limit.

## Platforms

### Publish to

<p align="center">
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/instagram.svg" alt="Instagram" title="Instagram" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/facebook.svg" alt="Facebook" title="Facebook" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/linkedin.svg" alt="LinkedIn" title="LinkedIn" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/x.svg" alt="X" title="X" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/threads.svg" alt="Threads" title="Threads" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/tiktok.svg" alt="TikTok" title="TikTok" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/youtube.svg" alt="YouTube" title="YouTube" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/bluesky.svg" alt="Bluesky" title="Bluesky" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/content-scheduler"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/pinterest.svg" alt="Pinterest" title="Pinterest" width="24"></a>
</p>

### Automate DMs and comments on

<p align="center">
  <a href="https://www.sociahive.com/automation/instagram"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/instagram.svg" alt="Instagram" title="Instagram" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/facebook"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/facebook.svg" alt="Facebook" title="Facebook" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/features/messenger"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/messenger.svg" alt="Messenger" title="Messenger" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/whatsapp"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/whatsapp.svg" alt="WhatsApp" title="WhatsApp" width="24"></a>&nbsp;&nbsp;
  <a href="https://www.sociahive.com/automation/telegram"><img src="https://raw.githubusercontent.com/sociahive/.github/main/assets/platforms/telegram.svg" alt="Telegram" title="Telegram" width="24"></a>
</p>

## About this repository

The app is now developed and tested in the SociaHive codebase, and this repository will be updated when it is published. What is here today is the earlier scaffold:

- `index.js`: app entry, request and response middleware (API key header, 401 to re-auth, 429 to a friendly error)
- `src/authentication.js`: API key auth
- `src/triggers/new-published-post.js`: a polling trigger for published posts
- `src/creates/create-post.js`: create or schedule a post
- `src/creates/` and `src/searches/`: Autopilot operations (generate, adjust and approve a week, turn Autopilot on, get its status)

### Local dev

Needs Node 20 or later and the Zapier Platform CLI.

```bash
npm install
npx zapier login
npx zapier validate
npm test
```

## Data and permissions

- Accounts connect through each platform's official login and APIs. SociaHive does not scrape and never asks for your account password (Bluesky uses an app password, Telegram a bot token).
- Platform tokens are stored encrypted on SociaHive's servers. They are never sent to your AI tool and never returned by the API.
- Access is limited to the scopes you grant: API key scopes (for example `posts:read`, `posts:write`, `flows:write`) or the permissions you approve at OAuth sign-in, where you can choose read-only access.
- You can revoke access at any time: revoke a key in **Settings > API keys**, or disconnect an AI tool in **Settings > Connected apps**.

## Links

- [SociaHive developer docs](https://www.sociahive.com/developers)
- [SociaHive webhooks](https://www.sociahive.com/docs/webhooks)
- [n8n nodes](https://github.com/sociahive/n8n-nodes-sociahive)
