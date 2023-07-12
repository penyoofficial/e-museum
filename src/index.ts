import * as Model from './model'
import { AccountService, DatabaseService, TableService } from './service'

/** 当前实例可控的抽象数据库 */
let orm = new Model.ORM()

/** 解析 SQL-like 语句，并调用对应的 ORM 服务。 */
export async function grammarAnalyze(comm: string) {
    while (comm.includes("  "))
        comm = comm.replace("  ", " ")
    /** 切割参数串为便于取用的表或图。 */
    const cutPara = (paras: string, isKVPair?: boolean, kvSplitChar?: string) => {
        let paraArr = paras.split(",")
        let paraMap = new Map<string, string>()
        paraArr.forEach(p => {
            p = p.trim()
            if (isKVPair && kvSplitChar)
                paraMap.set(p.split(kvSplitChar)[0].trim(), p.split(kvSplitChar)[1].trim())
        })
        return isKVPair ? paraMap : paraArr
    }
    return new Promise(async (resolve, reject) => {
        if (/^ ?login/.test(comm)) {
            const commLogin = /^ ?login (.+?) with( token| password)? (.+?) ?;? ?$/
            if (commLogin.test(comm)) {
                const paras = comm.match(commLogin) as string[]
                const name = paras[1]
                const token = paras[3]
                if (commLogin.test(comm)) {
                    await AccountService.login(orm, name, token)
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
                await AccountService.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commShowDatabases.test(comm)) {
                await DatabaseService.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commShowTables.test(comm)) {
                await TableService.show(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?create/.test(comm)) {
            const commCreateUser = /^ ?create( user| admin) (.+?) with( token| password)? (.+?) ?;? ?$/
            const commCreateDatabase = /^ ?create database (.+?) ?;? ?$/
            const commCreateTable = /^ ?create table (.+?) ?\(( ?.+? .+? ?[,)]) ?;? ?$/
            if (commCreateUser.test(comm)) {
                const paras = comm.match(commCreateUser) as string[]
                const isAdmin = paras[1] === " user" ? false : true
                const name = paras[2]
                const token = paras[4]
                await AccountService.create(orm, isAdmin, name, token)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commCreateDatabase.test(comm)) {
                const paras = comm.match(commCreateDatabase) as string[]
                const name = paras[1]
                await DatabaseService.create(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commCreateTable.test(comm)) {
                const paras = comm.match(commCreateTable) as string[]
                const name = paras[1]
                const cdef = cutPara(paras[2].slice(0, -1), true, " ") as Map<string, string>
                await TableService.create(orm, name, cdef)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?drop/.test(comm)) {
            const commDropUser = /^ ?drop user (.+?) ?;? ?$/
            const commDropDatabase = /^ ?drop database (.+?) ?;? ?$/
            const commDropTable = /^ ?drop table (.+?) ?;? ?$/
            if (commDropUser.test(comm)) {
                const paras = comm.match(commDropUser) as string[]
                const name = paras[1]
                await AccountService.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commDropDatabase.test(comm)) {
                const paras = comm.match(commDropDatabase) as string[]
                const name = paras[1]
                await DatabaseService.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commDropTable.test(comm)) {
                const paras = comm.match(commDropTable) as string[]
                const name = paras[1]
                await TableService.drop(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?grant/.test(comm)) {
            const commGrant = /^ ?grant (.+?)( on (.+?\..+?))? to (.+?) ?;? ?$/
            if (commGrant.test(comm)) {
                const paras = comm.match(commGrant) as string[]
                const permission = paras[1]
                const tables = paras[3] ? cutPara(paras[3], true, ".") as Map<string, string> : undefined
                const userName = paras[4]
                await AccountService.grant(orm, permission, userName, tables)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?use/.test(comm)) {
            const commUse = /^ ?use (.+?) ?;? ?$/
            if (commUse.test(comm)) {
                const paras = comm.match(commUse) as string[]
                const namespace = paras[1]
                await DatabaseService.use(orm, namespace)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?select/.test(comm)) {
            const commSelectDatabase = /^ ?select database(\(\))? ?;? ?$/
            const commSelectRow = /^ ?select( distinct)? (.+?) from (.+?)( where (.+?))? ?;? ?$/
            if (commSelectDatabase.test(comm)) {
                await DatabaseService.select(orm)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            } else if (commSelectRow.test(comm)) {
                const paras = comm.match(commSelectRow) as string[]
                const needDistinct = paras[1] ? true : false
                const cnames = cutPara(paras[2]) as string[]
                const tnames = cutPara(paras[3]) as string[]
                const conditions = paras[5] ? cutPara(paras[5]) as string[] : undefined
                await TableService.select(orm, needDistinct, cnames, tnames, conditions)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?desc/.test(comm)) {
            const commDesc = /^ ?desc (.+?) ?;? ?$/
            if (commDesc.test(comm)) {
                const paras = comm.match(commDesc) as string[]
                const name = paras[1]
                await TableService.desc(orm, name)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?insert/.test(comm)) {
            const commInsert = /^ ?insert( into)? (.+?)( ?\(( ?.+? ?[,)]) ?)? values ?\(( ?.+? ?[,)]) ?;? ?$/
            if (commInsert.test(comm)) {
                const paras = comm.match(commInsert) as string[]
                const name = paras[2]
                const cnames = paras[4] ? cutPara(paras[4].slice(0, -1)) as string[] : undefined
                const values = cutPara(paras[5].slice(0, -1)) as string[]
                await TableService.insert(orm, name, values, cnames)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?update/.test(comm)) {
            const commUpdate = /^ ?update (.+?) set ( ?.+? ?= ?.+? ?)( where (.+?))? ?;? ?$/
            if (commUpdate.test(comm)) {
                const paras = comm.match(commUpdate) as string[]
                const name = paras[1]
                const values = cutPara(paras[2], true, "=") as Map<string, string>
                const conditions = paras[4] ? cutPara(paras[4]) as string[] : undefined
                await TableService.update(orm, name, values, conditions)
                    .then(r => {
                        return resolve(r)
                    })
                    .catch(e => {
                        return reject(e)
                    })
            }
        } else if (/^ ?delete/.test(comm)) {
            const commDelete = /^ ?delete from (.+?)( where (.+?))? ?;? ?$/
            if (commDelete.test(comm)) {
                const paras = comm.match(commDelete) as string[]
                const name = paras[1]
                const conditions = paras[3] ? cutPara(paras[3]) as string[] : undefined
                await TableService.del(orm, name, conditions)
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

/** 代理同步。 */
export function synchronize() {
    orm.synchronize()
} 