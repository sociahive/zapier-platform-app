/* eslint-env jest */
const nock = require('nock')
const zapier = require('zapier-platform-core')

const App = require('../index')

const appTester = zapier.createAppTester(App)
const API = 'https://www.sociahive.com/api/v1'
const authData = { api_key: 'sk_test_123' }

afterEach(() => nock.cleanAll())

describe('app definition', () => {
  it('passes the Zapier schema', () => {
    const schema = require('zapier-platform-schema')
    const results = schema.validateAppDefinition(App)
    // Functions are serialized by the CLI at build time; `zapier validate`
    // checks the built app. Everything else must already match the schema.
    const errors = results.errors.filter((e) => typeof e.instance !== 'function')
    expect(errors.map((e) => e.stack)).toEqual([])
  })

  it('makes every event trigger a REST hook with a performList', () => {
    for (const key of ['newPublishedPost', 'postFailed', 'flowTriggered', 'flowError']) {
      const op = App.triggers[key].operation
      expect(op.type).toBe('hook')
      expect(typeof op.performSubscribe).toBe('function')
      expect(typeof op.performUnsubscribe).toBe('function')
      expect(typeof op.performList).toBe('function')
    }
  })
})

describe('subscribe and unsubscribe', () => {
  it('creates a zapier webhook for the event and keeps only its id', async () => {
    const scope = nock(API, { reqheaders: { 'X-API-Key': 'sk_test_123' } })
      .post('/webhooks', {
        target_url: 'https://hooks.zapier.com/hooks/standard/1/abc',
        events: ['post.published'],
        integration_type: 'zapier',
        account_ids: ['acc1'],
      })
      .reply(201, { data: { id: 'wh1', signing_secret: 'whsec_secret' } })

    const result = await appTester(App.triggers.newPublishedPost.operation.performSubscribe, {
      authData,
      targetUrl: 'https://hooks.zapier.com/hooks/standard/1/abc',
      inputData: { account_id: 'acc1' },
    })
    expect(result).toEqual({ id: 'wh1' })
    scope.done()
  })

  it('subscribes Automation Started to flow.triggered with no account filter', async () => {
    const scope = nock(API)
      .post('/webhooks', (body) => body.events[0] === 'flow.triggered' && !('account_ids' in body))
      .reply(201, { data: { id: 'wh2' } })
    const result = await appTester(App.triggers.flowTriggered.operation.performSubscribe, {
      authData,
      targetUrl: 'https://hooks.zapier.com/x',
      inputData: {},
    })
    expect(result.id).toBe('wh2')
    scope.done()
  })

  it('deletes the webhook on unsubscribe, and accepts one that is already gone', async () => {
    nock(API).delete('/webhooks/wh1').reply(200, { data: { id: 'wh1', deleted: true } })
    const deleted = await appTester(App.triggers.flowError.operation.performUnsubscribe, {
      authData,
      subscribeData: { id: 'wh1' },
    })
    expect(deleted).toEqual({ id: 'wh1', deleted: true })

    nock(API).delete('/webhooks/wh9').reply(404, { error: 'Webhook not found' })
    const gone = await appTester(App.triggers.flowError.operation.performUnsubscribe, {
      authData,
      subscribeData: { id: 'wh9' },
    })
    expect(gone).toEqual({})
  })
})

describe('perform (delivered events)', () => {
  it('flattens a post.published delivery', async () => {
    const records = await appTester(App.triggers.newPublishedPost.operation.perform, {
      authData,
      inputData: {},
      cleanedRequest: {
        id: 'evt_1',
        event: 'post.published',
        timestamp: '2026-10-01T09:00:00.000Z',
        data: { postId: 'p1', platform: 'instagram', accountId: 'acc1', platformPostId: '179' },
      },
    })
    expect(records).toEqual([
      {
        id: 'evt_1',
        event: 'post.published',
        occurred_at: '2026-10-01T09:00:00.000Z',
        post_id: 'p1',
        platform: 'instagram',
        account_id: 'acc1',
        platform_post_id: '179',
      },
    ])
  })

  it('ignores a delivery for another event', async () => {
    const records = await appTester(App.triggers.postFailed.operation.perform, {
      authData,
      inputData: {},
      cleanedRequest: { id: 'evt_2', event: 'post.published', data: {} },
    })
    expect(records).toEqual([])
  })

  it('filters automation deliveries by the chosen automation', async () => {
    const payload = {
      id: 'evt_3',
      event: 'flow.triggered',
      timestamp: '2026-10-01T09:00:00.000Z',
      data: { flowId: 'f1', executionId: 'e1', platform: 'instagram', accountId: 'acc1', senderId: 's1' },
    }
    const match = await appTester(App.triggers.flowTriggered.operation.perform, {
      authData,
      inputData: { flow_id: 'f1' },
      cleanedRequest: payload,
    })
    expect(match[0]).toMatchObject({ id: 'evt_3', flow_id: 'f1', execution_id: 'e1', sender_id: 's1' })

    const other = await appTester(App.triggers.flowTriggered.operation.perform, {
      authData,
      inputData: { flow_id: 'f2' },
      cleanedRequest: payload,
    })
    expect(other).toEqual([])
  })

  it('returns the same keys from performList as from perform', async () => {
    nock(API)
      .get('/posts')
      .query({ status: 'published', limit: 25 })
      .reply(200, {
        data: [
          {
            id: 'p1',
            updated_at: '2026-10-01T09:00:00.000Z',
            platforms: [
              { platform: 'instagram', account_id: 'acc1', status: 'published', platform_post_id: '179', published_at: '2026-10-01T09:00:00.000Z' },
              { platform: 'facebook', account_id: 'acc2', status: 'failed' },
            ],
          },
        ],
      })
    const listed = await appTester(App.triggers.newPublishedPost.operation.performList, { authData, inputData: {} })
    expect(listed).toHaveLength(1)
    expect(Object.keys(listed[0]).sort()).toEqual(Object.keys(App.triggers.newPublishedPost.operation.sample).sort())
  })
})

describe('dropdowns', () => {
  it('lists the automations of the chosen account', async () => {
    nock(API)
      .get('/connected-accounts')
      .reply(200, { data: [{ id: 'acc1', platform: 'instagram', platform_user_id: 'ig1', username: 'brand' }] })
    nock(API)
      .get('/flows')
      .query({ platform_user_id: 'ig1' })
      .reply(200, { flows: [{ _id: 'f1', name: 'Price reply', status: 'published' }] })
    const flows = await appTester(App.triggers.flowList.operation.perform, { authData, inputData: { account_id: 'acc1' } })
    expect(flows).toEqual([{ id: 'f1', label: 'Price reply (on)', name: 'Price reply', status: 'published' }])
  })
})
