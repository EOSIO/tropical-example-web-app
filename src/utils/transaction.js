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
  // context_free_actions: [{
  //   account: 'tropical',
  //   name: 'check2fa',
  //   authorization: [],
  //   data: {
  //     user: accountName,
  //     property: propertyName,
  //     server_key: serverKey,
  //     user_key: userKey,
  //     server_auth: serverAuth,
  //     bearer_auth: userAuth,
  //   },
  // }],
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
})


// const actions = [{
//         account: 'tropical',
//         name: 'rent',
//         authorization: [{
//             actor: "kbo2byvpkbiy",
//             permission: 'active',
//         }],
//         data: {
//             account: "kbo2byvpkbiy",
//             permission: "active",
//             parent: 'active',
//             auth: {
//                 "threshold": 1,
//                 "keys": [{
//                     "key": "EOS6gmCFLGxcAkKRskJKBPwXdFwZSJ7TPz2RRpXU1Lyn5e3zXrEFm",
//                     "weight": 1
//                 }],
//                 "accounts": [{
//                     "permission": {
//                         "actor": "kbo2byvpkbiy",
//                         "permission": "eosio.code"
//                     },
//                     "weight": 1
//                 }],
//                 "waits": [
//                     {
//                         "wait_sec": 0,
//                         "weight": 0
//                     }
//                 ]
//             }
//         }
//     }];

export const transactionConfig = { broadcast: true, expireSeconds: 300 }
