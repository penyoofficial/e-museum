import ORM, { User, Admin, Permission, getPermission } from "./orm"

/** 登录。 */
export const login = async (orm: ORM, name: string, token: string) => {
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
export const show = async (orm: ORM) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以陈列用户。")
        return resolve(ORM.accounts)
    })
}

/** 创建用户。 */
export const create = async (orm: ORM, isAdmin: boolean, name: string, token: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以创建用户。")
        if (orm.getUser(name))
            return reject(`操作失败！已有使用名称 ${name} 的用户。`)
        orm.lock("on")
        if (isAdmin)
            ORM.accounts.push(new Admin(name, token))
        else
            ORM.accounts.push(new User(name, token))
        orm.lock("off")
        return resolve(`操作成功！${isAdmin ? "管理员" : "用户"} ${name} 已被创建。`)
    })
}

/** 删除用户。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以删除用户。")
        if (!orm.getUser(name))
            return reject(`操作失败！无使用名称 ${name} 的用户。`)
        orm.lock("on")
        ORM.accounts = ORM.accounts.filter(a => a.name !== name)
        orm.lock("off")
        return resolve(`操作成功！用户 ${name} 已被删除。`)
    })
}

/** 授权用户。 */
export const grant = async (orm: ORM, permission: string, userName: string, tables?: Map<string, string>) => {
    return new Promise((resolve, reject) => {
        if (!orm.state.user)
            return reject("操作被拒绝！您尚未登陆。")
        if (!(orm.state.user instanceof Admin))
            return reject("操作被拒绝！只有管理员才可以授权用户。")
        if (!getPermission(permission))
            return reject(`操作失败！无 ${permission} 类型的用户权限。`)
        if (!orm.getUser(userName))
            return reject(`操作失败！无使用名称 ${userName} 的用户。`)
        let user = orm.getUser(userName) as User | Admin
        if (user instanceof Admin)
            return reject(`操作失败！${userName} 是管理员，恒拥有全局 ${Permission.DOMINATE} 权限。`)
        if (!tables) {
            user.pmGlobal = permission as Permission
            orm.setUser(user)
            return resolve(`操作成功！${userName} 现在拥有全局 ${permission} 权限。`)
        } else {
            tables.forEach((v, k) => {
                user.setTablePermission(k, v, permission as Permission)
            })
            orm.setUser(user)
            return resolve(`操作成功！${userName} 现在在指定表上拥有 ${permission} 权限。`)
        }
    })
}