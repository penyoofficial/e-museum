import ORM, { Admin, Database } from "./orm"

/** 陈列数据库。 */
export const show = async (orm: ORM) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        let dbNameList: string[] = []
        ORM.data.forEach(db => {
            dbNameList.push(db.name)
        })
        return resolve(dbNameList)
    })
}

/** 创建数据库。 */
export const create = async (orm: ORM, name: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以创建数据库。")
        if (orm.getDatabase(name))
            return reject(`操作失败！已有使用名称 ${name} 的数据库。`)
        let db = new Database(name)
        orm.lock("on")
        ORM.data.push(db)
        orm.lock("off")
        return resolve(`操作成功！数据库 ${name} 已被创建。`)
    })
}

/** 删除数据库。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以删除数据库。")
        if (!orm.getDatabase(name))
            return reject(`操作失败！无使用名称 ${name} 的数据库。`)
        if (orm.state.namespace === name)
            orm.state.namespace = ""
        orm.lock("on")
        ORM.data = ORM.data.filter(d => d.name !== name)
        orm.lock("off")
        return resolve(`操作成功！数据库 ${name} 已被删除。`)
    })
}

/** 使用数据库。 */
export const use = async (orm: ORM, namespace: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.getDatabase(namespace))
            return reject(`操作失败！无使用名称 ${namespace} 的数据库。`)
        orm.state.namespace = (orm.getDatabase(namespace) as Database).name
        return resolve(`操作成功！您已配置工作区为 ${namespace}。`)
    })
}

/** 查看数据库名称。 */
export const select = async (orm: ORM) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!orm.state.namespace)
            return reject("操作失败！您未配置任何工作区！")
        return resolve(orm.state.namespace)
    })
}