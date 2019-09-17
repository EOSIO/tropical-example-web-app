import { Router } from 'express'
import ecc from 'eosjs-ecc'
import {SerialBuffer} from 'eosjs'
import base64url from 'base64url'
import cbor from 'cbor'

export default () => {
  const private_key_wif = process.env.API_SERVER_PRIVATE_KEY
  const api = Router()

  const decodeResponse = (clientData, webauthnResp) => {
    const attestationBuffer = base64url.toBuffer(webAuthnResponse.response.attestationObject)
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

  api.get( '/generateRentChallenge', (req, resp) => {
    const name = request.body.name
    const property_name = request.body.property_name

    const namePairBuffer = new SerialBuffer()
    namePairBuffer.pushName(name)
    namePairBuffer.pushName(property_name)
    const sigData = Buffer.concat( namePairBuffer.asUint8Array(), users[name].eosioPubkey )
    const sigDigest = ecc.sha256(sigData)
    const challenge = ecc.signHash(sigDigest, private_key_wif).toString()

    response.json({
      'status': 'ok',
      'challenge': challenge
    })
  })

  api.post( '/enroll', (req, resp) => {
    // Note there is no verfication of this data as it is out of scope for this demo
    //
    const name = request.body.name
    const webauthnResp = request.body.webauthnResp

    users[name] = decodeResponse(webauthnResp)
    response.json({ 'status': 'ok' })
  })

  return api
}