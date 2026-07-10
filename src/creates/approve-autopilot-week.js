/**
 * Action: Approve the current Autopilot week — IRREVERSIBLE go-live.
 *
 * Approving schedules the draft batch to a REAL audience. There is no un-publish
 * once posts fire. We surface a required `confirm` checkbox in the Zap editor and
 * pass it through; the API also fails closed with 400 `confirmation_required`
 * when confirm is not true, so the guard is enforced server-side too.
 */

const perform = async (z, bundle) => {
  if (bundle.inputData.confirm !== true) {
    throw new z.errors.Error(
      'Check "I understand this publishes to my real audience" to approve the Autopilot week.',
      'confirmation_required',
      400,
    )
  }

  const body = { confirm: true }
  if (bundle.inputData.batchId) {
    body.batchId = bundle.inputData.batchId
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/autopilot/approve',
    method: 'POST',
    body,
  })

  return response.data
}

module.exports = {
  key: 'approveAutopilotWeek',
  noun: 'Autopilot Week',

  display: {
    label: 'Approve Autopilot Week',
    description:
      'Approve and schedule the Autopilot week to your real audience. ' +
      'IRREVERSIBLE — once approved, posts go live and cannot be un-published.',
  },

  operation: {
    inputFields: [
      {
        key: 'confirm',
        label: 'I understand this publishes to my real audience',
        required: true,
        type: 'boolean',
        helpText:
          'This is an irreversible go-live. The approved week is scheduled to ' +
          'your real audience and cannot be un-published.',
      },
      {
        key: 'batchId',
        label: 'Batch ID',
        required: false,
        helpText:
          'Optional. Approve a specific Autopilot batch by ID. Leave blank to ' +
          'approve the current pending week.',
      },
    ],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439013',
      batch_id: '507f1f77bcf86cd799439013',
      status: 'approved',
      posts_scheduled: 7,
      week_start: '2026-06-01T00:00:00Z',
      approved_at: '2026-05-25T12:10:00Z',
    },

    outputFields: [
      { key: 'batch_id', label: 'Batch ID' },
      { key: 'status', label: 'Status' },
      { key: 'posts_scheduled', label: 'Posts scheduled', type: 'integer' },
      { key: 'week_start', label: 'Week start' },
      { key: 'approved_at', label: 'Approved at' },
    ],
  },
}
