/**
 * Tests for the app definition and its operations.
 *
 * The perform functions run against a fake `z.request` so input mapping is
 * checked without hitting the live SociaHive API.
 */

const App = require('../index')

let lastRequest

beforeEach(() => {
  lastRequest = null
})

const fakeZ = (responseData) => ({
  request: async (opts) => {
    lastRequest = opts
    return { status: 200, data: responseData }
  },
})

describe('app definition', () => {
  it('registers the post trigger and the create post action', () => {
    expect(Object.keys(App.triggers)).toEqual(['newPublishedPost'])
    expect(Object.keys(App.creates)).toEqual(['createPost'])
  })

  it('adds the API key header on every request', () => {
    const [inject] = App.beforeRequest
    const request = inject({ headers: {} }, {}, { authData: { api_key: 'sk_test_key' } })
    expect(request.headers['X-API-Key']).toBe('sk_test_key')
  })
})

describe('Create Post', () => {
  const create = App.creates.createPost

  it('publishes now by default', async () => {
    await create.operation.perform(fakeZ({ id: 'p1' }), {
      inputData: { account_id: 'instagram:acc1', text: 'Hello' },
    })
    expect(lastRequest.method).toBe('POST')
    expect(lastRequest.url).toBe('https://www.sociahive.com/api/v1/posts')
    expect(lastRequest.body).toEqual({
      text: 'Hello',
      platforms: [{ platform: 'instagram', account_id: 'acc1' }],
      schedule_type: 'immediate',
    })
  })

  it('requires scheduled_at when scheduling', async () => {
    await expect(
      create.operation.perform(fakeZ({}), {
        inputData: { account_id: 'instagram:acc1', text: 'Hi', schedule_type: 'scheduled' },
      }),
    ).rejects.toThrow('scheduled_at is required')
  })

  it('sends the schedule time, timezone and image', async () => {
    await create.operation.perform(fakeZ({ id: 'p2' }), {
      inputData: {
        account_id: 'instagram:acc1',
        text: 'Later',
        schedule_type: 'scheduled',
        scheduled_at: '2026-06-01T09:00:00Z',
        image_url: 'https://example.com/a.jpg',
      },
    })
    expect(lastRequest.body.scheduled_at).toBe('2026-06-01T09:00:00Z')
    expect(lastRequest.body.timezone).toBe('UTC')
    expect(lastRequest.body.media).toEqual([{ type: 'image', url: 'https://example.com/a.jpg' }])
  })
})

describe('New Published Post', () => {
  const trigger = App.triggers.newPublishedPost

  it('lists published posts, filtered by platform when set', async () => {
    const posts = await trigger.operation.perform(fakeZ({ data: [{ id: 'p1' }] }), {
      inputData: { platform: 'instagram' },
    })
    expect(lastRequest.params).toEqual({ status: 'published', limit: 50, platform: 'instagram' })
    expect(posts).toEqual([{ id: 'p1' }])
  })
})
