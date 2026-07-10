/**
 * Creates — actions a Zap performs.
 */

module.exports = {
  createPost: require('./create-post'),
  generateAutopilotWeek: require('./generate-autopilot-week'),
  adjustAutopilotWeek: require('./adjust-autopilot-week'),
  approveAutopilotWeek: require('./approve-autopilot-week'),
  turnOnAutopilot: require('./turn-on-autopilot'),
}
