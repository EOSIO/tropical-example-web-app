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

  const der = new Serialize.SerialBuffer({ array: new Uint8Array(assertion.signature) })
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
  const signedData = Buffer.concat([Buffer.from(assertion.authenticatorData), Buffer.from(e.hash().update(Buffer.from(assertion.clientDataJSON)).digest())])
  const hash = Buffer.from(e.hash().update(signedData).digest())
  const recid = e.getKeyRecoveryParam(hash, Buffer.from(assertion.signature), pubKey)

  const sigData = new Serialize.SerialBuffer()
  sigData.push(recid + 27 + 4)
  sigData.pushArray(r)
  sigData.pushArray(s)
  sigData.pushBytes(new Uint8Array(assertion.authenticatorData))
  sigData.pushBytes(new Uint8Array(assertion.clientDataJSON))

  const sig = Numeric.signatureToString({
      type: Numeric.KeyType.wa,
      data: sigData.asUint8Array().slice(),
  })

  return sig;
}

export const generateWebauthnPubkey = async ( accountName ) => {
  const createCredentialOptions = {
    // Format of new credentials is publicKey
    publicKey: {
      // Relying Party
      rp: {
        name: "Tropical Stay",
        id: window.location.hostname
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
    webauthnPublicKey,
    hostname: window.location.hostname
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
  // const sigDigest = Buffer.from(ecc.sha256(sigData), 'hex')
  const sigDigest = Buffer.from(e.hash().update(sigData).digest())
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

export const canUseWebAuthN = () => {
  return window.location.protocol.replace(/:$/, '') === 'https'
}
