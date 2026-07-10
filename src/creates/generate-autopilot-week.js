/**
 * Action: Generate an Autopilot week.
 *
 * Kicks off SociaHive Autopilot's weekly plan — AI plans, writes, designs, and
 * schedules a full week of on-brand posts for the connected accounts. Produces
 * a DRAFT batch the user reviews (or adjusts) before it can go live. Takes no
 * inputs; the plan is grounded server-side by the account's Brand Kit + config.
 */

const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/autopilot/generate',
    method: 'POST',
    body: {},
  })

  return response.data
}

module.exports = {
  key: 'generateAutopilotWeek',
  noun: 'Autopilot Week',

  display: {
    label: 'Generate Autopilot Week',
    description:
      'Generate a full week of AI-planned, on-brand posts with Autopilot. ' +
      'Produces a draft batch to review before it goes live.',
  },

  operation: {
    inputFields: [],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439013',
      batch_id: '507f1f77bcf86cd799439013',
      status: 'pending',
      posts_planned: 7,
      week_start: '2026-06-01T00:00:00Z',
      created_at: '2026-05-25T12:00:00Z',
    },

    outputFields: [
      { key: 'batch_id', label: 'Batch ID' },
      { key: 'status', label: 'Status' },
      { key: 'posts_planned', label: 'Posts planned', type: 'integer' },
      { key: 'week_start', label: 'Week start' },
      { key: 'created_at', label: 'Created at' },
    ],
  },
}
