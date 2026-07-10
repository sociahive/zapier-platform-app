/**
 * Action: Turn on Autopilot — IRREVERSIBLE go-live.
 *
 * Enables the weekly Autopilot cadence for the account. In `autopublish` review
 * mode, future weeks can ship to a real audience without per-week approval, so
 * this is an irreversible go-live toggle. We surface a required `confirm`
 * checkbox and pass it through; the API also fails closed with 400
 * `confirmation_required` when confirm is not true.
 */

const perform = async (z, bundle) => {
  if (bundle.inputData.confirm !== true) {
    throw new z.errors.Error(
      'Check "I understand Autopilot will publish to my real audience" to turn it on.',
      'confirmation_required',
      400,
    )
  }

  const body = { confirm: true }
  if (bundle.inputData.postsPerWeek != null && bundle.inputData.postsPerWeek !== '') {
    body.postsPerWeek = Number(bundle.inputData.postsPerWeek)
  }
  if (bundle.inputData.reviewMode) {
    body.reviewMode = bundle.inputData.reviewMode
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/autopilot/turn-on',
    method: 'POST',
    body,
  })

  return response.data
}

module.exports = {
  key: 'turnOnAutopilot',
  noun: 'Autopilot',

  display: {
    label: 'Turn on Autopilot',
    description:
      'Enable the weekly Autopilot cadence for the account. IRREVERSIBLE ' +
      'go-live — in autopublish mode, weeks ship to your real audience.',
  },

  operation: {
    inputFields: [
      {
        key: 'confirm',
        label: 'I understand Autopilot will publish to my real audience',
        required: true,
        type: 'boolean',
        helpText:
          'This is an irreversible go-live. In autopublish mode, Autopilot ' +
          'schedules and publishes weeks to your real audience.',
      },
      {
        key: 'postsPerWeek',
        label: 'Posts per week',
        required: false,
        type: 'integer',
        helpText:
          'Optional. Override the number of posts Autopilot plans per week. ' +
          'Leave blank to use your plan\'s included quota.',
      },
      {
        key: 'reviewMode',
        label: 'Review mode',
        required: false,
        choices: {
          approve: 'Approve — review each week before it goes live',
          autopublish: 'Autopublish — ship each week automatically',
        },
        default: 'approve',
        helpText:
          'Optional. "Approve" holds each week for your review; "Autopublish" ' +
          'ships each week to your real audience on a 24h edit window.',
      },
    ],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439014',
      status: 'active',
      posts_per_week: 7,
      review_mode: 'approve',
      updated_at: '2026-05-25T12:00:00Z',
    },

    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'posts_per_week', label: 'Posts per week', type: 'integer' },
      { key: 'review_mode', label: 'Review mode' },
      { key: 'updated_at', label: 'Updated at' },
    ],
  },
}
