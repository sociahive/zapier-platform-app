/**
 * Creates: actions a Zap performs.
 */

const { activateFlow, deactivateFlow } = require('./flow-status')

module.exports = {
  createPost: require('./create-post'),
  uploadMedia: require('./upload-media'),
  activateFlow,
  deactivateFlow,
}
