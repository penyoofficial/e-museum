import { createHash } from 'crypto'

/** 返回字符串的 MD5 值（16 位）。 */
export const getMD5 = (textdata: string, secureClass?: number): string => {
    const summary = createHash('md5').update(textdata).digest('hex')
    if (secureClass && secureClass > 0)
        return getMD5(summary, --secureClass)
    return summary
}

/** 返回字符串的 SHA-512 值（64 位）。 */
export const getSHA512 = (textdata: string, secureClass?: number): string => {
    const summary = createHash('sha512').update(textdata).digest('hex')
    if (secureClass && secureClass > 0)
        return getSHA512(summary, --secureClass)
    return summary
}

/** 将明文转换为二进制码。 */
export const toBinary = (textdata: string): string => {
    return Buffer.from(textdata, "utf8").toString("binary")
}

/** 将二进制码转换为明文。 */
export const fromBinary = (bincode: string): string => {
    return Buffer.from(bincode, "binary").toString("utf8")
}