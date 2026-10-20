/**
 * Instant triggers on scheduler features: client review links and plugs.
 *
 * Delivered data (server):
 *   post.review_decision: { postId, reviewLinkId, kind, reviewerName, comment? }
 *     kind: approved | changes_requested | comment
 *   post.plug_fired:      { plug_id, post_id, account_id, platform, metric, threshold, value, action }
 *     metric: likes | comments | reposts | views; action: repost | comment
 *
 * Review links need Studio or above and plugs Creator or above: on another
 * plan, turning the Zap on fails with "<event> is not included in your plan."
 * The API has no list of past decisions or plug runs, so performList returns
 * the sample record.
 */

const { makeHookTrigger } = require('../lib/hook-trigger')

const reviewKindField = {
  key: 'kind',
  label: 'Decision',
  helpText: 'Optional. Only trigger for this kind of decision. Leave empty for all.',
  required: false,
  choices: { approved: 'Approved', changes_requested: 'Changes requested', comment: 'Comment' },
}

const matchesKind = (record, bundle) => !bundle.inputData.kind || record.kind === bundle.inputData.kind

const normalizeReviewDecision = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    post_id: data.postId,
    review_link_id: data.reviewLinkId || null,
    kind: data.kind,
    reviewer_name: data.reviewerName || null,
    comment: data.comment || null,
  }
}

const normalizePlugFired = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    plug_id: data.plug_id,
    post_id: data.post_id,
    account_id: data.account_id || null,
    platform: data.platform || null,
    metric: data.metric || null,
    threshold: typeof data.threshold === 'number' ? data.threshold : null,
    value: typeof data.value === 'number' ? data.value : null,
    action: data.action || null,
  }
}

const reviewSample = {
  id: 'evt_4e7b1a9c2d6f4b8e',
  event: 'post.review_decision',
  occurred_at: '2026-11-02T14:05:10.000Z',
  post_id: '66f1c0a8e4b0a1b2c3d4e5f6',
  review_link_id: '66f1c0a8e4b0a1b2c3d4e5f9',
  kind: 'changes_requested',
  reviewer_name: 'Maya',
  comment: 'Can we use the second photo first?',
}

const plugSample = {
  id: 'evt_8a2c5e1f7b3d4a9c',
  event: 'post.plug_fired',
  occurred_at: '2026-11-02T16:20:00.000Z',
  plug_id: '66f1c0a8e4b0a1b2c3d4e5fa',
  post_id: '66f1c0a8e4b0a1b2c3d4e5f6',
  account_id: '66f1c0a8e4b0a1b2c3d4e5f7',
  platform: 'instagram',
  metric: 'likes',
  threshold: 100,
  value: 104,
  action: 'comment',
}

const postReviewDecision = makeHookTrigger({
  key: 'postReviewDecision',
  noun: 'Review Decision',
  label: 'Post Review Decision',
  description:
    'Triggers when a client approves a post, asks for changes or comments on a review link. Needs a Studio plan or above.',
  event: 'post.review_decision',
  accountFilter: false,
  extraInputFields: [reviewKindField],
  accept: matchesKind,
  normalize: normalizeReviewDecision,
  performList: async () => [reviewSample],
  sample: reviewSample,
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Decided At', type: 'datetime' },
    { key: 'post_id', label: 'Post ID' },
    { key: 'review_link_id', label: 'Review Link ID' },
    { key: 'kind', label: 'Decision' },
    { key: 'reviewer_name', label: 'Reviewer Name' },
    { key: 'comment', label: 'Comment' },
  ],
})

const plugFired = makeHookTrigger({
  key: 'plugFired',
  noun: 'Plug',
  label: 'Plug Fired',
  description:
    'Triggers when a plug on a post reaches its threshold and reposts or comments. Needs a Creator plan or above.',
  event: 'post.plug_fired',
  normalize: normalizePlugFired,
  performList: async () => [plugSample],
  sample: plugSample,
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Fired At', type: 'datetime' },
    { key: 'plug_id', label: 'Plug ID' },
    { key: 'post_id', label: 'Post ID' },
    { key: 'account_id', label: 'Account ID' },
    { key: 'platform', label: 'Platform' },
    { key: 'metric', label: 'Metric' },
    { key: 'threshold', label: 'Threshold', type: 'integer' },
    { key: 'value', label: 'Value Reached', type: 'integer' },
    { key: 'action', label: 'Action' },
  ],
})

module.exports = { postReviewDecision, plugFired, normalizeReviewDecision, normalizePlugFired }
