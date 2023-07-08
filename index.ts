import { blackBG, white, blue, italic, yellow, green, red } from './ansi-sgr'
import { createInterface } from 'readline'
import ORM, { Permission, SupportType } from './orm'
import * as account from './account'
import * as database from './database'
import * as table from './table'

/** 当前实例可控的虚拟数据库 */
let orm = new ORM()

async function blockingInput(notice?: string) {
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

async function grammarAnalyze(comm: string) {
    while (comm.includes("  "))
        comm = comm.replace("  ", " ")
    /** 获得 `Permission` 成员。 */
    const getPermission = (name: string) => {
        const member: Permission = eval(`Permission[${name.toUpperCase()}]`)
        if (typeof member === "string" && member.length > 0)
            return member
        return Permission["INACCESSIBLE"]
    }
    /** 获得 `SupportType` 成员。 */
    const getSupportType = (name: string) => {
        const member: SupportType = eval(`SupportType[${name.toUpperCase()}]`)
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
            const commLogin = /^ ?login (.+?) with( token| password)? (.+?) ?;? ?$/
            if (commLogin.test(comm)) {
                const paras = comm.match(commLogin) as string[]
                const name = paras[1]
                const token = paras[3]
                if (commLogin.test(comm)) {
                    await account.login(orm, name, token)
                        .then(r => {
                            return resolve(r)
                        })
                        .catch(e => {
                            return reject(e)
                        })
                }
            }
        } else if (/^ ?show/.test(comm)) {
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
            const commCreateUser = /^ ?create( user| admin) (.+?) with token (.+?) ?;? ?$/
            const commCreateDatabase = /^ ?create database (.+?) ?;? ?$/
            const commCreateTable = /^ ?create table (.+?) ?\(( ?.+? .+? ?[,)]) ?;? ?$/
            if (commCreateUser.test(comm)) {
                const paras = comm.match(commCreateUser) as string[]
                const isAdmin = paras[1] == " user" ? false : true
                const name = paras[2]
                const token = paras[3]
                await account.create(orm, isAdmin, name, token)
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
            const commDropUser = /^ ?drop user (.+?) ?;? ?$/
            const commDropDatabase = /^ ?drop database (.+?) ?;? ?$/
            const commDropTable = /^ ?drop table (.+?) ?;? ?$/
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
            const commGrant = /^ ?grant (.+?)( on (.+?)\.(.+?))? to (.+?) ?;? ?$/
            if (commGrant.test(comm)) {
                const paras = comm.match(commGrant) as string[]
                const permission = paras[1]
                const namespace: string | undefined = paras[3]
                const name: string | undefined = paras[4]
                const userName = paras[5]
                await account.grant(orm, getPermission(permission), userName, namespace, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^use/.test(comm)) {
            const commUse = /^ ?use (.+?) ?;? ?$/
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
            const commSelectDatabase = /^ ?select database(\(\))? ?;? ?$/
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
                await table.select(orm, needDistinct, cutPara(cnames) as string[], cutPara(tnames) as string[], conditions ? cutPara(conditions) as string[] : undefined)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^desc/.test(comm)) {
            const commDesc = /^ ?desc (.+?) ?;? ?$/
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
            const commInsert = /^ ?insert( into)? (.+?)( ?\(( ?.+? ?[,)]) ?)? values ?\(( ?.+? ?[,)]) ?;? ?$/
            if (commInsert.test(comm)) {
                const paras = comm.match(commInsert) as string[]
                const name = paras[2]
                const cnames = paras[4] ? paras[4].slice(0, -1) : undefined
                const values = paras[5].slice(0, -1)
                await table.insert(orm, name, cutPara(values) as string[], cnames ? cutPara(cnames) as string[] : undefined)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^update/.test(comm)) {
            const commUpdate = /^ ?update (.+?) set ( ?.+? ?= ?.+? ?)( where (.+?))? ?;? ?$/
            if (commUpdate.test(comm)) {
                const paras = comm.match(commUpdate) as string[]
                const name = paras[1]
                const values = paras[2]
                const conditions = paras[4]
                await table.update(orm, name, cutPara(values) as string[], conditions ? cutPara(conditions) as string[] : undefined)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^delete/.test(comm)) {
            const commDelete = /^ ?delete from (.+?)( where (.+?))? ?;? ?$/
            if (commDelete.test(comm)) {
                const paras = comm.match(commDelete) as string[]
                const name = paras[1]
                const conditions = paras[3]
                await table.del(orm, name, conditions ? cutPara(conditions) as string[] : undefined)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        }
        return reject("错误的语法！")
    })
}

(async () => {
    console.clear()
    console.log("  " + blackBG(white("Copyright (c) Penyo. All rights reserved. ")))
    console.log("  " + blue(`欢迎使用 PenyoDB 交互式解释器！`))
    console.log("  " + blue(`您可以使用您熟悉的 SQL 来编写命令。\n`))

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
        } else {
            console.log(italic(yellow("正在处理中......")))
            await orm.synchronize()
            console.log("\x1b[1F\x1b[K" + "拜拜~ o(*￣▽￣*)ブ")
            break
        }
    } while (1)
})()