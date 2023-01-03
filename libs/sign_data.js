import secp256k1 from 'secp256k1'
import { randomBytes } from '@ethersproject/random'
import { arrayify, hexlify } from '@ethersproject/bytes'

class Sign {
  constructor(hexPriviateKey, hexPublicKey) {
    if (!hexPriviateKey) {
      this.privateKey = randomBytes(32)
    } else {
      this.privateKey = arrayify(hexPriviateKey)
    }

    if (hexPublicKey) {
      this.publicKey = arrayify(hexPublicKey)
    }

    this.getPublicKey()
  }

  getPrivateKey(_hexlify = false) {
    return _hexlify ? hexlify(this.privateKey) : this.privateKey
  }

  getPublicKey(_hexlify = false) {
    if (this.publicKey) {
      return _hexlify ? hexlify(this.publicKey) : this.publicKey
    }
    var compressed = secp256k1.publicKeyCreate(this.privateKey)

    this.compressedPublicKey = compressed

    // this.publicKey =  secp256k1.publicKeyConvert(compressed, false)
    this.publicKey = compressed
    return _hexlify ? hexlify(this.publicKey) : this.publicKey
  }

  sign(msg, _hexlify = false) {
    const rs = secp256k1.ecdsaSign(msg, this.privateKey)
    return _hexlify ? hexlify(rs.signature) : rs
  }

  verify(signature, msg) {
    if (typeof signature === 'string') {
      signature = arrayify(signature)
    }
    return secp256k1.ecdsaVerify(signature, msg, this.publicKey)
  }
}

export default Sign
