<p align="center">
  <a href="https://www.sociahive.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-dark.svg">
      <img alt="SociaHive" src="https://raw.githubusercontent.com/sociahive/.github/main/assets/brand/logo-light.svg" width="220">
    </picture>
  </a>
</p>

<p align="center">Run your social media from your AI tool: schedule posts, build DM and comment automations, and read analytics.</p>
<p align="center">The SociaHive app for Zapier.</p>

<p align="center">
  <a href="https://www.sociahive.com">Website</a> ·
  <a href="https://www.sociahive.com/developers">Developers</a> ·
  <a href="https://docs.sociahive.com">Docs</a> ·
  <a href="https://www.sociahive.com/auth/login?view=sign_up">Sign up</a>
</p>

# SociaHive for Zapier

A [Zapier Platform CLI](https://github.com/zapier/zapier-platform) app that connects [SociaHive](https://www.sociahive.com) to Zapier.

Status: not listed in the Zapier app directory yet.

## What the app does

| Kind | Name | What it does |
|---|---|---|
| Trigger (instant) | Post Published | Starts the Zap when a scheduled post is published to one of your accounts. Optionally limited to one account. |
| Trigger (instant) | Post Failed | Starts the Zap when a scheduled post fails to publish to one of your accounts. Optionally limited to one account. |
| Trigger (instant) | Automation Started | Starts the Zap when one of your automations starts for someone, for example after a keyword comment or DM. Optionally limited to one account or automation. |
| Trigger (instant) | Automation Error | Starts the Zap when one of your automations hits an error. Optionally limited to one account or automation. |
| Action | Create Post | Publishes, schedules, or saves a draft post on one connected account, with text and optional image or video links. |
| Action | Upload Media From URL | Copies an image or video from a public link into SociaHive, so a post can use it. |
| Action | Turn on Automation | Turns on an automation, after the same checks as the Turn on button in SociaHive. |
| Action | Turn Off Automation | Turns off an automation and keeps it as a draft. |
| Search | Find Account | Finds one of your connected accounts by username or name, optionally on one platform. |

The instant triggers use REST hooks: turning a Zap on creates a webhook subscription in SociaHive, and turning it off deletes it.

## Requirements

- A SociaHive account on the 7-day trial or a paid plan. API access is not part of the free plan; there the app says so and links to [pricing](https://www.sociahive.com/pricing).
- A SociaHive API key, created under **Settings > API keys**, with these scopes:

| Scope | Used by |
|---|---|
| `accounts:read` | The connection test, the account list, Find Account |
| `posts:read` | Sample data for Post Published and Post Failed |
| `posts:write` | Create Post |
| `flows:read` | The automation list |
| `flows:write` | Turn on Automation, Turn Off Automation |
| `uploads:write` | Upload Media From URL |
| `webhooks:write` | Turning instant triggers on and off |

- Each Zap with an instant trigger uses one webhook subscription. Zapier subscriptions do not count toward your plan's webhook limit, but an account can have at most 10 active webhook subscriptions of any kind while it adds a Zapier one.

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

- An API key only reaches what its scopes allow (for example `posts:read`, `posts:write`, `flows:write`). Revoke a key any time in **Settings > API keys**.
- Accounts connect through each platform's official login and APIs. SociaHive does not scrape and never asks for your account password (Bluesky uses an app password, Telegram a bot token).
- Platform tokens are stored encrypted on SociaHive's servers and are never returned by the API.
- The app keeps only the id of each webhook subscription it creates. Event deliveries go straight from SociaHive to your Zap.

## Local development

```bash
npm install
npm test
npx zapier validate
```

## Links

- [Docs](https://docs.sociahive.com)
- [SociaHive developer page](https://www.sociahive.com/developers)

## License

[MIT](LICENSE)
