/**
 * Authentication: a SociaHive API key, sent as X-API-Key on every request
 * (see beforeRequest in index.js).
 *
 * The test call lists connected accounts, which checks the key and its
 * accounts:read scope. API access is part of the trial and paid plans.
 */

const { API_BASE, accountName } = require('./lib/api')

const test = (z) => z.request({ url: `${API_BASE}/connected-accounts` })

module.exports = {
  type: 'custom',
  test,

  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      required: true,
      type: 'password',
      helpText:
        'Create one in SociaHive under [Settings → API keys](https://www.sociahive.com/settings?tab=api-keys). ' +
        'Give it these scopes: accounts:read, posts:read, posts:write, flows:read, flows:write, uploads:write, webhooks:write. ' +
        'API access needs the SociaHive trial or a paid plan.',
    },
  ],

  // The test call's response: name the connection after the first account.
  connectionLabel: (z, bundle) => {
    const accounts = (bundle.inputData && bundle.inputData.data) || []
    return accounts.length > 0 ? accountName(accounts[0]) : ''
  },
}
