/**
 * Trigger: a SociaHive post was just published.
 *
 * Polling-based: Zapier hits this endpoint every few minutes and dedupes by
 * post id. We sort newest-first server-side so Zapier sees the latest first.
 *
 * Webhook variant (preferred long-term) requires us to expose subscribe/
 * unsubscribe endpoints — tracked in distribution-plan.md Phase 4.
 */

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/posts',
    params: {
      status: 'published',
      limit: 50,
      ...(bundle.inputData.platform && { platform: bundle.inputData.platform }),
    },
  })

  const posts = response.data?.data ?? []
  // Zapier dedupes by `id`. Every record must have one.
  return posts.map((p) => ({
    ...p,
    id: p.id,
  }))
}

module.exports = {
  key: 'newPublishedPost',
  noun: 'Post',

  display: {
    label: 'New Published Post',
    description: 'Triggers when SociaHive finishes publishing a post.',
  },

  operation: {
    inputFields: [
      {
        key: 'platform',
        label: 'Platform',
        helpText: 'Optional — filter to one platform.',
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
      created_at: '2026-06-01T09:00:00Z',
      updated_at: '2026-06-01T09:00:42Z',
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
