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
    export const toBinary = (plaintext: string) => {
        let binaryString = ""
        for (let i = 0; i < plaintext.length; i++) {
            const char = plaintext.charAt(i)
            const codePoint = char.codePointAt(0) as number
            const binaryChar = codePoint.toString(2).padStart(8, '0')
            binaryString += binaryChar
        }
        return binaryString
    }

    /** 将二进制码转换为明文。 */
    export const fromBinary = (binaryString: string) => {
        let result = ""
        let i = 0
        while (i < binaryString.length) {
            const binaryChar = binaryString.substring(i, i + 8)
            const codePoint = parseInt(binaryChar, 2)
            if (isNaN(codePoint)) break
            const char = String.fromCodePoint(codePoint)
            result += char
            i += 8
        }
        return result
    }
}