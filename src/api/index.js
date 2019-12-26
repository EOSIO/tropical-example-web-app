import { Router, json } from 'express'
import { ec as EC } from 'elliptic'
import {Serialize, Numeric} from 'eosjs'
import { JsSignatureProvider, PrivateKey, PublicKey, Signature } from 'eosjs/dist/eosjs-jssig'
import base64url from 'base64url'
import cbor from 'cbor'
import util from 'util';

export default () => {
  const ec = new EC('p256')
  const private_key_wif = process.env.API_SERVER_PRIVATE_KEY
  const api = Router()

  const decodeWebauthnPublicKey = (webauthnPublicKey) => {
    const attestationBuffer = base64url.toBuffer(webauthnPublicKey.attestationObject)
    const attestation = cbor.decodeFirstSync(attestationBuffer)
    const authdata = attestation.authData
    const flags = authdata.readUInt8(32)
    const credentialIDLength = authdata.readUInt16BE(53)
    const credentialID = authdata.slice(55, 55 + credentialIDLength)
    const COSEPublicKeyBuffer = authdata.slice( 55 + credentialIDLength )
    const COSEPublicKey = cbor.decodeFirstSync(COSEPublicKeyBuffer)

    console.log(COSEPublicKey);
    const x   = COSEPublicKey.get(-2)
    const y   = COSEPublicKey.get(-3)
    console.log(Buffer.from(x).toString('hex'))
    console.log(Buffer.from(y).toString('hex'))

    const rpId = 'localhost'
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

    console.log(Buffer.from(eosioPubkey).toString('hex'))
    return {eosioPubkey, credentialID}
  }

  const users = {}

  api.post( '/generateRentChallenge', json(), (req, resp) => {
    console.info('generateRentChallenge().top')
    console.info('req:', req.body)
    const name = req.body.accountName
    const propertyName = req.body.propertyName
    const namePairBuffer = new Serialize.SerialBuffer({textEncoder: new util.TextEncoder(), textDecoder: new util.TextDecoder()})
    namePairBuffer.pushName(name)
    namePairBuffer.pushName(propertyName)
    console.info('////////////-----------')
    //console.info('eosioPubkey:', users[name].eosioPubkey.join(','))
    const sigData = Buffer.concat( [ namePairBuffer.asUint8Array(), users[name].eosioPubkey ] )
    const sigDigest = Buffer.from(ec.hash().update(sigData).digest())

    const kPrivElliptic = PrivateKey.fromString(private_key_wif).toElliptic(ec)
    const ellipticSignature = kPrivElliptic.sign(sigDigest)
    const signature = Signature.fromElliptic(ellipticSignature).toString()
    console.info('signature:', signature)
    console.info('\\\\\\\\\\\\-----------')
    const userKey = Numeric.publicKeyToString({
      type: Numeric.KeyType.wa,
      data: users[name].eosioPubkey.slice(1),
    })
    const serverKey = PublicKey.fromElliptic(kPrivElliptic).toString()
    const credentialIDStr = base64url.encode(users[name].credentialID)

    console.info('result:', {
      'status': 'ok',
      'userKey' : userKey,
      'serverKey' : serverKey,
      'serverAuth': signature,
      'credentialID': credentialIDStr
    })
    resp.json({
      'status': 'ok',
      'userKey' : userKey,
      'serverKey' : serverKey,
      'serverAuth': signature,
      'credentialID': credentialIDStr
    })
  })

  api.post( '/enroll', json(), (req, resp) => {
    console.info('enroll().top')
    // Note there is no verfication of this data as it is out of scope for this demo
    //
    const name = req.body.accountName
    console.info('name:', name)
    const webauthnPublicKey = req.body.webauthnPublicKey
    console.info('webauthnPublicKey:', webauthnPublicKey)

    users[name] = decodeWebauthnPublicKey(webauthnPublicKey)
    console.info('publicKey:', users[name].eosioPubkey.join(','))
    resp.json({ 'status': 'ok' })
  })

  return api
}