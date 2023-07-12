import * as Model from './model'

/** 
 * `AccountService` 向用户提供了符合业务需要的账户级别服务。
 */
export namespace AccountService {
    /** 登录。 */
    export const login = async (orm: Model.ORM, name: string, token: string) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user) {
                const um = orm.getUser(name)
                if (um && um.token === token) {
                    orm.state.user = um
                    return resolve(`您好，${name}！`)
                }
                return reject("操作失败！用户名或密码错误。")
            }
        })
    }

    /** 陈列用户。 */
    export const show = async (orm: Model.ORM) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以陈列用户。")
            return resolve(Model.ORM.accounts)
        })
    }

    /** 创建用户。 */
    export const create = async (orm: Model.ORM, isAdmin: boolean, name: string, token: string) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以创建用户。")
            if (orm.getUser(name))
                return reject(`操作失败！已有使用名称 ${name} 的用户。`)
            await orm.lock("on")
            if (isAdmin)
                Model.ORM.accounts.push(new Model.Admin(name, token))
            else
                Model.ORM.accounts.push(new Model.User(name, token))
            orm.lock("off")
            return resolve(`操作成功！${isAdmin ? "管理员" : "用户"} ${name} 已被创建。`)
        })
    }

    /** 删除用户。 */
    export const drop = async (orm: Model.ORM, name: string) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以删除用户。")
            if (!orm.getUser(name))
                return reject(`操作失败！无使用名称 ${name} 的用户。`)
            await orm.lock("on")
            Model.ORM.accounts = Model.ORM.accounts.filter(a => a.name !== name)
            orm.lock("off")
            return resolve(`操作成功！用户 ${name} 已被删除。`)
        })
    }

    /** 授权用户。 */
    export const grant = async (orm: Model.ORM, permission: string, userName: string, tables?: Map<string, string>) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以授权用户。")
            if (!Model.getPermission(permission))
                return reject(`操作失败！无 ${permission} 类型的用户权限。`)
            if (!orm.getUser(userName))
                return reject(`操作失败！无使用名称 ${userName} 的用户。`)
            let user = orm.getUser(userName) as Model.User | Model.Admin
            if (user instanceof Model.Admin)
                return reject(`操作失败！${userName} 是管理员，恒拥有全局 ${Model.Permission.DOMINATE} 权限。`)
            if (!tables) {
                user.pmGlobal = permission as Model.Permission
                await orm.setUser(user)
                return resolve(`操作成功！${userName} 现在拥有全局 ${permission} 权限。`)
            } else {
                tables.forEach((v, k) => {
                    user.setTablePermission(k, v, permission as Model.Permission)
                })
                await orm.setUser(user)
                return resolve(`操作成功！${userName} 现在在指定表上拥有 ${permission} 权限。`)
            }
        })
    }
}

/** 
 * `DatabaseService` 向用户提供了符合业务需要的数据库级别服务。
 */
export namespace DatabaseService {
    /** 陈列数据库。 */
    export const show = async (orm: Model.ORM) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            let dbNameList: string[] = []
            Model.ORM.data.forEach(db => {
                dbNameList.push(db.name)
            })
            return resolve(dbNameList)
        })
    }

    /** 创建数据库。 */
    export const create = async (orm: Model.ORM, name: string) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以创建数据库。")
            if (orm.getDatabase(name))
                return reject(`操作失败！已有使用名称 ${name} 的数据库。`)
            let db = new Model.Database(name)
            await orm.lock("on")
            Model.ORM.data.push(db)
            orm.lock("off")
            return resolve(`操作成功！数据库 ${name} 已被创建。`)
        })
    }

    /** 删除数据库。 */
    export const drop = async (orm: Model.ORM, name: string) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以删除数据库。")
            if (!orm.getDatabase(name))
                return reject(`操作失败！无使用名称 ${name} 的数据库。`)
            if (orm.state.namespace === name)
                orm.state.namespace = ""
            await orm.lock("on")
            Model.ORM.data = Model.ORM.data.filter(d => d.name !== name)
            orm.lock("off")
            return resolve(`操作成功！数据库 ${name} 已被删除。`)
        })
    }

    /** 使用数据库。 */
    export const use = async (orm: Model.ORM, namespace: string) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.getDatabase(namespace))
                return reject(`操作失败！无使用名称 ${namespace} 的数据库。`)
            orm.state.namespace = (orm.getDatabase(namespace) as Model.Database).name
            return resolve(`操作成功！您已配置工作区为 ${namespace}。`)
        })
    }

    /** 查看数据库名称。 */
    export const select = async (orm: Model.ORM) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            return resolve(orm.state.namespace)
        })
    }
}

/** 
 * `TableService` 向用户提供了符合业务需要的表级别服务。
 */
export namespace TableService {
    /** 陈列表。 */
    export const show = async (orm: Model.ORM) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let tbNameList: string[] = []
            const db = orm.getDatabase(orm.state.namespace) as Model.Database
            db.tbs.forEach(t => {
                tbNameList.push(t.name)
            })
            return resolve(tbNameList)
        })
    }

    /** 陈列项。 */
    export const desc = async (orm: Model.ORM, name: string) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let cdefList: { field: string, type: string }[] = []
            const db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (!db.getTable(name))
                return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
            const tb = db.getTable(name) as Model.Table
            tb.cdef.forEach((v, k) => {
                cdefList.push({ field: k, type: v })
            })
            return resolve(cdefList)
        })
    }

    /** 创建表。 */
    export const create = async (orm: Model.ORM, name: string, cdef: Map<string, string>) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以创建表。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (db.getTable(name))
                return reject(`操作失败！已有使用名称 ${name} 的表在当前工作区。`)
            let t = new Model.Table(name)
            let vum = ""
            cdef.forEach((v, k) => {
                if (!Model.getSupportType(v))
                    return vum = v
                t.cdef.set(k, v as Model.SupportType)
            })
            if (vum)
                return reject(`操作失败！无 ${vum} 类型的支持类型。`)
            db.tbs.push(t)
            orm.setDatabase(db)
            return resolve(`操作成功！表 ${name} 已被创建。`)
        })
    }

    /** 删除表。 */
    export const drop = async (orm: Model.ORM, name: string) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!(orm.state.user instanceof Model.Admin))
                return reject("操作被拒绝！只有管理员才可以删除表。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (!db.getTable(name))
                return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
            db.tbs = db.tbs.filter(t => t.name !== name)
            orm.setDatabase(db)
            return resolve(`操作成功！表 ${name} 已被删除。`)
        })
    }

    /** 给表中列添加一行数据。 */
    export const insert = async (orm: Model.ORM, name: string, values: string[], cnames?: string[]) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (orm.state.user.getTablePermission(db.name, name) !== Model.Permission.DOMINATE)
                return reject("操作被拒绝！您的权限不足。")
            if (!db.getTable(name))
                return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
            let tb = db.getTable(name) as Model.Table
            if (cnames && values.length !== cnames.length || !cnames && values.length !== tb.cdef.size)
                return reject("操作失败！您的列数量与值数量不匹配。")
            const fullCNames = tb.getColumnNames()
            let cum = ""
            if (cnames)
                cnames.forEach(c => {
                    if (!fullCNames.includes(c))
                        return cum = c
                })
            if (cum)
                return reject(`操作失败！无使用名称 ${cum} 的列在表 ${name} 中。`)
            let units: Model.Unit[] = []
            for (let i = 0; i < tb.cdef.size; i++)
                units.push(new Model.Unit(fullCNames[i]))
            units.forEach(u => {
                if (cnames && cnames.includes(u.cname)) {
                    const vstr = values[cnames.indexOf(u.cname)]
                    u.value = `new ${Model.getClassName(tb.getColumnType(u.cname) as Model.SupportType)}("${vstr}")`
                }
            })
            tb.rows.set(Model.CryptoLite.getMD5(JSON.stringify(units)), units)
            db.setTable(tb)
            orm.setDatabase(db)
            return resolve("操作成功！")
        })
    }

    /** 修改表中列数据。 */
    export const update = async (orm: Model.ORM, name: string, values: Map<string, string>, conditions?: string[]) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (orm.state.user.getTablePermission(db.name, name) !== Model.Permission.DOMINATE)
                return reject("操作被拒绝！您的权限不足。")
            if (!db.getTable(name))
                return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
            let tb = db.getTable(name) as Model.Table
            const fullCNames = tb.getColumnNames()
            let cum = ""
            values.forEach((v, k) => {
                if (!fullCNames.includes(k))
                    return cum = k
            })
            if (cum)
                return reject(`操作失败！无使用名称 ${cum} 的列在表 ${name} 中。`)
            const view = tb.selectRow(conditions)
            view.rows.forEach(v => {
                v.forEach(u => {
                    const newValue = values.get(u.cname)
                    if (newValue) {
                        const type = tb.getColumnType(u.cname) as Model.SupportType
                        u.value = `new ${Model.getClassName(type)}("${newValue}")`
                    }
                })
            })
            tb.replace(view)
            db.setTable(tb)
            orm.setDatabase(db)
            return resolve("操作成功！")
        })
    }

    /** 删除表中列数据。 */
    export const del = async (orm: Model.ORM, name: string, conditions?: string[]) => {
        return new Promise(async (resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            if (orm.state.user.getTablePermission(db.name, name) !== Model.Permission.DOMINATE)
                return reject("操作被拒绝！您的权限不足。")
            if (!db.getTable(name))
                return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
            let tb = db.getTable(name) as Model.Table
            tb.matchAndErase(tb.selectRow(conditions))
            db.setTable(tb)
            orm.setDatabase(db)
            return resolve("操作成功！")
        })
    }

    /** 查询表中指定列数据。 */
    export const select = async (orm: Model.ORM, needDistinct: boolean, cnames: string[], tnames: string[], conditions?: string[]) => {
        return new Promise((resolve, reject) => {
            if (!orm.state.user)
                return reject("操作被拒绝！您尚未登陆。")
            if (!orm.state.namespace)
                return reject("操作失败！您未配置任何工作区！")
            let db = orm.getDatabase(orm.state.namespace) as Model.Database
            let tm = ""
            tnames.forEach(t => {
                if ((orm.state.user as Model.User | Model.Admin).getTablePermission(db.name, t) === Model.Permission.INACCESSIBLE)
                    return tm = t
            })
            if (tm)
                return reject("操作被拒绝！您的权限不足。")
            tm = ""
            tnames.forEach(t => {
                if (!db.getTable(t))
                    return tm = t
            })
            if (tm)
                return reject(`操作失败！无使用名称 ${tm} 的表在当前工作区。`)
            let views: Model.View[] = []
            let superView = new Model.View()
            let superViewData: unknown[] = []
            tnames.forEach(t => {
                let tb = db.getTable(t) as Model.Table
                let view = tb.selectColumn(cnames).selectRow(conditions)
                views.push(view)
            })
            let flag = true
            for (let i = 0; i < views.length - 1; i++)
                if (views[i].cdef !== views[i + 1].cdef)
                    flag = false
            views.forEach(v => {
                if (flag) {
                    superView.cdef = v.cdef
                    superView.rows = new Map([...superView.rows, ...v.rows])
                    superView.optimize()
                }
                if (!v.isEmpty())
                    superViewData.push(v.getDataValue())
            })
            if (needDistinct)
                return resolve(superView.getDataValue())
            return resolve(superViewData)
        })
    }
}