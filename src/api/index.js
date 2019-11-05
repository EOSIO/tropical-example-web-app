import { Router, json } from 'express'
import { JsSignatureProvider, Signature } from 'eosjs/dist/eosjs-jssig'
import { ec } from 'elliptic'
import {Serialize, Numeric} from 'eosjs'
import base64url from 'base64url'
import cbor from 'cbor'
import util from 'util';

export default () => {
  const private_key_wif = process.env.API_SERVER_PRIVATE_KEY
  const api = Router()

  const decodeWebauthnPublicKey = (webauthnPublicKey) => {
    console.info('decodeWebauthnPublicKey().top')
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
    const defaultEc = new ec('secp256k1')
    const name = req.body.accountName
    const propertyName = req.body.propertyName
    const namePairBuffer = new Serialize.SerialBuffer({textEncoder: new util.TextEncoder(), textDecoder: new util.TextDecoder()})
    namePairBuffer.pushName(name)
    namePairBuffer.pushName(propertyName)
    const sigData = Buffer.concat( [ namePairBuffer.asUint8Array(), users[name].eosioPubkey ] )
    const sigDigest = Buffer.from(defaultEc.hash().update(sigData).digest(), 'hex')
    // const challenge = ecc.signHash(sigDigest, private_key_wif).toString()
    const challenge = Signature.fromElliptic(defaultEc.sign(sigDigest, private_key_wif)).toString()
    console.info('challenge:', challenge)
    const userKey = Numeric.publicKeyToString({
      type: Numeric.KeyType.wa,
      data: users[name].eosioPubkey.slice(1),
    })

    console.info('private_key_wif:', private_key_wif)
    // const serverKey = defaultEc.privateToPublic(private_key_wif)
    // const priv = PrivateKey.fromString(private_key_wif).toElliptic(defaultEc);
    // const serverKey = PublicKey.fromElliptic(priv, KeyType.k1).toString();
    const sigProv = new JsSignatureProvider([private_key_wif])
    sigProv.getAvailableKeys().then((publicKeys) => {
      const serverKey = publicKeys[0]
      console.info('serverKey:', serverKey)

      const credentialIDStr = base64url.encode(users[name].credentialID)

      resp.json({
        'status': 'ok',
        'userKey' : userKey,
        'serverKey' : serverKey,
        'serverAuth': challenge,
        'credentialID': credentialIDStr
      })
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