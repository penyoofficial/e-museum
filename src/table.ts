import { getMD5 } from "./encryption"
import ORM, { Admin, Database, Permission, SupportType, Table, Unit, User, getClassName, getSupportType } from "./orm"

/** 陈列表。 */
export const show = async (orm: ORM) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let tbNameList: string[] = []
        const db = orm.getDatabase(orm.state.namespace) as Database
        db.tbs.forEach(t => {
            tbNameList.push(t.name)
        })
        return resolve(tbNameList)
    })
}

/** 陈列项。 */
export const desc = async (orm: ORM, name: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let cdefList: { field: string, type: string }[] = []
        const db = orm.getDatabase(orm.state.namespace) as Database
        if (!db.getTable(name))
            return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
        const tb = db.getTable(name) as Table
        tb.cdef.forEach((v, k) => {
            cdefList.push({ field: k, type: v })
        })
        return resolve(cdefList)
    })
}

/** 创建表。 */
export const create = async (orm: ORM, name: string, cdef: Map<string, string>) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以创建表。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let db = orm.getDatabase(orm.state.namespace) as Database
        if (db.getTable(name))
            return reject(`操作失败！已有使用名称 ${name} 的表在当前工作区。`)
        let t = new Table(name)
        let vum = ""
        cdef.forEach((v, k) => {
            if (!getSupportType(v))
                return vum = v
            t.cdef.set(k, v as SupportType)
        })
        if (vum)
            return reject(`操作失败！无 ${vum} 类型的支持类型。`)
        db.tbs.push(t)
        orm.setDatabase(db)
        return resolve(`操作成功！表 ${name} 已被创建。`)
    })
}

/** 删除表。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以删除表。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let db = orm.getDatabase(orm.state.namespace) as Database
        if (!db.getTable(name))
            return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
        db.tbs = db.tbs.filter(t => t.name !== name)
        orm.setDatabase(db)
        return resolve(`操作成功！表 ${name} 已被删除。`)
    })
}

/** 给表中列添加一行数据。 */
export const insert = async (orm: ORM, name: string, values: string[], cnames?: string[]) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let db = orm.getDatabase(orm.state.namespace) as Database
        if (orm.state.user.getTablePermission(db.name, name) !== Permission.DOMINATE)
            return reject("操作被拒绝！您的权限不足。")
        if (!db.getTable(name))
            return reject(`操作失败！无使用名称 ${name} 的表在当前工作区。`)
        let tb = db.getTable(name) as Table
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
        let units: Unit[] = []
        for (let i = 0; i < tb.cdef.size; i++)
            units.push(new Unit(fullCNames[i]))
        units.forEach(u => {
            if (cnames && cnames.includes(u.cname)) {
                const vstr = values[cnames.indexOf(u.cname)]
                u.value = `new ${getClassName(tb.getColumnType(u.cname) as string)}("${vstr}")`
            }
        })
        tb.rows.set(getMD5(JSON.stringify(units)), units)
        return resolve("操作成功！")
    })
}

/** 修改表中列数据。 */
export const update = async (orm: ORM, name: string, values: Map<string, string>, conditions?: string[]) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        if (orm.state.user.getTablePermission(orm.state.namespace, name) !== Permission.DOMINATE)
            return reject("操作被拒绝！您的权限不足。")
        return reject("该功能目前不可用！")
    })
}

/** 删除表中列数据。 */
export const del = async (orm: ORM, name: string, conditions?: string[]) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        if (orm.state.user.getTablePermission(orm.state.namespace, name) !== Permission.DOMINATE)
            return reject("操作被拒绝！您的权限不足。")
        return reject("该功能目前不可用！")
    })
}

/** 查询表中指定列数据。 */
export const select = async (orm: ORM, needDistinct: boolean, cnames: string[], tnames: string[], conditions?: string[]) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        let tm = ""
        tnames.forEach(t => {
            if ((orm.state.user as User | Admin).getTablePermission(orm.state.namespace, t) === Permission.INACCESSIBLE)
                return tm = t
        })
        if (tm)
            return reject("操作被拒绝！您的权限不足。")
        // to be edited
        return reject("该功能目前不可用！")
    })
}