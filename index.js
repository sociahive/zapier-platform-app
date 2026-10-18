/**
 * SociaHive app for the Zapier Platform CLI.
 *
 * Entry point. Wires up the authentication module, triggers, and actions.
 */

const authentication = require('./src/authentication')
const triggers = require('./src/triggers')
const creates = require('./src/creates')

// The `code` field of an error body, or undefined when the body is not JSON.
const readCode = (response) => {
  try {
    const body = response.data ?? JSON.parse(response.content || '{}')
    return body && body.code
  } catch {
    return undefined
  }
}

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  // Send the API key (or an OAuth bearer) on every outbound request.
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
        if (readCode(response) === 'upgrade_required') {
          throw new Error(
            'API access is part of the SociaHive trial and paid plans. See https://www.sociahive.com/pricing',
          )
        }
        throw new Error(
          'Your SociaHive key is missing a required scope. See https://www.sociahive.com/settings?tab=api-keys',
        )
      }
      if (response.status === 429) {
        throw new Error('SociaHive rate limit reached. Wait a minute and retry.')
      }
      return response
    },
  ],

  triggers: {
    [triggers.newPublishedPost.key]: triggers.newPublishedPost,
    [triggers.accountList.key]: triggers.accountList,
  },

  creates: {
    [creates.createPost.key]: creates.createPost,
  },
}
