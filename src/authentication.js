/**
 * Authentication module.
 *
 * Ships two auth methods today: a simple API-key flow (custom auth) and a
 * placeholder for OAuth 2.0. Zapier prefers OAuth for end-user trust, so the
 * goal is to graduate to that once we've round-tripped the redirect flow with
 * Zapier's editor.
 *
 * For now we use `custom` auth keyed on `api_key` — fastest path to a working
 * private app for QA before public submission.
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
