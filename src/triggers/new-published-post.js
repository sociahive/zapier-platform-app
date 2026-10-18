/**
 * Trigger: a SociaHive post was published.
 *
 * Polling: Zapier calls this every few minutes and dedupes by post id. The
 * posts endpoint has no platform filter, so the optional platform choice is
 * applied here to the latest 50 published posts.
 */

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/posts',
    params: { status: 'published', limit: 50 },
  })

  const posts = response.data?.data ?? []
  const platform = bundle.inputData.platform
  const matching = platform
    ? posts.filter((p) => (p.platforms ?? []).some((t) => t.platform === platform))
    : posts
  // Zapier dedupes by `id`. Every record must have one.
  return matching.map((p) => ({ ...p, id: p.id ?? p._id }))
}

module.exports = {
  key: 'newPublishedPost',
  noun: 'Post',

  display: {
    label: 'New Published Post',
    description: 'Triggers when SociaHive publishes a post.',
  },

  operation: {
    inputFields: [
      {
        key: 'platform',
        label: 'Platform',
        helpText: 'Optional. Only posts that went to this platform.',
        choices: {
          instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
          twitter: 'Twitter / X', tiktok: 'TikTok', threads: 'Threads',
          youtube: 'YouTube', bluesky: 'Bluesky', pinterest: 'Pinterest',
        },
        required: false,
      },
    ],

    perform: performList,
    sample: {
      id: '507f1f77bcf86cd799439011',
      text: 'New product launch! 🎉',
      status: 'published',
      platforms: [{ platform: 'instagram', account_id: '507f1f77bcf86cd799439012' }],
      created_at: '2027-03-01T09:00:00Z',
      updated_at: '2027-03-01T09:00:42Z',
    },

    outputFields: [
      { key: 'id', label: 'Post ID' },
      { key: 'text', label: 'Caption' },
      { key: 'status', label: 'Status' },
      { key: 'platforms[]platform', label: 'Platform' },
      { key: 'created_at', label: 'Created at' },
    ],
  },
}
