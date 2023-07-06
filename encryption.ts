import CryptoJS from 'crypto-js'

export const getMD5 = (textdata: string) => {
    return CryptoJS.MD5(textdata).toString()
}