/**
 * Triggers — events that fire Zaps.
 *
 * Phase 4 (this PR): one trigger to validate the integration end-to-end.
 * Future: `new_comment`, `flow_execution_completed`, `new_contact`, etc.
 */

module.exports = {
  newPublishedPost: require('./new-published-post'),
}
