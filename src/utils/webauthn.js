import base64url from 'base64url'
import {Serialize, Numeric} from 'eosjs'
import { ec } from 'elliptic'

// taken from the
const formatWebauthnPubkey = (pubkey) => {
  const clientDataStr = String.fromCharCode.apply(null, new Uint8Array(pubkey.clientDataJSON))
  return {
    attestationObject:  base64url.encode(pubkey.attestationObject),
    clientData: JSON.parse(clientDataStr)
  }
}

const decodeWebauthnSignature = (assertion, key) => {
  console.info('decodeWebauthnSignature().top')
  // assertion.authenticatorData = new Buffer('73,150,13,229,136,14,140,104,116,52,23,15,100,118,96,91,143,228,174,185,162,134,50,199,153,92,243,186,131,29,151,99,5,93,194,42,226'.split(','))
  key = 'PUB_WA_8wvokCijMQgkimW8JvycbBo4v417qGGbmh8S1osf1ALAtjKjSRzk1fhLXt6rTknUS'
  const e = new ec('p256');
  const fixup = (x) => {
    const a = Array.from(x)
    while (a.length < 32)
      a.unshift(0)
    while (a.length > 32)
      if (a.shift() !== 0)
        throw new Error('Signature has an r or s that is too big')
    return new Uint8Array(a)
  }
  const signature = new Buffer('48,70,2,33,0,251,94,254,179,237,150,30,162,187,132,174,47,106,199,162,171,252,198,176,124,56,244,40,172,78,237,50,154,122,75,56,26,2,33,0,210,96,206,111,40,122,15,104,168,0,46,69,171,9,61,61,63,193,200,130,69,238,202,103,69,141,29,33,0,176,151,208'.split(','))
  
  const der = new Serialize.SerialBuffer({ array: new Uint8Array(signature) })
  if (der.get() !== 0x30)
      throw new Error('Signature missing DER prefix')
  if (der.get() !== der.array.length - 2)
      throw new Error('Signature has bad length')
  if (der.get() !== 0x02)
      throw new Error('Signature has bad r marker')
  const r = fixup(der.getUint8Array(der.get()))
  if (der.get() !== 0x02)
      throw new Error('Signature has bad s marker')
  const s = fixup(der.getUint8Array(der.get()))

  const pubkeyData = Numeric.stringToPublicKey(key).data.subarray(0, 33)
  const pubKey = e.keyFromPublic(pubkeyData).getPublic();
  // const signedData = Buffer.concat([Buffer.from(assertion.authenticatorData), Buffer.from(ecc.sha256(Buffer.from(assertion.clientDataJSON)), 'hex')])
  // const signedData = Buffer.concat([Buffer.from(assertion.authenticatorData), Buffer.from(e.hash().update(Buffer.from(assertion.clientDataJSON)).digest(), 'hex')])
  const authenticatorData = new Buffer('73,150,13,229,136,14,140,104,116,52,23,15,100,118,96,91,143,228,174,185,162,134,50,199,153,92,243,186,131,29,151,99,5,93,194,42,226'.split(','))
  // const userHandle = new Buffer('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'.split(','))
  const clientDataJSON = new Buffer('123,34,99,104,97,108,108,101,110,103,101,34,58,34,110,52,76,72,90,83,122,119,115,49,110,66,48,98,120,102,53,118,75,84,119,121,114,115,50,84,107,105,105,114,71,120,105,95,106,52,89,119,71,45,76,68,85,34,44,34,111,114,105,103,105,110,34,58,34,104,116,116,112,115,58,47,47,108,111,99,97,108,104,111,115,116,58,51,48,48,48,34,44,34,116,121,112,101,34,58,34,119,101,98,97,117,116,104,110,46,103,101,116,34,125'.split(','))
  const signedData = Buffer.concat([Buffer.from(authenticatorData), Buffer.from(e.hash().update(Buffer.from(clientDataJSON)).digest(), 'hex')])
  console.info('signedData:', signedData.join(','))
  // const hash = Buffer.from(ecc.sha256(signedData), 'hex')
  const hash = Buffer.from(e.hash().update(signedData).digest(), 'hex')
  console.info('hash:', hash.join(', '))
  const recid = e.getKeyRecoveryParam(hash, Buffer.from(signature), pubKey)
  console.info('recid:', recid)
  
  const sigData = new Serialize.SerialBuffer()
  sigData.push(recid + 27 + 4)
  sigData.pushArray(r)
  sigData.pushArray(s)
  sigData.pushBytes(new Uint8Array(authenticatorData))
  sigData.pushBytes(new Uint8Array(clientDataJSON))
  
  const sig = Numeric.signatureToString({
      type: Numeric.KeyType.wa,
      data: sigData.asUint8Array().slice(),
  })
  console.log('sig:', sig)
  return sig;
}

export const generateWebauthnPubkey = async ( accountName ) => {
  const createCredentialOptions = {
    // Format of new credentials is publicKey
    publicKey: {
      // Relying Party
      rp: {
        name: "Tropical Stay",
        id: "localhost"
      },
      // Cryptographic challenge from the server
      challenge: new Uint8Array(26),
      // User
      user: {
        id: new Uint8Array(16),
        name: accountName,
        displayName: accountName,
      },
      // Requested format of new keypair
      pubKeyCredParams: [{
        type: "public-key",
        alg: -7,
      }],
      timeout: 60000,
      attestation: 'direct'
    }
  }

  const webauthnResp = await navigator.credentials.create(createCredentialOptions)
  return formatWebauthnPubkey(webauthnResp.response)
}

export const enrollWebauthnPubkey = async (accountName, webauthnPublicKey) => {
  const payload = {
    accountName,
    webauthnPublicKey
  }

  const enrollResponse = await fetch('/api/enroll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  const enrollResult = await enrollResponse.json()
  if (!enrollResult.status || enrollResult.status !== "ok")  {
    throw new Error("Enrollment failed")
  }
}

export const generateRentChallenge = async(accountName, propertyName) => {
  const payload = {
    accountName,
    propertyName
  }

  const resp = await fetch('/api/generateRentChallenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  const result = await resp.json()
  if (!result.status || result.status !== "ok")  {
    throw new Error("Enrollment failed")
  }

  return result
}

export const signRentChallenge = async(accountName, propertyName, challenge) => {
  const e = new ec('p256');
  const challengeBuffer = new Serialize.SerialBuffer()
  challengeBuffer.pushName(accountName)
  challengeBuffer.pushName(propertyName)
  challengeBuffer.pushPublicKey(challenge.userKey)
  const sigData = challengeBuffer.asUint8Array()
  const sigDigest = Buffer.from(e.hash().update(sigData).digest(), 'hex')
  const getCredentialOptions = {
    publicKey: {
      timeout: 60000,
      allowCredentials: [{
        id: base64url.toBuffer(challenge.credentialID),
        type: 'public-key',
      }],
      challenge: sigDigest,
    },
  }

  const webauthnResp = await navigator.credentials.get(getCredentialOptions)
  return decodeWebauthnSignature(webauthnResp.response, challenge.userKey)
}