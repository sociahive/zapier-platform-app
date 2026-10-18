/**
 * Action: create a SociaHive post on one connected account.
 *
 * Two modes:
 *  - schedule_type = "immediate": publishes right away
 *  - schedule_type = "scheduled": needs scheduled_at (timezone defaults to UTC)
 *
 * The account field is a dropdown fed by the hidden `accountList` trigger, so
 * users pick a real account instead of typing an id.
 */

const perform = async (z, bundle) => {
  const account = bundle.inputData.account_id
  if (!account) throw new Error('Pick a connected account.')

  // Dropdown values look like "instagram:507f...": split out platform and id.
  const [platform, accountId] = String(account).includes(':')
    ? String(account).split(':')
    : [bundle.inputData.platform, account]

  const content = { text: bundle.inputData.text }
  if (bundle.inputData.image_url) {
    content.media = [{ type: 'image', url: bundle.inputData.image_url }]
  }

  const body = {
    content,
    platforms: [{ platform, account_id: accountId }],
    schedule_type: bundle.inputData.schedule_type || 'immediate',
    timezone: bundle.inputData.timezone || 'UTC',
  }

  if (body.schedule_type === 'scheduled') {
    if (!bundle.inputData.scheduled_at) {
      throw new Error('scheduled_at is required when schedule_type is "scheduled"')
    }
    body.scheduled_at = bundle.inputData.scheduled_at
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/posts',
    method: 'POST',
    body,
  })

  return response.data?.data ?? response.data
}

module.exports = {
  key: 'createPost',
  noun: 'Post',

  display: {
    label: 'Create Post',
    description: 'Publishes a post now or schedules it on a connected account.',
  },

  operation: {
    inputFields: [
      {
        key: 'account_id',
        label: 'Account',
        required: true,
        dynamic: 'accountList.id.name',
      },
      {
        key: 'text',
        label: 'Caption or text',
        required: true,
        type: 'text',
      },
      {
        key: 'image_url',
        label: 'Image URL',
        required: false,
        helpText:
          'Optional. A public https link to one image. The platform fetches it when the post publishes, ' +
          'so the link has to stay reachable. Each platform sets its own file limits (Instagram takes JPEG images).',
      },
      {
        key: 'schedule_type',
        label: 'Schedule',
        required: false,
        choices: { immediate: 'Publish now', scheduled: 'Schedule for later' },
        default: 'immediate',
      },
      {
        key: 'scheduled_at',
        label: 'Scheduled at',
        required: false,
        type: 'datetime',
        helpText: 'Required when Schedule is "Schedule for later".',
      },
      {
        key: 'timezone',
        label: 'Timezone',
        required: false,
        default: 'UTC',
        helpText: 'An IANA timezone such as Europe/London. Defaults to UTC.',
      },
    ],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439011',
      content: { text: 'Hello from Zapier!' },
      status: 'scheduled',
      platforms: [{ platform: 'instagram', account_id: '507f1f77bcf86cd799439012' }],
      scheduled_at: '2027-03-01T09:00:00Z',
      created_at: '2027-02-25T12:00:00Z',
    },
  },
}
