/**
 * SociaHive — Zapier Platform CLI app.
 *
 * Entry point. Wires up the authentication module, triggers, and actions.
 * Production submission steps are documented in ./README.md.
 */

const authentication = require('./src/authentication')
const triggers = require('./src/triggers')
const creates = require('./src/creates')

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  // Inject the X-API-Key (or OAuth bearer) header on every outbound request.
  beforeRequest: [
    (request, z, bundle) => {
      if (bundle.authData?.api_key) {
        request.headers['X-API-Key'] = bundle.authData.api_key
      } else if (bundle.authData?.access_token) {
        request.headers.Authorization = `Bearer ${bundle.authData.access_token}`
      }
      return request
    },
  ],

  // Translate HTTP errors into Zapier-friendly messages so the Zap editor shows
  // something actionable instead of a raw 4xx body.
  afterResponse: [
    (response, z, bundle) => {
      if (response.status === 401) {
        throw new z.errors.RefreshAuthError('SociaHive API key invalid or revoked')
      }
      if (response.status === 403) {
        throw new Error(
          'Your SociaHive key is missing a required scope. See https://www.sociahive.com/settings?tab=api-keys',
        )
      }
      if (response.status === 429) {
        throw new Error('SociaHive rate limit exceeded — wait and retry')
      }
      return response
    },
  ],

  triggers: {
    [triggers.newPublishedPost.key]: triggers.newPublishedPost,
  },

  creates: {
    [creates.createPost.key]: creates.createPost,
  },
}
