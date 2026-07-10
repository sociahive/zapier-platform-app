/**
 * Action: Adjust the current Autopilot week.
 *
 * Re-plans the draft batch, optionally steered by free-text `feedback`
 * ("more Reels", "lean casual", "skip Sundays"). Still produces a DRAFT the
 * user reviews before it goes live — adjusting never publishes.
 */

const perform = async (z, bundle) => {
  const body = {}
  if (bundle.inputData.feedback) {
    body.feedback = bundle.inputData.feedback
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/autopilot/adjust',
    method: 'POST',
    body,
  })

  return response.data
}

module.exports = {
  key: 'adjustAutopilotWeek',
  noun: 'Autopilot Week',

  display: {
    label: 'Adjust Autopilot Week',
    description:
      'Re-plan the current Autopilot draft week, optionally steered by ' +
      'free-text feedback. Produces an updated draft to review.',
  },

  operation: {
    inputFields: [
      {
        key: 'feedback',
        label: 'Feedback',
        required: false,
        type: 'text',
        helpText:
          'Optional. Steer the re-plan in plain language, e.g. "more Reels", ' +
          '"lean casual", or "skip Sundays".',
      },
    ],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439013',
      batch_id: '507f1f77bcf86cd799439013',
      status: 'pending',
      posts_planned: 7,
      week_start: '2026-06-01T00:00:00Z',
      updated_at: '2026-05-25T12:05:00Z',
    },

    outputFields: [
      { key: 'batch_id', label: 'Batch ID' },
      { key: 'status', label: 'Status' },
      { key: 'posts_planned', label: 'Posts planned', type: 'integer' },
      { key: 'week_start', label: 'Week start' },
      { key: 'updated_at', label: 'Updated at' },
    ],
  },
}
