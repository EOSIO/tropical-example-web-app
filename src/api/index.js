import { Router, json } from 'express'
import { ec as EC } from 'elliptic'
import {Serialize, Numeric} from 'eosjs'
import { JsSignatureProvider, PrivateKey, PublicKey, Signature } from 'eosjs/dist/eosjs-jssig'
import base64url from 'base64url'
import cbor from 'cbor'
import util from 'util';

export default () => {
  const ec = new EC('secp256k1')
  const private_key_wif = process.env.API_SERVER_PRIVATE_KEY
  const api = Router()

  const decodeWebauthnPublicKey = (webauthnPublicKey, hostname) => {
    const attestationBuffer = base64url.toBuffer(webauthnPublicKey.attestationObject)
    const attestation = cbor.decodeFirstSync(attestationBuffer)
    const authdata = attestation.authData
    const flags = authdata.readUInt8(32)
    const credentialIDLength = authdata.readUInt16BE(53)
    const credentialID = authdata.slice(55, 55 + credentialIDLength)
    const COSEPublicKeyBuffer = authdata.slice( 55 + credentialIDLength )
    const COSEPublicKey = cbor.decodeFirstSync(COSEPublicKeyBuffer)

    const x   = COSEPublicKey.get(-2)
    const y   = COSEPublicKey.get(-3)

    const rpId = hostname
    const presence = ((flags)=>{
      if (flags & 0x04)
        return 2
      else if (flags & 0x01)
        return 1
      else
        return 0
    })(flags)

    const ser = new Serialize.SerialBuffer({textEncoder: new util.TextEncoder(), textDecoder: new util.TextDecoder()})
    ser.push(2)
    ser.push((y[31] & 1) ? 3 : 2)
    ser.pushArray(x)
    ser.push(presence)
    ser.pushString(rpId)
    const eosioPubkey = ser.asUint8Array()

    return {eosioPubkey, credentialID}
  }

  const users = {}

  api.post( '/generateRentChallenge', json(), (req, resp) => {
    const name = req.body.accountName
    const propertyName = req.body.propertyName
    const namePairBuffer = new Serialize.SerialBuffer({textEncoder: new util.TextEncoder(), textDecoder: new util.TextDecoder()})
    namePairBuffer.pushName(name)
    namePairBuffer.pushName(propertyName)

    const sigData = Buffer.concat( [ namePairBuffer.asUint8Array(), users[name].eosioPubkey ] )
    const sigDigest = Buffer.from(ec.hash().update(sigData).digest())

    const kPrivElliptic = PrivateKey.fromString(private_key_wif).toElliptic(ec)
    const ellipticSignature = kPrivElliptic.sign(sigDigest)
    const signature = Signature.fromElliptic(ellipticSignature).toString()

    const userKey = Numeric.publicKeyToString({
      type: Numeric.KeyType.wa,
      data: users[name].eosioPubkey.slice(1),
    })
    const serverKey = PublicKey.fromElliptic(kPrivElliptic).toString()
    const credentialIDStr = base64url.encode(users[name].credentialID)

    resp.json({
      'status': 'ok',
      'userKey' : userKey,
      'serverKey' : serverKey,
      'serverAuth': signature,
      'credentialID': credentialIDStr
    })
  })

  api.post( '/enroll', json(), (req, resp) => {
    const name = req.body.accountName
    const webauthnPublicKey = req.body.webauthnPublicKey
    const hostname = req.body.hostname

    users[name] = decodeWebauthnPublicKey(webauthnPublicKey, hostname)
    resp.json({ 'status': 'ok' })
  })

  return api
}
