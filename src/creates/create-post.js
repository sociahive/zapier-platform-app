/**
 * Action: Create a SociaHive post.
 *
 * Two modes:
 *  - schedule_type = "immediate" → publishes right away
 *  - schedule_type = "scheduled" → requires scheduled_at + timezone
 *
 * The action fetches connected accounts as a dynamic dropdown so users pick
 * from real accounts in the Zap editor instead of typing IDs by hand.
 */

const perform = async (z, bundle) => {
  const account = bundle.inputData.account_id
  if (!account) throw new Error('Pick a connected account.')

  // Account dropdown values look like "instagram:507f..." — split out platform + id.
  const [platform, accountId] = String(account).includes(':')
    ? String(account).split(':')
    : [bundle.inputData.platform, account]

  const body = {
    text: bundle.inputData.text,
    platforms: [{ platform, account_id: accountId }],
    schedule_type: bundle.inputData.schedule_type || 'immediate',
  }

  if (body.schedule_type === 'scheduled') {
    if (!bundle.inputData.scheduled_at) {
      throw new Error('scheduled_at is required when schedule_type is "scheduled"')
    }
    body.scheduled_at = bundle.inputData.scheduled_at
    body.timezone = bundle.inputData.timezone || 'UTC'
  }

  if (bundle.inputData.image_url) {
    body.media = [{ type: 'image', url: bundle.inputData.image_url }]
  }

  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/posts',
    method: 'POST',
    body,
  })

  return response.data
}

module.exports = {
  key: 'createPost',
  noun: 'Post',

  display: {
    label: 'Create Post',
    description: 'Schedule or immediately publish a post to a connected account.',
  },

  operation: {
    inputFields: [
      {
        key: 'account_id',
        label: 'Account',
        required: true,
        dynamic: 'newPublishedPost.id.text',
        altersDynamicFields: true,
      },
      {
        key: 'text',
        label: 'Caption / text',
        required: true,
        type: 'text',
      },
      {
        key: 'image_url',
        label: 'Image URL',
        required: false,
        helpText: 'Optional. JPEG or PNG only; max 8 MB.',
      },
      {
        key: 'schedule_type',
        label: 'Schedule',
        required: false,
        choices: { immediate: 'Publish now', scheduled: 'Schedule for later' },
        default: 'immediate',
        altersDynamicFields: true,
      },
      {
        key: 'scheduled_at',
        label: 'Scheduled at (ISO 8601)',
        required: false,
        type: 'datetime',
        helpText: 'Required when Schedule = "Scheduled for later".',
      },
      {
        key: 'timezone',
        label: 'Timezone',
        required: false,
        default: 'UTC',
      },
    ],

    perform,

    sample: {
      id: '507f1f77bcf86cd799439011',
      text: 'Hello from Zapier!',
      status: 'scheduled',
      platforms: [{ platform: 'instagram', account_id: '507f1f77bcf86cd799439012' }],
      scheduled_at: '2026-06-01T09:00:00Z',
      created_at: '2026-05-25T12:00:00Z',
    },
  },
}
