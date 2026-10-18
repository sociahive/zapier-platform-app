/**
 * Search: Find a connected account by username (or name), optionally on one
 * platform. Reads GET /api/v1/connected-accounts and matches locally.
 */

const { PLATFORM_LABELS, accountLabel, listAccounts } = require('../lib/api')

const normalize = (value) => String(value || '').trim().replace(/^@/, '').toLowerCase()

const perform = async (z, bundle) => {
  const wanted = normalize(bundle.inputData.username)
  const accounts = await listAccounts(z, bundle.inputData.platform)
  const exact = accounts.filter((a) => normalize(a.username) === wanted)
  const byName = accounts.filter(
    (a) => !exact.includes(a) && [a.display_name, a.name].some((n) => normalize(n) === wanted),
  )
  return [...exact, ...byName].map((a) => ({
    id: a.id,
    label: accountLabel(a),
    platform: a.platform,
    username: a.username || null,
    name: a.display_name || a.name || null,
    status: a.status,
    platform_user_id: a.platform_user_id,
  }))
}

module.exports = {
  key: 'findAccount',
  noun: 'Account',

  display: {
    label: 'Find Account',
    description: 'Finds one of your connected accounts by username or name.',
  },

  operation: {
    inputFields: [
      {
        key: 'username',
        label: 'Username or Name',
        required: true,
        helpText: 'The handle (with or without @) or the display name of the account.',
      },
      {
        key: 'platform',
        label: 'Platform',
        required: false,
        choices: PLATFORM_LABELS,
      },
    ],
    perform,
    sample: {
      id: '66f1c0a8e4b0a1b2c3d4e5f7',
      label: '@brand (Instagram)',
      platform: 'instagram',
      username: 'brand',
      name: 'Brand',
      status: 'connected',
      platform_user_id: '17841400000000000',
    },
    outputFields: [
      { key: 'id', label: 'Account ID' },
      { key: 'platform', label: 'Platform' },
      { key: 'username', label: 'Username' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
      { key: 'platform_user_id', label: 'Platform User ID' },
    ],
  },
}
