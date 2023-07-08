import ORM, { Admin, Permission, User, View } from "./orm"

/** 登录。 */
export const login = async (orm: ORM, name: string, token: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user) {
            const um = orm.getUser(name)
            if (um && um.token === token) {
                orm.state.user = um
                return resolve(`您好，${name}！`)
            }
            return reject("登录失败！用户名或密码错误。")
        }
    })
}

/** 陈列用户。 */
export const show = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            return reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}

/** 创建用户。 */
export const create = async (orm: ORM, isAdmin: boolean, name: string, token: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        if (!(orm.state.user instanceof Admin))
            return reject("创建失败！只有管理员才可以创建用户。")
        if (orm.getUser(name))
            return reject("创建失败！已有使用该用户名的账户。")
        orm.untilUnlock()
        ORM.isLocked = true
        if (isAdmin)
            ORM.accounts.push(new Admin(name, token))
        else
            ORM.accounts.push(new User(name, token))
        ORM.isLocked = false
        return resolve("创建成功！")
    })
}

/** 删除用户。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        if (!(orm.state.user instanceof Admin))
            return reject("删除失败！只有管理员才可以删除用户。")
        if (!orm.getUser(name))
            return reject("删除失败！无使用该用户名的账户。")
        orm.untilUnlock()
        ORM.isLocked = true
        ORM.accounts = ORM.accounts.filter(a => a.name !== name)
        ORM.isLocked = false
        return resolve("删除成功！")
    })
}

/** 授权用户。 */
export const grant = async (orm: ORM, permission: Permission, userName: string, namespace?: string, name?: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        if (!(orm.state.user instanceof Admin))
            return reject("授权失败！只有管理员才可以授权用户。")
        if (!orm.getUser(userName))
            return reject("授权失败！无使用该用户名的账户。")
        let user = orm.getUser(userName) as User | Admin
        if (!namespace || !name) {
            if (user instanceof Admin)
                return reject("管理员默认拥有全局完全控制权限，不可更改！")
            user.permission = permission
            return resolve(`授权成功！${userName} 现在拥有全局 ${permission} 权限！`)
        } else {
            user.setTablePermission(namespace, name, permission)
            return resolve(`授权成功！${userName} 现在在 ${namespace}.${name} 上拥有 ${permission} 权限！`)
        }
    })
}