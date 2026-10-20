/**
 * Triggers. The six event triggers are REST hooks on /api/v1/webhooks;
 * accountList and flowList are hidden and only feed dropdowns.
 */

const { newPublishedPost, postFailed } = require('./post-events')
const { postReviewDecision, plugFired } = require('./scheduler-events')
const { flowTriggered, flowError } = require('./flow-events')
const { accountList, flowList } = require('./dropdowns')

module.exports = {
  newPublishedPost,
  postFailed,
  postReviewDecision,
  plugFired,
  flowTriggered,
  flowError,
  accountList,
  flowList,
}
