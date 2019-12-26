export const generateTransaction = account => ({
  actions: [{
    account: 'tropical',
    name: 'like',
    authorization: [{
      actor: account,
      permission: 'active',
    }],
    data: {
      user: account,
    },
  }],
})

export const generateRentTransaction = (accountName, propertyName, serverKey, userKey, serverAuth, userAuth) => {
  return {
    context_free_actions: [{
      account: 'tropical',
      name: 'check2fa',
      authorization: [],
      data: {
        user: accountName,
        property: propertyName,
        server_key: serverKey,
        user_key: userKey,
        server_auth: serverAuth,
        bearer_auth: userAuth
      }
    }],
    actions: [{
      account: 'tropical',
      name: 'rent',
      authorization: [{
        actor: accountName,
        permission: 'active'
      }],
      data: {
        user: accountName,
        property: propertyName,
      }
    }
    ],
  }
}

export const transactionConfig = { broadcast: true, expireSeconds: 300 }
