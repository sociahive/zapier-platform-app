/**
 * Instant triggers on automations (flows).
 *
 * Delivered data:
 *   flow.triggered: { flowId, executionId, platform, accountId, senderId }
 *   flow.error:     { flowId, executionId?, flowName, errorMessage, errorNodeId }
 *
 * The API has no list of past runs or errors, so performList returns the
 * sample record.
 */

const { makeHookTrigger } = require('../lib/hook-trigger')

const flowFilterField = {
  key: 'flow_id',
  label: 'Automation',
  helpText: 'Optional. Only trigger for this automation. Pick an account first.',
  required: false,
  dynamic: 'flowList.id.label',
}

const matchesFlow = (record, bundle) => !bundle.inputData.flow_id || record.flow_id === bundle.inputData.flow_id

const normalizeTriggered = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    flow_id: data.flowId,
    execution_id: data.executionId || null,
    platform: data.platform || null,
    account_id: data.accountId || null,
    sender_id: data.senderId || null,
  }
}

const normalizeError = (payload) => {
  const data = payload.data || {}
  return {
    id: payload.id,
    event: payload.event,
    occurred_at: payload.timestamp,
    flow_id: data.flowId,
    flow_name: data.flowName || null,
    execution_id: data.executionId || null,
    error_message: data.errorMessage || null,
    error_node_id: data.errorNodeId || null,
  }
}

const triggeredSample = {
  id: 'evt_5b8c2f1d9e7a4c6b',
  event: 'flow.triggered',
  occurred_at: '2026-10-01T09:00:42.000Z',
  flow_id: '66f1c0a8e4b0a1b2c3d4e5f8',
  execution_id: 'exec_66f1c0a8e4b0a1b2',
  platform: 'instagram',
  account_id: '66f1c0a8e4b0a1b2c3d4e5f7',
  sender_id: '1784140000000000',
}

const errorSample = {
  id: 'evt_9d3e6a2b1c8f4d7e',
  event: 'flow.error',
  occurred_at: '2026-10-01T09:00:42.000Z',
  flow_id: '66f1c0a8e4b0a1b2c3d4e5f8',
  flow_name: 'Price reply',
  execution_id: 'exec_66f1c0a8e4b0a1b2',
  error_message: 'The account needs to be reconnected.',
  error_node_id: 'node_2',
}

const flowTriggered = makeHookTrigger({
  key: 'flowTriggered',
  noun: 'Automation Run',
  label: 'Automation Started',
  description: 'Triggers when one of your automations starts for someone (for example, a keyword comment or DM).',
  event: 'flow.triggered',
  extraInputFields: [flowFilterField],
  accept: matchesFlow,
  normalize: normalizeTriggered,
  performList: async () => [triggeredSample],
  sample: triggeredSample,
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Started At', type: 'datetime' },
    { key: 'flow_id', label: 'Automation ID' },
    { key: 'execution_id', label: 'Run ID' },
    { key: 'platform', label: 'Platform' },
    { key: 'account_id', label: 'Account ID' },
    { key: 'sender_id', label: 'Sender ID (platform user ID)' },
  ],
})

const flowError = makeHookTrigger({
  key: 'flowError',
  noun: 'Automation Error',
  label: 'Automation Error',
  description: 'Triggers when one of your automations hits an error.',
  event: 'flow.error',
  extraInputFields: [flowFilterField],
  accept: matchesFlow,
  normalize: normalizeError,
  performList: async () => [errorSample],
  sample: errorSample,
  outputFields: [
    { key: 'id', label: 'Event ID' },
    { key: 'occurred_at', label: 'Occurred At', type: 'datetime' },
    { key: 'flow_id', label: 'Automation ID' },
    { key: 'flow_name', label: 'Automation Name' },
    { key: 'execution_id', label: 'Run ID' },
    { key: 'error_message', label: 'Error Message' },
    { key: 'error_node_id', label: 'Step ID' },
  ],
})

module.exports = { flowTriggered, flowError, normalizeTriggered, normalizeError }
