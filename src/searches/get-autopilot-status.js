/**
 * Search: Get Autopilot status.
 *
 * Read-only lookup of the account's Autopilot config — whether it's on, the
 * review mode, and the posts-per-week cadence. Zapier searches must return an
 * array; we wrap the single config record in one, each with an `id`.
 */

const perform = async (z, bundle) => {
  const params = {}
  if (bundle.inputData.account_id) {
    params.account_id = bundle.inputData.account_id
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/autopilot/config',
    params,
  })

  const config = response.data?.data ?? response.data
  if (!config) return []

  return [{ id: config.id ?? 'autopilot_config', ...config }]
}

module.exports = {
  key: 'getAutopilotStatus',
  noun: 'Autopilot Status',

  display: {
    label: 'Get Autopilot Status',
    description:
      'Look up the account\'s Autopilot configuration — whether it\'s on, the ' +
      'review mode, and the weekly posting cadence.',
  },

  operation: {
    inputFields: [
      {
        key: 'account_id',
        label: 'Account ID',
        required: false,
        helpText:
          'Optional. Look up Autopilot config for a specific connected account. ' +
          'Leave blank for the API key\'s default account.',
      },
    ],

    perform,

    sample: {
      id: 'autopilot_config',
      status: 'active',
      enabled: true,
      posts_per_week: 7,
      review_mode: 'approve',
      updated_at: '2026-05-25T12:00:00Z',
    },

    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
      { key: 'posts_per_week', label: 'Posts per week', type: 'integer' },
      { key: 'review_mode', label: 'Review mode' },
      { key: 'updated_at', label: 'Updated at' },
    ],
  },
}
