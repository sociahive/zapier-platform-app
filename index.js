/**
 * SociaHive app for Zapier.
 *
 * Entry point. Wires up authentication, triggers, actions and searches.
 */

const authentication = require('./src/authentication')
const triggers = require('./src/triggers')
const creates = require('./src/creates')
const findAccount = require('./src/searches/find-account')
const { errorMessage } = require('./src/lib/api')

const byKey = (list) => Object.fromEntries(list.map((item) => [item.key, item]))

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  // Send the API key on every outbound request.
  beforeRequest: [
    (request, z, bundle) => {
      if (bundle.authData && bundle.authData.api_key) {
        request.headers['X-API-Key'] = bundle.authData.api_key
      }
      return request
    },
  ],

  // Turn API errors into messages the Zap editor can show.
  afterResponse: [
    (response, z) => {
      if (response.status < 400) return response
      if (response.request && response.request.skipThrowForStatus) return response
      const message = errorMessage(response)
      if (response.status === 401) {
        throw new z.errors.ExpiredAuthError(`Your SociaHive API key was refused: ${message}`)
      }
      if (response.status === 429) {
        throw new z.errors.ThrottledError(`SociaHive rate limit reached: ${message}`, 60)
      }
      if (response.status === 403) {
        const body = response.data && typeof response.data === 'object' ? response.data : {}
        if (body.code === 'upgrade_required') {
          throw new z.errors.Error(
            'API access needs the SociaHive trial or a paid plan. See https://www.sociahive.com/pricing',
            'UpgradeRequired',
            403,
          )
        }
        if (body.upgrade_required === true) {
          throw new z.errors.Error(`${message} See https://www.sociahive.com/pricing`, 'PlanLimit', 403)
        }
        throw new z.errors.Error(
          `${message} Your API key may be missing a scope this step needs. Check its scopes at https://www.sociahive.com/settings?tab=api-keys`,
          'MissingScope',
          403,
        )
      }
      throw new z.errors.Error(message, `HTTP${response.status}`, response.status)
    },
  ],

  triggers: byKey(Object.values(triggers)),
  creates: byKey(Object.values(creates)),
  searches: byKey([findAccount]),
}
