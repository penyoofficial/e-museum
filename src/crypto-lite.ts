import { createHash } from 'crypto'

/**
 * `CryptoLite` 将复杂、难以使用的加解密算法重包装，使开发者可以集中注意力在核心业务上。
*/
export namespace CryptoLite {
    /** 返回字符串的 MD5 值。 */
    export const getMD5 = (textdata: string, secureClass?: number) => {
        if (!createHash)
            return getFakeSummary(32, textdata, secureClass)
        const summary = createHash('md5').update(textdata).digest('hex')
        if (secureClass && secureClass > 0)
            return getMD5(summary, --secureClass)
        return summary
    }

    /** 返回字符串的 SHA-512 值。 */
    export const getSHA512 = (textdata: string, secureClass?: number) => {
        if (!createHash)
            return getFakeSummary(64, textdata, secureClass)
        const summary = createHash('sha512').update(textdata).digest('hex')
        if (secureClass && secureClass > 0)
            return getSHA512(summary, --secureClass)
        return summary
    }

    /** 返回虚假摘要。 */
    const getFakeSummary = (summaryBits: number, textdata: string, secureClass?: number) => {
        let fakeV = ""
        while (fakeV.length < summaryBits * Math.E)
            fakeV += textdata
        const summary = fakeV.slice(summaryBits, summaryBits * 2)
        if (secureClass && secureClass > 0)
            return getFakeSummary(summaryBits, summary, --secureClass)
        return summary
    }

    /** 将明文转换为二进制码。 */
    export const toBinary = (str: string) => {
        const buffer = new TextEncoder().encode(str)
        let binary = ""
        for (let i = 0; i < buffer.length; i++) {
            const binaryByte = buffer[i].toString(2).padStart(8, "0")
            binary += binaryByte
        }
        return binary
    }

    /** 将二进制码转换为明文。 */
    export const fromBinary = (binary: string) => {
        let str = ""
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substring(i, i + 8)
            const charCode = parseInt(byte, 2)
            const char = String.fromCharCode(charCode)
            str += char
        }
        return str
    }
}