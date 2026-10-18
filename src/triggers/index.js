/**
 * Triggers: events that fire Zaps, plus the hidden account list behind the
 * Create Post dropdown.
 */

module.exports = {
  newPublishedPost: require('./new-published-post'),
  accountList: require('./account-list'),
}
