/** 为文本添加**粗体**效果。 */
export const bold = (text: string) => { return `\x1b[1m${text}\x1b[22m` }
/** 为文本添加**弱化**效果。 */
export const dim = (text: string) => { return `\x1b[2m${text}\x1b[22m` }
/** 为文本添加**斜体**效果。 */
export const italic = (text: string) => { return `\x1b[3m${text}\x1b[23m` }
/** 为文本添加**下划线**效果。 */
export const underline = (text: string) => { return `\x1b[4m${text}\x1b[24m` }
/** 为文本添加**双下划线**效果。 */
export const dunderline = (text: string) => { return `\x1b[21m${text}\x1b[24m` }
/** 为文本添加**缓慢闪烁**效果。 */
export const blink = (text: string) => { return `\x1b[5m${text}\x1b[25m` }
/** 为文本添加**快速闪烁**效果。 */
export const flash = (text: string) => { return `\x1b[6m${text}\x1b[26m` }
/** 为文本添加**前背景色反转**效果。 */
export const reverse = (text: string) => { return `\x1b[7m${text}\x1b[27m` }
/** 为文本添加**隐藏**效果。 */
export const hidden = (text: string) => { return `\x1b[8m${text}\x1b[28m` }
/** 为文本添加**删除线**效果。 */
export const strikeout = (text: string) => { return `\x1b[9m${text}\x1b[29m` }

/** RGB 色彩模型。 */
export type RGB = [number, number, number]

/** 使文本颜色为**黑色**。 */
export const black = (text: string) => { return `\x1b[30m${text}\x1b[39m` }
/** 使文本颜色为**红色**。 */
export const red = (text: string) => { return `\x1b[31m${text}\x1b[39m` }
/** 使文本颜色为**绿色**。 */
export const green = (text: string) => { return `\x1b[32m${text}\x1b[39m` }
/** 使文本颜色为**黄色**。 */
export const yellow = (text: string) => { return `\x1b[33m${text}\x1b[39m` }
/** 使文本颜色为**蓝色**。 */
export const blue = (text: string) => { return `\x1b[34m${text}\x1b[39m` }
/** 使文本颜色为**紫色**。 */
export const magenta = (text: string) => { return `\x1b[35m${text}\x1b[39m` }
/** 使文本颜色为**青色**。 */
export const cyan = (text: string) => { return `\x1b[36m${text}\x1b[39m` }
/** 使文本颜色为**白色**。 */
export const white = (text: string) => { return `\x1b[37m${text}\x1b[39m` }
/** 使文本颜色为指定颜色。 */
export const color = (text: string, color: RGB) => { return `\x1b[38;2;${color[0]};${color[1]};${color[2]}m${text}\x1b[39m` }
/** 使背景颜色为**黑色**。 */
export const blackBG = (text: string) => { return `\x1b[40m${text}\x1b[49m` }
/** 使背景颜色为**红色**。 */
export const redBG = (text: string) => { return `\x1b[41m${text}\x1b[49m` }
/** 使背景颜色为**绿色**。 */
export const greenBG = (text: string) => { return `\x1b[42m${text}\x1b[49m` }
/** 使背景颜色为**黄色**。 */
export const yellowBG = (text: string) => { return `\x1b[43m${text}\x1b[49m` }
/** 使背景颜色为**蓝色**。 */
export const blueBG = (text: string) => { return `\x1b[44m${text}\x1b[49m` }
/** 使背景颜色为**紫色**。 */
export const magentaBG = (text: string) => { return `\x1b[45m${text}\x1b[49m` }
/** 使背景颜色为**青色**。 */
export const cyanBG = (text: string) => { return `\x1b[46m${text}\x1b[49m` }
/** 使背景颜色为**白色**。 */
export const whiteBG = (text: string) => { return `\x1b[47m${text}\x1b[49m` }
/** 使背景颜色为指定颜色。 */
export const colorBG = (text: string, color: RGB) => { return `\x1b[48;2;${color[0]};${color[1]};${color[2]}m${text}\x1b[49m` }