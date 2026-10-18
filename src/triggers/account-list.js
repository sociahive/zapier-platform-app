/**
 * Hidden trigger: the user's connected accounts, for the Create Post account
 * dropdown. Each choice's id is "platform:accountId", which Create Post splits.
 */

const performList = async (z) => {
  const response = await z.request({
    url: 'https://www.sociahive.com/api/v1/connected-accounts',
  })

  const accounts = response.data?.data ?? []
  return accounts.map((a) => ({
    id: `${a.platform}:${a.id}`,
    name: `${a.display_name || a.name || a.username || a.id} (${a.platform})`,
  }))
}

module.exports = {
  key: 'accountList',
  noun: 'Account',

  display: {
    label: 'Connected Account',
    description: 'Lists your connected accounts for the Create Post dropdown.',
    hidden: true,
  },

  operation: {
    perform: performList,
    sample: { id: 'instagram:507f1f77bcf86cd799439012', name: 'My shop (instagram)' },
    outputFields: [
      { key: 'id', label: 'Account' },
      { key: 'name', label: 'Name' },
    ],
  },
}
