/**
 * Authentication module.
 *
 * Custom auth keyed on a SociaHive API key, sent as `X-API-Key` (see the
 * `beforeRequest` hook in index.js).
 */

const test = (z) => z.request({
  url: 'https://www.sociahive.com/api/v1/connected-accounts',
})

module.exports = {
  type: 'custom',
  test,

  fields: [
    {
      key: 'api_key',
      label: 'SociaHive API key',
      required: true,
      type: 'password',
      helpText:
        'Generate one at https://www.sociahive.com/settings?tab=api-keys. ' +
        'Required scopes: posts:read, posts:write, accounts:read.',
    },
  ],

  connectionLabel: (z, bundle) => bundle.inputData?.accountLabel ?? 'SociaHive',
}
