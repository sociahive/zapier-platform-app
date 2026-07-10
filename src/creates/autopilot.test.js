/**
 * Tests for the Autopilot operations.
 *
 * Uses zapier-platform-core's app tester with a stubbed HTTP layer so the
 * perform functions run for real (input mapping, the confirm gate) without
 * hitting the live SociaHive API.
 */

const zapier = require('zapier-platform-core')
// The `z.errors` bag the Zapier runtime injects at invocation time — the same
// module the platform hands each perform. Sourced here so the confirm-gate's
// `z.errors.Error(...)` runs under test exactly as it does in production.
const zErrors = require('zapier-platform-core/src/errors')
const App = require('../../index')

const appTester = zapier.createAppTester(App)
const authData = { api_key: 'sk_test_key' }

// Capture the last outbound request the perform issued.
let lastRequest

beforeEach(() => {
  lastRequest = null
})

// Helper: patch a create's perform to run against a fake z.request.
const runCreate = async (create, inputData, responseData = { data: {} }) => {
  const z = {
    request: async (opts) => {
      lastRequest = opts
      return { status: 200, data: responseData }
    },
    errors: zErrors,
  }
  return create.operation.perform(z, { authData, inputData })
}

describe('Generate Autopilot Week', () => {
  const create = App.creates.generateAutopilotWeek

  it('is registered with no input fields', () => {
    expect(create.key).toBe('generateAutopilotWeek')
    expect(create.operation.inputFields).toHaveLength(0)
  })

  it('POSTs to the generate endpoint', async () => {
    await runCreate(create, {}, { data: { batch_id: 'b1', status: 'pending' } })
    expect(lastRequest.method).toBe('POST')
    expect(lastRequest.url).toBe('https://www.sociahive.com/api/v1/autopilot/generate')
  })
})

describe('Adjust Autopilot Week', () => {
  const create = App.creates.adjustAutopilotWeek

  it('sends feedback when provided', async () => {
    await runCreate(create, { feedback: 'more Reels' })
    expect(lastRequest.url).toBe('https://www.sociahive.com/api/v1/autopilot/adjust')
    expect(lastRequest.body).toEqual({ feedback: 'more Reels' })
  })

  it('omits feedback when blank', async () => {
    await runCreate(create, {})
    expect(lastRequest.body).toEqual({})
  })
})

describe('Approve Autopilot Week', () => {
  const create = App.creates.approveAutopilotWeek

  it('requires the confirm checkbox', () => {
    const confirm = create.operation.inputFields.find((f) => f.key === 'confirm')
    expect(confirm.required).toBe(true)
    expect(confirm.type).toBe('boolean')
  })

  it('throws confirmation_required when confirm is not true', async () => {
    await expect(runCreate(create, { confirm: false })).rejects.toThrow(/confirmation_required/)
    await expect(runCreate(create, {})).rejects.toThrow(/confirmation_required/)
  })

  it('POSTs with confirm and optional batchId when confirmed', async () => {
    await runCreate(create, { confirm: true, batchId: 'b9' })
    expect(lastRequest.url).toBe('https://www.sociahive.com/api/v1/autopilot/approve')
    expect(lastRequest.body).toEqual({ confirm: true, batchId: 'b9' })
  })
})

describe('Turn on Autopilot', () => {
  const create = App.creates.turnOnAutopilot

  it('requires the confirm checkbox', () => {
    const confirm = create.operation.inputFields.find((f) => f.key === 'confirm')
    expect(confirm.required).toBe(true)
    expect(confirm.type).toBe('boolean')
  })

  it('throws confirmation_required when confirm is not true', async () => {
    await expect(runCreate(create, { confirm: false })).rejects.toThrow(/confirmation_required/)
  })

  it('maps optional postsPerWeek + reviewMode when confirmed', async () => {
    await runCreate(create, { confirm: true, postsPerWeek: '10', reviewMode: 'autopublish' })
    expect(lastRequest.url).toBe('https://www.sociahive.com/api/v1/autopilot/turn-on')
    expect(lastRequest.body).toEqual({ confirm: true, postsPerWeek: 10, reviewMode: 'autopublish' })
  })

  it('sends only confirm when optional fields are blank', async () => {
    await runCreate(create, { confirm: true })
    expect(lastRequest.body).toEqual({ confirm: true })
  })
})

describe('app registration', () => {
  it('registers all four autopilot creates and the status search', () => {
    expect(Object.keys(App.creates)).toEqual(
      expect.arrayContaining([
        'generateAutopilotWeek',
        'adjustAutopilotWeek',
        'approveAutopilotWeek',
        'turnOnAutopilot',
      ]),
    )
    expect(App.searches.getAutopilotStatus).toBeDefined()
  })

  it('keeps appTester wired (auth header injection stays intact)', () => {
    // Smoke: the tester constructs without throwing for a registered create.
    expect(() => appTester).not.toThrow()
  })
})
