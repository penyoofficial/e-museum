import { blackBG, white, blue, italic, green, red } from './ansi-sgr'
import readline from 'readline'
import ORM from './orm'

/** 当前实例可控的虚拟数据库 */
let orm: ORM

async function blockingInput(notice?: string) {
    const rl = readline.createInterface({
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

async function grammarAnalyze(comm: string) {
    while (comm.includes("  "))
        comm = comm.replace("  ", " ")
    const toMap = (kvArr: string[]) => {
        let map = new Map<string, string>()
        kvArr.forEach((kv: string) => {
            map.set(kv.trim().split(" ")[0].trim(), kv.trim().split(" ")[1].trim())
        })
        return map
    }
    return new Promise<string>(async (resolve, reject) => {
        if (/^login/.test(comm)) {
            if (ORM.isInitialized)
                reject("您已经登陆过了，不能重复登陆！")
            const commLogin = /^login (.+?) with token (.+?);?$/
            if (commLogin.test(comm)) {
                const paras = comm.match(commLogin) as string[]
                const name = paras[1]
                const token = paras[2]
                orm = new ORM(name, token)
                if (ORM.isInitialized)
                    resolve(`您好，${name}！`)
                else
                    reject("用户名或密码错误！")
            }
        } else if (/^show/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^create/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^drop/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^grant/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^use/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^select/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^desc/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^insert/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^update/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        } else if (/^delete/.test(comm)) {
            if (!ORM.isInitialized)
                reject("您尚未登陆，不能操作数据库！")
        }
        reject("错误的语法！")
    })
}

(async () => {
    console.clear()
    console.log("> " + blackBG(white("Copyright (c) Penyo. All rights reserved. ")))
    console.log("> " + blue(`欢迎使用 PenyoDB 交互式解释器！`))
    console.log("> " + blue(`您可以使用您熟悉的 SQL 来编写命令。\n`))

    let comm: string
    do {
        process.stdout.write("> ")
        comm = (await blockingInput()).trim().toLowerCase()
        if (comm !== "quit")
            await grammarAnalyze(comm)
                .then(r => {
                    console.log(italic(green(r)))
                })
                .catch(e => {
                    console.error(italic(red(e)))
                })
        else
            break
    } while (1)
    console.log("拜拜~ o(*￣▽￣*)ブ")
})()
