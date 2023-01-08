import crypto from 'crypto'
import * as elliptic from 'elliptic'

const ec = new elliptic.ec("secp256k1")

const getPrivateKey = (name: string, token: string) => {
    const nameCiphered = crypto.createHash("sha256").update(name).digest()
    const tokenCiphered = crypto.createHash("sha256").update(token).digest()
    const nameKey = ec.keyFromPrivate(nameCiphered)
    const tokenKey = ec.keyFromPrivate(tokenCiphered)
    return (nameKey.derive(tokenKey.getPrivate("hex") as unknown as elliptic.curve.base.BasePoint) as unknown as elliptic.ec.KeyPair).getPrivate("hex")
}