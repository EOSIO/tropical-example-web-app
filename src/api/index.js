import { Router, json } from 'express'
import ecc from 'eosjs-ecc'
import {Serialize, Numeric} from 'eosjs'
import base64url from 'base64url'
import cbor from 'cbor'
import util from 'util';

export default () => {
  const private_key_wif = process.env.API_SERVER_PRIVATE_KEY
  const api = Router()
  console.log(json)

  const decodeWebauthnPublicKey = (webauthnPublicKey) => {
    const attestationBuffer = base64url.toBuffer(webauthnPublicKey.attestationObject)
    const attestation  = cbor.decodeAllSync(attestationBuffer)[0]

    const flags = attestation.authData.readUInt8(32)
    const credentialIDLength = attestation.authData.readUInt16BE(53)
    const credentialID = attestation.authData.slice(55, credentialIDLength)
    const COSEPublicKeyBuffer = attestation.authData.slice( 55 + credentialIDLength )
    const COSEPublicKey = cbor.decodeAllSync(COSEPublicKeyBuffer)[0]
    const x   = COSEPublicKey.get(-2)
    const y   = COSEPublicKey.get(-3)

    const rpId = 'localhost'
    const presence = ((flags)=>{
      if (flags & 0x04)
        return 2
      else if (flags & 0x01)
        return 1
      else
        return 0
    })(flags)

    const eosioPubkey = Buffer.allocUnsafe(45)
    eosioPubkey.writeInt8(2, 0)                   // WebAuthn pubkey
    eosioPubkey.writeInt8((y[31] & 1) ? 3 : 2, 1) // solution hint for compact key
    x.copy(eosioPubkey, 2, 0, 32)                 // ECC x
    eosioPubkey.writeInt8(presence, 35)           // presence enum
    eosioPubkey.writeInt8(9, 36)                  // varInt length of rpId
    eosioPubkey.write(rpId, 37)                   // rpId

    return {eosioPubkey, credentialID}
  }

  const users = {}

  api.post( '/generateRentChallenge', json(), (req, resp) => {
    const name = req.body.accountName
    const propertyName = req.body.propertyName

    console.log(users[name].eosioPubkey.toString('hex'))

    const namePairBuffer = new Serialize.SerialBuffer({textEncoder: new util.TextEncoder(), textDecoder: new util.TextDecoder()})
    namePairBuffer.pushName(name)
    namePairBuffer.pushName(propertyName)
    const sigData = Buffer.concat( [ namePairBuffer.asUint8Array(), users[name].eosioPubkey ] )
    const sigDigest = ecc.sha256(sigData)
    const challenge = ecc.signHash(sigDigest, private_key_wif).toString()
    const userKey = Numeric.publicKeyToString({
      type: Numeric.KeyType.wa,
      data: users[name].eosioPubkey.slice(1),
    })
    const serverKey = ecc.privateToPublic(private_key_wif)
    const credentialIDStr = base64url.encode(users[name].credentialID)

    resp.json({
      'status': 'ok',
      'userKey' : userKey,
      'serverKey' : serverKey,
      'serverAuth': challenge,
      'credentialID': credentialIDStr
    })
  })

  api.post( '/enroll', json(), (req, resp) => {
    // Note there is no verfication of this data as it is out of scope for this demo
    //
    const name = req.body.accountName
    const webauthnPublicKey = req.body.webauthnPublicKey

    users[name] = decodeWebauthnPublicKey(webauthnPublicKey)
    resp.json({ 'status': 'ok' })
  })

  return api
}