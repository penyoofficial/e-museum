import { createInterface } from 'readline'
import { SGR } from './sgr'
import { grammarAnalyze, synchronize } from '.'

/** 提供阻塞式输入流。 */
export async function blockingInput(notice?: string) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise<string>(resolve => {
        rl.question(notice || "", input => {
            resolve(input)
            rl.close()
        })
    })
}

(async () => {
    console.clear()
    console.log("  " + SGR.blackBG(SGR.white("Copyright (c) Penyo. All rights reserved. ")))
    console.log("  " + SGR.blue("欢迎使用 PenyoDB 交互式解释器！"))
    console.log("  " + SGR.blue("您可以使用 SQL-like 来编写命令。"))
    console.log()

    let comm: string
    do {
        comm = (await blockingInput()).trim().toLowerCase()
        console.log(SGR.italic(SGR.yellow("正在处理中......")))
        if (comm !== "quit" && comm !== "exit") {
            await grammarAnalyze(comm)
                .then(r => {
                    console.log("\x1b[1F\x1b[K" + SGR.italic(SGR.green(typeof r === "string" ? r : JSON.stringify(r))))
                })
                .catch(e => {
                    console.error("\x1b[1F\x1b[K" + SGR.italic(SGR.red(e)))
                })
        } else {
            await synchronize()
            console.log("\x1b[1F\x1b[K" + "拜拜~ o(*￣▽￣*)ブ")
            break
        }
    } while (1)
})()