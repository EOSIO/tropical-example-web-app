export const generateLikeTransaction = account => ({
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

export const generateRentTransaction = (accountName, propertyName, serverKey, userKey, serverAuth, userAuth) => ({
  "actions": [
        {
            "account": "eosio",
            "name": "updateauth",
            "authorization": [
                {
                    "actor": "example",
                    "permission": "active"
                }
            ],
            "data": {
                "account": "example",
                "permission": "active",
                "parent": "owner",
                "auth": {
                    "threshold": 1,
                    "keys": [
                        {
                            "key": "EOS6TWM95TUqpgcjYnvXSK5kBsi6LryWRxmcBaULVTvf5zxkaMYWf",
                            "weight": 1
                        }
                    ],
                    "accounts": [
                        {
                            "permission": {
                                "actor": "example",
                                "permission": "eosio.code"
                            },
                            "weight": 1
                        }
                    ],
                    "waits": []
                }
            }
        }
    ]
});

export const transactionConfig = { broadcast: true, expireSeconds: 300 }
