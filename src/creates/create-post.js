/**
 * Action: Create a post on one connected account.
 *
 * Sends POST /api/v1/posts:
 *   { content: { text, media? }, platforms: [{ platform, account_id }],
 *     schedule_type, scheduled_at?, timezone }
 * The platform comes from the chosen account. "Save as draft" sends
 * schedule_type "scheduled" with no time, which the API stores as a draft.
 */

const { API_BASE, findAccount } = require('../lib/api')

const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm)(\?|#|$)/i

const mediaItems = (urls, mediaType) =>
  (urls || [])
    .map((u) => String(u).trim())
    .filter(Boolean)
    .map((url) => ({
      type: mediaType === 'video' || (mediaType !== 'image' && VIDEO_EXTENSIONS.test(url)) ? 'video' : 'image',
      url,
    }))

const toUtcIso = (z, value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new z.errors.Error(`"${value}" is not a date and time.`, 'InvalidDate', 400)
  }
  return date.toISOString()
}

const perform = async (z, bundle) => {
  const input = bundle.inputData
  const account = await findAccount(z, input.account_id)
  const mode = input.when || 'now'

  const body = {
    content: { text: input.text || '' },
    platforms: [{ platform: account.platform, account_id: account.id }],
    schedule_type: mode === 'now' ? 'immediate' : 'scheduled',
    timezone: input.timezone || 'UTC',
  }

  const media = mediaItems(input.media_urls, input.media_type)
  if (media.length > 0) body.content.media = media

  if (mode === 'schedule') {
    if (!input.scheduled_at) {
      throw new z.errors.Error('Set "Publish At" to schedule the post.', 'MissingScheduledAt', 400)
    }
    body.scheduled_at = toUtcIso(z, input.scheduled_at)
  }

  const response = await z.request({ url: `${API_BASE}/posts`, method: 'POST', body })
  const post = (response.data && response.data.data) || {}
  return {
    id: post.id,
    status: post.status,
    text: post.content ? post.content.text : body.content.text,
    platform: account.platform,
    account_id: account.id,
    scheduled_at: post.scheduled_at || null,
    created_at: post.created_at || null,
  }
}

module.exports = {
  key: 'createPost',
  noun: 'Post',

  display: {
    label: 'Create Post',
    description: 'Publishes, schedules, or saves a draft post on one of your connected accounts.',
  },

  operation: {
    inputFields: [
      {
        key: 'account_id',
        label: 'Account',
        required: true,
        dynamic: 'accountList.id.label',
        helpText: 'The connected account to post to. The platform comes from the account.',
      },
      {
        key: 'text',
        label: 'Text',
        required: true,
        type: 'text',
        helpText: 'The caption or post text. Each platform has its own length limit (X 280, Instagram 2,200).',
      },
      {
        key: 'media_urls',
        label: 'Media URLs',
        required: false,
        list: true,
        helpText:
          'Optional. Public links to images or videos (JPEG, PNG, WebP, MP4, MOV). Use "Upload Media From URL" first if the link may expire. Instagram needs at least one image or video.',
      },
      {
        key: 'media_type',
        label: 'Media Type',
        required: false,
        choices: { auto: 'Detect from the link', image: 'Image', video: 'Video' },
        default: 'auto',
      },
      {
        key: 'when',
        label: 'When',
        required: true,
        choices: { now: 'Publish now', schedule: 'Schedule', draft: 'Save as draft' },
        default: 'now',
      },
      {
        key: 'scheduled_at',
        label: 'Publish At',
        required: false,
        type: 'datetime',
        helpText: 'Required when "When" is "Schedule". Must be in the future.',
      },
      {
        key: 'timezone',
        label: 'Time Zone',
        required: false,
        default: 'UTC',
        helpText: 'IANA time zone stored with the post, for example "Europe/London".',
      },
    ],

    perform,

    sample: {
      id: '66f1c0a8e4b0a1b2c3d4e5f6',
      status: 'scheduled',
      text: 'New drop on Friday.',
      platform: 'instagram',
      account_id: '66f1c0a8e4b0a1b2c3d4e5f7',
      scheduled_at: '2026-10-03T09:00:00.000Z',
      created_at: '2026-10-01T12:00:00.000Z',
    },

    outputFields: [
      { key: 'id', label: 'Post ID' },
      { key: 'status', label: 'Status' },
      { key: 'text', label: 'Text' },
      { key: 'platform', label: 'Platform' },
      { key: 'account_id', label: 'Account ID' },
      { key: 'scheduled_at', label: 'Scheduled At', type: 'datetime' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
    ],
  },
}
