/**
 * Hidden triggers that feed the Account and Automation dropdowns.
 */

const { accountLabel, flowId, listAccounts, listFlowsForAccount } = require('../lib/api')

const accountList = {
  key: 'accountList',
  noun: 'Account',
  display: {
    label: 'List Accounts',
    description: 'Lists your connected accounts for dropdowns.',
    hidden: true,
  },
  operation: {
    perform: async (z) => {
      const accounts = await listAccounts(z)
      return accounts.map((a) => ({
        id: a.id,
        label: accountLabel(a),
        platform: a.platform,
        username: a.username || null,
        status: a.status,
      }))
    },
    sample: { id: '66f1c0a8e4b0a1b2c3d4e5f7', label: '@brand (Instagram)', platform: 'instagram', username: 'brand', status: 'connected' },
  },
}

const flowList = {
  key: 'flowList',
  noun: 'Automation',
  display: {
    label: 'List Automations',
    description: 'Lists the automations of the chosen account for dropdowns.',
    hidden: true,
  },
  operation: {
    perform: async (z, bundle) => {
      // The API lists automations per account, so an account must be chosen.
      if (!bundle.inputData.account_id) return []
      const flows = await listFlowsForAccount(z, bundle.inputData.account_id)
      return flows.map((f) => ({
        id: flowId(f),
        label: `${f.name} (${f.status === 'published' ? 'on' : 'off'})`,
        name: f.name,
        status: f.status,
      }))
    },
    sample: { id: '66f1c0a8e4b0a1b2c3d4e5f8', label: 'Price reply (on)', name: 'Price reply', status: 'published' },
  },
}

module.exports = { accountList, flowList }
