/**
 * Shared API helpers: the base URL, error messages, and the account and flow
 * lookups several triggers and actions need.
 */

const API_BASE = 'https://www.sociahive.com/api/v1'

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  messenger: 'Messenger',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  twitter: 'X',
  tiktok: 'TikTok',
  threads: 'Threads',
  youtube: 'YouTube',
  bluesky: 'Bluesky',
  pinterest: 'Pinterest',
}

const platformLabel = (platform) => PLATFORM_LABELS[platform] || platform

/** "@handle", else the account's name, else its platform. */
const accountName = (account) => {
  if (account.username) return `@${String(account.username).replace(/^@/, '')}`
  return account.display_name || account.name || platformLabel(account.platform)
}

const accountLabel = (account) => `${accountName(account)} (${platformLabel(account.platform)})`

/** The message to show for a failed API call, from the JSON error body. */
const errorMessage = (response) => {
  const body = response.data && typeof response.data === 'object' ? response.data : null
  const base = (body && (body.error || body.message || body.reason)) || `SociaHive returned HTTP ${response.status}`
  const text = typeof base === 'string' ? base : JSON.stringify(base)
  // Post create/schedule refusals list the target that did not fit.
  const targets = body && Array.isArray(body.targets) ? body.targets : []
  const details = targets
    .map((t) => [t.platform, t.message].filter(Boolean).join(': '))
    .filter(Boolean)
  return details.length > 0 ? `${text} (${details.join('; ')})` : text
}

const listAccounts = async (z, platform) => {
  const response = await z.request({
    url: `${API_BASE}/connected-accounts`,
    params: platform ? { platform } : {},
  })
  return (response.data && response.data.data) || []
}

const findAccount = async (z, accountId) => {
  const accounts = await listAccounts(z)
  const account = accounts.find((a) => a.id === accountId)
  if (!account) {
    throw new z.errors.Error(
      'That account is not connected to SociaHive any more. Pick another account.',
      'AccountNotFound',
      404,
    )
  }
  return account
}

/** Flows of one connected account (the API lists flows per account). */
const listFlowsForAccount = async (z, accountId) => {
  const account = await findAccount(z, accountId)
  const response = await z.request({
    url: `${API_BASE}/flows`,
    params: { platform_user_id: account.platform_user_id },
  })
  return (response.data && response.data.flows) || []
}

const flowId = (flow) => String(flow.id || flow._id)

module.exports = {
  API_BASE,
  PLATFORM_LABELS,
  platformLabel,
  accountName,
  accountLabel,
  errorMessage,
  listAccounts,
  findAccount,
  listFlowsForAccount,
  flowId,
}
