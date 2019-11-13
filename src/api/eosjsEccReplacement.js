const Signature = require("./eosjsEccSupport/signature")

export const eccSignHash = (dataSha256, privateKey, encoding = 'hex') => {
  return Signature.signHash(dataSha256, privateKey, encoding).toString()
}