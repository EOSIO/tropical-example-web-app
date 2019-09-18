import base64url from 'base64url'

// taken from the
const formatWebauthnPubkey = (pubkey) => {
  const clientDataStr = String.fromCharCode.apply(null, new Uint8Array(pubkey.clientDataJSON));
  return {
    attestationObject:  base64url.encode(pubkey.attestationObject),
    clientData: JSON.parse(clientDataStr)
  }
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
  return formatWebauthnPubkey(webauthnResp.response);
}

export const enrollWebauthnPubkey = async (accountName, pubkey) => {
  const payload = {
    name: accountName,
    webauthnPublicKey: pubkey
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