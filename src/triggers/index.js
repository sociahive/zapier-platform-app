/**
 * Triggers. The four event triggers are REST hooks on /api/v1/webhooks;
 * accountList and flowList are hidden and only feed dropdowns.
 */

const { newPublishedPost, postFailed } = require('./post-events')
const { flowTriggered, flowError } = require('./flow-events')
const { accountList, flowList } = require('./dropdowns')

module.exports = {
  newPublishedPost,
  postFailed,
  flowTriggered,
  flowError,
  accountList,
  flowList,
}
