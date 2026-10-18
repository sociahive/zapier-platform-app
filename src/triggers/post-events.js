/**
 * Instant triggers: a scheduled post was published, or failed to publish.
 *
 * One event per account a post went to. Delivered data:
 *   post.published: { postId, platform, accountId, platformPostId }
 *   post.failed:    { postId, platform, accountId, error }
 */

const { API_BASE } = require('../lib/api')
const { makeHookTrigger } = require('../lib/hook-trigger')

const normalizePublished = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    post_id: data.postId,
    platform: data.platform,
    account_id: data.accountId,
    platform_post_id: data.platformPostId || null,
  }
}

const normalizeFailed = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    post_id: data.postId,
    platform: data.platform,
    account_id: data.accountId,
    error: data.error || null,
  }
}

/** Recent posts as event-shaped records, one per matching target. */
const recentTargets = async (z, bundle, status, toRecord) => {
  const response = await z.request({
    url: `${API_BASE}/posts`,
    params: { status, limit: 25 },
  })
  const posts = (response.data && response.data.data) || []
  const accountId = bundle.inputData.account_id
  const records = []
  for (const post of posts) {
    for (const target of post.platforms || []) {
      if (target.status !== (status === 'published' ? 'published' : 'failed')) continue
      if (accountId && target.account_id !== accountId) continue
      records.push(toRecord(post, target))
    }
  }
  return records
}

const newPublishedPost = makeHookTrigger({
  key: 'newPublishedPost',
  noun: 'Post',
  label: 'Post Published',
  description: 'Triggers when a scheduled post is published to one of your accounts.',
  event: 'post.published',
  normalize: normalizePublished,
  performList: (z, bundle) =>
    recentTargets(z, bundle, 'published', (post, target) => ({
      id: `${post.id}:${target.account_id}`,
      event: 'post.published',
      occurred_at: target.published_at || post.updated_at,
      post_id: post.id,
      platform: target.platform,
      account_id: target.account_id,
      platform_post_id: target.platform_post_id || null,
    })),
  sample: {
    id: 'evt_7c1d1c6e5b9f4f6a',
    event: 'post.published',
    occurred_at: '2026-10-01T09:00:42.000Z',
    post_id: '66f1c0a8e4b0a1b2c3d4e5f6',
    platform: 'instagram',
    account_id: '66f1c0a8e4b0a1b2c3d4e5f7',
    platform_post_id: '17912345678901234',
  },
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Published At', type: 'datetime' },
    { key: 'post_id', label: 'Post ID' },
    { key: 'platform', label: 'Platform' },
    { key: 'account_id', label: 'Account ID' },
    { key: 'platform_post_id', label: 'Platform Post ID' },
  ],
})

const postFailed = makeHookTrigger({
  key: 'postFailed',
  noun: 'Post',
  label: 'Post Failed',
  description: 'Triggers when a scheduled post fails to publish to one of your accounts.',
  event: 'post.failed',
  normalize: normalizeFailed,
  performList: (z, bundle) =>
    recentTargets(z, bundle, 'failed', (post, target) => ({
      id: `${post.id}:${target.account_id}`,
      event: 'post.failed',
      occurred_at: post.updated_at,
      post_id: post.id,
      platform: target.platform,
      account_id: target.account_id,
      error: (target.error && target.error.message) || null,
    })),
  sample: {
    id: 'evt_2a9e0d4c7b1f4e3a',
    event: 'post.failed',
    occurred_at: '2026-10-01T09:00:42.000Z',
    post_id: '66f1c0a8e4b0a1b2c3d4e5f6',
    platform: 'instagram',
    account_id: '66f1c0a8e4b0a1b2c3d4e5f7',
    error: 'The image could not be downloaded.',
  },
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Failed At', type: 'datetime' },
    { key: 'post_id', label: 'Post ID' },
    { key: 'platform', label: 'Platform' },
    { key: 'account_id', label: 'Account ID' },
    { key: 'error', label: 'Error' },
  ],
})

module.exports = { newPublishedPost, postFailed, normalizePublished, normalizeFailed }
