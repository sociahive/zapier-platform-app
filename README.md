<p align="center">
  <a href="https://www.sociahive.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-dark.svg">
      <img alt="SociaHive" src="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-light.svg" width="220">
    </picture>
  </a>
</p>

<p align="center">Run your social media from your AI tool: schedule posts, build DM and comment automations, and read analytics.</p>
<p align="center">This repo holds a small SociaHive app for Zapier.</p>

<p align="center">
  <a href="https://www.sociahive.com">Website</a> ·
  <a href="https://www.sociahive.com/developers">Developers</a> ·
  <a href="https://docs.sociahive.com">Docs</a> ·
  <a href="https://www.sociahive.com/auth/login?view=sign_up">Sign up</a>
</p>

# SociaHive for Zapier

A [Zapier Platform CLI](https://github.com/zapier/zapier-platform) app that connects [SociaHive](https://www.sociahive.com) to Zapier with one trigger and one action. It is not listed in the Zapier app directory. A fuller app is being prepared for the directory.

## What the app does

| Kind | Name | What it does |
|---|---|---|
| Trigger (polling) | New Published Post | Checks your 50 most recent published posts every few minutes and starts the Zap for each new one. You can limit it to one platform. |
| Action | Create Post | Creates a post on one connected account: publish now, or schedule it with a date, time and timezone. Takes a caption and, optionally, one image by public URL. |

The account field in Create Post lists your connected accounts.

## Sign in

The app signs in with a SociaHive API key, sent as the `X-API-Key` header. Create one in SociaHive under **Settings > API keys** with these scopes:

- `accounts:read`: the connection test and the account list
- `posts:read`: New Published Post
- `posts:write`: Create Post

API access is part of the 7-day trial and every paid plan. On the free plan the API answers `403 upgrade_required`, and the app says so and links to [pricing](https://www.sociahive.com/pricing).

The API allows 120 reads and 30 writes a minute, and 1,000 requests a day across all of them. See [rate limits](https://docs.sociahive.com/rate-limits).

## Platforms you can post to

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

## Data and permissions

- The API key only reaches what its scopes allow. Revoke it any time in **Settings > API keys**.
- Accounts connect through each platform's official login and APIs. SociaHive does not scrape and never asks for your account password (Bluesky uses an app password, Telegram a bot token).
- Platform tokens are stored encrypted on SociaHive's servers and are never returned by the API.

## Develop

```bash
npm install
npm test
npx zapier validate
```

## Links

- [SociaHive developer docs](https://www.sociahive.com/developers)
- [API reference](https://docs.sociahive.com)
- [n8n nodes](https://github.com/sociahive/n8n-nodes-sociahive) (coming soon, not on npm yet)
