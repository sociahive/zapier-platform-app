/**
 * Builds a REST hook trigger on SociaHive's webhook subscriptions.
 *
 * Turning a Zap on creates a subscription (POST /webhooks, integration_type
 * `zapier`, one event, optionally limited to one account); turning it off
 * deletes it. SociaHive then POSTs each event to the Zap's URL as
 *   { id, event, timestamp, data }
 * which `normalize` turns into the flat record the Zap sees. `performList`
 * must return records of the same shape (Zapier uses them as samples).
 */

const { API_BASE } = require('./api')

const accountFilterField = {
  key: 'account_id',
  label: 'Account',
  helpText: 'Optional. Only trigger for this connected account. Leave empty for all accounts.',
  required: false,
  dynamic: 'accountList.id.label',
}

const makeHookTrigger = ({
  key,
  noun,
  label,
  description,
  event,
  normalize,
  performList,
  sample,
  outputFields,
  extraInputFields = [],
  accept = () => true,
}) => {
  const performSubscribe = async (z, bundle) => {
    const body = {
      target_url: bundle.targetUrl,
      events: [event],
      integration_type: 'zapier',
    }
    if (bundle.inputData.account_id) body.account_ids = [bundle.inputData.account_id]
    const response = await z.request({ url: `${API_BASE}/webhooks`, method: 'POST', body })
    const created = response.data && response.data.data
    // Keep only the id: the signing secret is not needed to receive events.
    return { id: created.id }
  }

  const performUnsubscribe = async (z, bundle) => {
    const id = bundle.subscribeData && bundle.subscribeData.id
    if (!id) return {}
    const response = await z.request({
      url: `${API_BASE}/webhooks/${encodeURIComponent(id)}`,
      method: 'DELETE',
      skipThrowForStatus: true,
    })
    // Already gone (deleted from the dashboard, or a repeated unsubscribe).
    if (response.status === 404) return {}
    response.throwForStatus()
    return (response.data && response.data.data) || {}
  }

  const perform = async (z, bundle) => {
    const payload = bundle.cleanedRequest || {}
    if (payload.event !== event) return []
    const record = normalize(payload)
    return accept(record, bundle) ? [record] : []
  }

  return {
    key,
    noun,
    display: { label, description },
    operation: {
      type: 'hook',
      inputFields: [accountFilterField, ...extraInputFields],
      performSubscribe,
      performUnsubscribe,
      perform,
      performList,
      sample,
      outputFields,
    },
  }
}

module.exports = { makeHookTrigger }
