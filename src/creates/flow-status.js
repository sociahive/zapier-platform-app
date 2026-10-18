/**
 * Actions: Turn an automation on or off.
 *
 * Flows are `draft`, `published` or `archived`. "On" is PUT /flows/:id
 * { status: 'published' }, which runs the same publish checks as the Turn on
 * button (a refusal comes back as an error); "off" sets it back to `draft`.
 */

const { API_BASE, flowId } = require('../lib/api')

const fields = [
  {
    key: 'account_id',
    label: 'Account',
    required: true,
    dynamic: 'accountList.id.label',
    helpText: 'The account the automation belongs to.',
  },
  {
    key: 'flow_id',
    label: 'Automation',
    required: true,
    dynamic: 'flowList.id.label',
  },
]

const setStatus = (status) => async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE}/flows/${encodeURIComponent(bundle.inputData.flow_id)}`,
    method: 'PUT',
    body: { status },
  })
  const flow = (response.data && response.data.flow) || {}
  return { id: flowId(flow), name: flow.name, status: flow.status }
}

const sample = (status) => ({ id: '66f1c0a8e4b0a1b2c3d4e5f8', name: 'Price reply', status })

const outputFields = [
  { key: 'id', label: 'Automation ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
]

const activateFlow = {
  key: 'activateFlow',
  noun: 'Automation',
  display: {
    label: 'Turn on Automation',
    description: 'Turns on (publishes) an automation, after the same checks as the Turn on button.',
  },
  operation: { inputFields: fields, perform: setStatus('published'), sample: sample('published'), outputFields },
}

const deactivateFlow = {
  key: 'deactivateFlow',
  noun: 'Automation',
  display: {
    label: 'Turn Off Automation',
    description: 'Turns off an automation. It is kept as a draft.',
  },
  operation: { inputFields: fields, perform: setStatus('draft'), sample: sample('draft'), outputFields },
}

module.exports = { activateFlow, deactivateFlow }
