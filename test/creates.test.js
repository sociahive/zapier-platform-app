/* eslint-env jest */
const nock = require('nock')
const zapier = require('zapier-platform-core')

const App = require('../index')

const appTester = zapier.createAppTester(App)
const API = 'https://www.sociahive.com/api/v1'
const authData = { api_key: 'sk_test_123' }
const accounts = {
  data: [
    { id: 'acc1', platform: 'instagram', platform_user_id: 'ig1', username: 'brand', status: 'connected' },
    { id: 'acc2', platform: 'linkedin', platform_user_id: 'li1', name: 'Brand Inc', status: 'connected' },
  ],
}

afterEach(() => nock.cleanAll())

describe('Create Post', () => {
  it('publishes now with the platform taken from the account', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    const scope = nock(API)
      .post('/posts', {
        content: { text: 'Hello', media: [{ type: 'image', url: 'https://cdn.example.com/a.jpg' }, { type: 'video', url: 'https://cdn.example.com/b.mp4' }] },
        platforms: [{ platform: 'instagram', account_id: 'acc1' }],
        schedule_type: 'immediate',
        timezone: 'UTC',
      })
      .reply(201, { data: { id: 'p1', status: 'publishing', content: { text: 'Hello' }, created_at: '2026-10-01T00:00:00.000Z' } })

    const result = await appTester(App.creates.createPost.operation.perform, {
      authData,
      inputData: {
        account_id: 'acc1',
        text: 'Hello',
        media_urls: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.mp4'],
        media_type: 'auto',
        when: 'now',
      },
    })
    expect(result).toMatchObject({ id: 'p1', status: 'publishing', platform: 'instagram', account_id: 'acc1' })
    scope.done()
  })

  it('schedules with a UTC time', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    const scope = nock(API)
      .post('/posts', {
        content: { text: 'Later' },
        platforms: [{ platform: 'linkedin', account_id: 'acc2' }],
        schedule_type: 'scheduled',
        timezone: 'Europe/London',
        scheduled_at: '2026-12-01T09:00:00.000Z',
      })
      .reply(201, { data: { id: 'p2', status: 'scheduled', scheduled_at: '2026-12-01T09:00:00.000Z' } })

    const result = await appTester(App.creates.createPost.operation.perform, {
      authData,
      inputData: {
        account_id: 'acc2',
        text: 'Later',
        when: 'schedule',
        scheduled_at: '2026-12-01T10:00:00+01:00',
        timezone: 'Europe/London',
      },
    })
    expect(result.status).toBe('scheduled')
    scope.done()
  })

  it('saves a draft as a scheduled post with no time', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    const scope = nock(API)
      .post('/posts', (body) => body.schedule_type === 'scheduled' && !('scheduled_at' in body))
      .reply(201, { data: { id: 'p3', status: 'draft' } })
    const result = await appTester(App.creates.createPost.operation.perform, {
      authData,
      inputData: { account_id: 'acc1', text: 'Draft', when: 'draft' },
    })
    expect(result.status).toBe('draft')
    scope.done()
  })

  it('refuses to schedule without a time', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    await expect(
      appTester(App.creates.createPost.operation.perform, {
        authData,
        inputData: { account_id: 'acc1', text: 'x', when: 'schedule' },
      }),
    ).rejects.toThrow('Publish At')
  })

  it('shows the API error and the target that did not fit', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    nock(API)
      .post('/posts')
      .reply(400, { error: 'Text is too long', targets: [{ platform: 'instagram', account_id: 'acc1', message: 'Over 2,200 characters' }] })
    await expect(
      appTester(App.creates.createPost.operation.perform, {
        authData,
        inputData: { account_id: 'acc1', text: 'x', when: 'now' },
      }),
    ).rejects.toThrow('Text is too long (instagram: Over 2,200 characters)')
  })

  it('explains a plan without API access', async () => {
    nock(API).get('/connected-accounts').reply(403, { error: 'API and MCP access is part of the trial and every paid plan.', code: 'upgrade_required' })
    await expect(
      appTester(App.creates.createPost.operation.perform, {
        authData,
        inputData: { account_id: 'acc1', text: 'x', when: 'now' },
      }),
    ).rejects.toThrow('API access needs the SociaHive trial or a paid plan. See https://www.sociahive.com/pricing')
  })

  it('points to the key scopes on any other 403', async () => {
    nock(API).get('/connected-accounts').reply(403, { error: 'Insufficient scope' })
    await expect(
      appTester(App.creates.createPost.operation.perform, {
        authData,
        inputData: { account_id: 'acc1', text: 'x', when: 'now' },
      }),
    ).rejects.toThrow('missing a scope')
  })
})

describe('Upload Media From URL', () => {
  it('returns the stored file', async () => {
    nock(API)
      .post('/uploads/from-url', { url: 'https://example.com/a.png' })
      .reply(200, { url: 'https://media.sociahive.com/uploads/u/1.png', key: 'uploads/u/1.png', size_bytes: 10, mime_type: 'image/png' })
    const result = await appTester(App.creates.uploadMedia.operation.perform, {
      authData,
      inputData: { url: 'https://example.com/a.png' },
    })
    expect(result).toEqual({
      id: 'uploads/u/1.png',
      url: 'https://media.sociahive.com/uploads/u/1.png',
      key: 'uploads/u/1.png',
      size_bytes: 10,
      mime_type: 'image/png',
    })
  })
})

describe('Turn automations on and off', () => {
  it('publishes to turn on and sets draft to turn off', async () => {
    nock(API).put('/flows/f1', { status: 'published' }).reply(200, { flow: { _id: 'f1', name: 'Price reply', status: 'published' } })
    const on = await appTester(App.creates.activateFlow.operation.perform, {
      authData,
      inputData: { account_id: 'acc1', flow_id: 'f1' },
    })
    expect(on).toEqual({ id: 'f1', name: 'Price reply', status: 'published' })

    nock(API).put('/flows/f1', { status: 'draft' }).reply(200, { flow: { _id: 'f1', name: 'Price reply', status: 'draft' } })
    const off = await appTester(App.creates.deactivateFlow.operation.perform, {
      authData,
      inputData: { account_id: 'acc1', flow_id: 'f1' },
    })
    expect(off.status).toBe('draft')
  })
})

describe('Find Account', () => {
  it('matches the handle with or without @, then the name', async () => {
    nock(API).get('/connected-accounts').reply(200, accounts)
    const byHandle = await appTester(App.searches.findAccount.operation.perform, {
      authData,
      inputData: { username: '@Brand' },
    })
    expect(byHandle.map((a) => a.id)).toEqual(['acc1'])

    nock(API).get('/connected-accounts').query({ platform: 'linkedin' }).reply(200, { data: [accounts.data[1]] })
    const byName = await appTester(App.searches.findAccount.operation.perform, {
      authData,
      inputData: { username: 'brand inc', platform: 'linkedin' },
    })
    expect(byName.map((a) => a.id)).toEqual(['acc2'])
  })
})
