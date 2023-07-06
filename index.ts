import { blackBG, white, blue, italic, yellow, green, red } from './ansi-sgr'
import readline from 'readline'
import os from 'os'
import ORM, { Permission, SupportType, Table } from './orm'
import * as account from './account'
import * as database from './database'
import * as table from './table'
import { sys } from 'typescript'

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
    /** 登录日志。 */
    const loginlog = (isLogined?: boolean) => {
        if (!isLogined)
            return "您尚未登陆，不能操作数据库！"
        return "您已经登陆过了，不能重复登陆！"
    }
    /** 获得 `Permission` 成员。 */
    const getPermission = (name: string) => {
        const member: Permission = Permission[name.toUpperCase()]
        if (typeof member === "string" && member.length > 0)
            return member
        return Permission["INACCESSIBLE"]
    }
    /** 获得 `SupportType` 成员。 */
    const getSupportType = (name: string) => {
        const member: SupportType = SupportType[name.toUpperCase()]
        if (typeof member === "string" && member.length > 0)
            return member
        return SupportType["STRING"]
    }
    /** 切割参数串为便于取用的表或图。 */
    const cutPara = (paras: string, isKVPair?: boolean, kvSplitChar?: string) => {
        let paraArr = paras.split(",")
        let paraMap: Map<string, string> = new Map()
        paraArr.forEach(p => {
            p = p.trim()
            if (isKVPair && kvSplitChar)
                paraMap.set(p.split(kvSplitChar)[0].trim(), p.split(kvSplitChar)[1].trim())
        })
        return isKVPair ? paraArr : paraMap
    }
    return new Promise<string>(async (resolve, reject) => {
        if (/^ ?login/.test(comm)) {
            if (ORM.isInitialized)
                return reject(loginlog(ORM.isInitialized))
            const commLogin = /^ ?login (.+?) with token (.+?) ?;? ?$/
            if (commLogin.test(comm)) {
                const paras = comm.match(commLogin) as string[]
                const name = paras[1]
                const token = paras[2]
                orm = new ORM(name, token)
                if (ORM.isInitialized)
                    return resolve(`您好，${name}！`)
                else
                    return reject("用户名或密码错误！")
            }
        } else if (/^ ?show/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commShowUsers = /^ ?show users ?;? ?$/
            const commShowDatabases = /^ ?show databases ?;? ?$/
            const commShowTables = /^ ?show tables ?;? ?$/
            if (commShowUsers.test(comm)) {
                await account.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commShowDatabases.test(comm)) {
                await database.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commShowTables.test(comm)) {
                await table.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?create/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commCreateUser = /^ ?create user (.+?) with token (.+?) ?;? ?$/
            const commCreateDatabase = /^ ?create database (.+?) ?;? ?$/
            const commCreateTable = /^ ?create table (.+?) ?\(( ?.+? .+? ?[,)]) ?;? ?$/
            if (commCreateUser.test(comm)) {
                const paras = comm.match(commCreateUser) as string[]
                const name = paras[1]
                const token = paras[2]
                await account.create(orm, name, token)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commCreateDatabase.test(comm)) {
                const paras = comm.match(commCreateDatabase) as string[]
                const name = paras[1]
                await database.create(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commCreateTable.test(comm)) {
                const paras = comm.match(commCreateTable) as string[]
                const name = paras[1]
                const cdef = paras[2].slice(0, -1)
                await table.create(orm, name, ((cdef: string) => {
                    let mapG1 = cutPara(cdef, true, " ") as Map<string, string>
                    let mapG2 = new Map<string, SupportType>()
                    mapG1.forEach((v, k) => {
                        mapG2.set(k, getSupportType(v))
                    })
                    return mapG2
                })(cdef))
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^drop/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commDropUser = /^ ?drop user (.+?);? ?$/
            const commDropDatabase = /^ ?drop database (.+?);? ?$/
            const commDropTable = /^ ?drop table (.+?);? ?$/
            if (commDropUser.test(comm)) {
                const paras = comm.match(commDropUser) as string[]
                const name = paras[1]
                await account.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commDropDatabase.test(comm)) {
                const paras = comm.match(commDropDatabase) as string[]
                const name = paras[1]
                await database.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commDropTable.test(comm)) {
                const paras = comm.match(commDropTable) as string[]
                const name = paras[1]
                await table.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^grant/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commGrant = /^ ?grant (.+?) on (.+?)\.(.+?) to (.+?);? ?$/
            const commGrantAll = /^ ?grant (.+?) to (.+?);? ?$/
            if (commGrant.test(comm)) {
                const paras = comm.match(commGrant) as string[]
                const permission = paras[1]
                const namespace = paras[2]
                const name = paras[3]
                const userName = paras[4]
                await account.grant(orm, getPermission(permission), userName, namespace, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commGrantAll.test(comm)) {
                const paras = comm.match(commGrantAll) as string[]
                const permission = paras[1]
                const userName = paras[2]
                await account.grant(orm, getPermission(permission), userName)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^use/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commUse = /^ ?use (.+?);? ?$/
            if (commUse.test(comm)) {
                const paras = comm.match(commUse) as string[]
                const namespace = paras[1]
                await database.use(orm, namespace)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^select/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commSelectDatabase = /^ ?select database\(\);? ?$/
            const commSelectRow = /^ ?select( distinct)? (.+?) from (.+?)( where (.+?))? ?;? ?$/
            if (commSelectDatabase.test(comm)) {
                await database.select(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commSelectRow.test(comm)) {
                const paras = comm.match(commSelectRow) as string[]
                const needDistinct = paras[1] ? true : false
                const cnames = paras[2]
                const tnames = paras[3]
                const conditions = paras[5]
                await table.select(orm, needDistinct, cutPara(cnames) as string[], cutPara(tnames) as string[], ((condition: string[]) => {
                    let cs: string[] = []
                    condition.forEach(c => {
                        if (c.includes("=") || c.includes("<=") || c.includes(">="))
                            cs.push(c)
                    })
                    return cs
                })(cutPara(conditions) as string[]))
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^desc/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commDesc = /^ ?desc (.+?);? ?$/
            if (commDesc.test(comm)) {
                const paras = comm.match(commDesc) as string[]
                const name = paras[1]
                await table.desc(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^insert/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
            const commInsert = /^ ?insert( into)? (.+?) ?\(( ?.+? ?[,)]) ?values ?\(( ?.+? ?[,)]) ?;? ?$/
            const commInsertAll = /^ ?insert( into)? (.+?) values ?\(( ?.+? ?[,)]) ?;? ?$/
        } else if (/^update/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
        } else if (/^delete/.test(comm)) {
            if (!ORM.isInitialized)
                return reject(loginlog())
        }
        return reject("错误的语法！")
    })
}

(async () => {
    console.clear()
    const syshead = "  "
    console.log(syshead + blackBG(white("Copyright (c) Penyo. All rights reserved. ")))
    console.log(syshead + blue(`欢迎使用 PenyoDB 交互式解释器！`))
    console.log(syshead + blue(`您可以使用您熟悉的 SQL 来编写命令。\n`))

    let comm: string
    do {
        comm = (await blockingInput()).trim().toLowerCase()
        if (comm !== "quit") {
            console.log(italic(yellow("正在处理中......")))
            await grammarAnalyze(comm)
                .then(r => {
                    console.log("\x1b[1F\x1b[K" + italic(green(r)))
                })
                .catch(e => {
                    console.error("\x1b[1F\x1b[K" + italic(red(e)))
                })
        }
        else
            break
    } while (1)
    console.log("拜拜~ o(*￣▽￣*)ブ")
})()
