const ecdsa = require('./ecdsa');
const curve = require('ecurve').getCurveByName('secp256k1');
const assert = require('assert');
const BigInteger = require('bigi');
const keyUtils = require('./key_utils');
const PrivateKey = require('./key_private');
const {
  PrivateKey: EllipticPrivateKey,
  PublicKey: EllipticPublicKey,
  Signature: EllipticSignature
} = require('eosjs/dist/eosjs-jssig')
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import { ec as ellipticEc } from 'elliptic'

module.exports = Signature

function Signature(r, s, i) {
    assert.equal(r != null, true, 'Missing parameter');
    assert.equal(s != null, true, 'Missing parameter');
    assert.equal(i != null, true, 'Missing parameter');

    let signatureCache

    function toBuffer() {
        var buf;
        buf = new Buffer(65);
        buf.writeUInt8(i, 0);
        r.toBuffer(32).copy(buf, 1);
        s.toBuffer(32).copy(buf, 33);
        return buf;
    };

    function toString() {
      if(signatureCache) {
          return signatureCache
      }
      signatureCache = 'SIG_K1_' + keyUtils.checkEncode(toBuffer(), 'K1')
      return signatureCache
    }

    return {
        r, s, i,
        toString,
        toBuffer,
    }
}

/**
    Sign a buffer of exactally 32 bytes in size (sha256(text))

    @arg {string|Buffer} dataSha256 - 32 byte buffer or string
    @arg {wif|PrivateKey} privateKey
    @arg {String} [encoding = 'hex'] - dataSha256 encoding (if string)

    @return {Signature}
*/
Signature.signHash = function(dataSha256, privateKey, encoding = 'hex') {
    if(typeof dataSha256 === 'string') {
        dataSha256 = Buffer.from(dataSha256, encoding)
    }
    if( dataSha256.length !== 32 || ! Buffer.isBuffer(dataSha256) )
        throw new Error("dataSha256: 32 byte buffer requred")

    const ellipticKPriv = EllipticPrivateKey.fromString(privateKey).toElliptic()
    const KPrivAsString = EllipticPrivateKey.fromString(privateKey).toString()
    console.info('KPrivAsString:', KPrivAsString)
    // console.info('KPrivAsString.toString:', KPrivAsString.toString())
    // console.info('ellipticKPriv:', ellipticKPriv)
    // console.info('ellipticKPriv:', ellipticKPriv.priv)
    const ellipticKPrivAsBuffer = ellipticKPriv.priv.toBuffer()
    console.info('ellipticKPriv.toBuffer:', ellipticKPrivAsBuffer)
    const ellipticKPrivDAsBuffer = ellipticKPriv.priv.toBuffer()
    // console.info('ellipticKPriv:', Buffer.from(ellipticKPriv))
    privateKey = PrivateKey(privateKey)
    // console.info('privateKey:', privateKey)
    // console.info('privateKey.d:', privateKey.d)
    console.info('privateKey.d.toBuffer :', ellipticKPrivDAsBuffer)
    assert(privateKey, 'privateKey required')
    // console.info('privateKey as it goes into JsSignatureProvider', privateKey)
    const publicKey = new JsSignatureProvider([KPrivAsString]).availableKeys[0]
    console.info('pubicKey:', publicKey)
    const ellipticPrivateKeyAsBigInteger = BigInteger.fromBuffer(ellipticKPrivDAsBuffer)
    // console.info('\n\nellipticPrivateKeyAsBigInteger:', ellipticPrivateKeyAsBigInteger)
    // console.info('privateKey.d                  :', privateKey.d)

    // console.info('ecc.privKey.Q:')
    // console.info(privateKey.toPublic().Q)
    // console.info('ellipticPubKey:')
    // console.info(EllipticPublicKey.fromString(publicKey).toElliptic())

    const ec = new ellipticEc('secp256k1')
    var der, e, ecsignature, i, lenR, lenS, nonce;
    i = null;
    nonce = 0;
    e = BigInteger.fromBuffer(dataSha256);
    while (true) {
      ecsignature = ecdsa.sign(curve, dataSha256, ellipticPrivateKeyAsBigInteger, nonce++);
      der = ecsignature.toDER();
      lenR = der[3];
      lenS = der[5 + lenR];
      if (lenR === 32 && lenS === 32) {
        i = ecdsa.calcPubKeyRecoveryParam(curve, e, ecsignature, privateKey.toPublic().Q);
        console.info('ecsignature:', ecsignature)
        // console.info('ellipticSig.constructor:', EllipticSignature.fromBuffer(ecsignature.toDER()))
        // const iAlt = ec.getKeyRecoveryParam(dataSha256, Buffer.from(ecsignature.toDER()), publicKey)
        // console.info('i, iAlt:')
        // console.info(i, iAlt)
        i += 4;  // compressed
        i += 27; // compact  //  24 or 27 :( forcing odd-y 2nd key candidate)
        break;
      }
      if (nonce % 10 === 0) {
        console.log("WARN: " + nonce + " attempts to find canonical signature");
      }
    }
    return Signature(ecsignature.r, ecsignature.s, i);
};
