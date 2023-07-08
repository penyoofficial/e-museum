import ORM from "./orm"

/** 陈列数据库。 */
export const show = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}

/** 创建数据库。 */
export const create = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}

/** 删除数据库。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}

/** 使用数据库。 */
export const use = async (orm: ORM, namespace: string) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}

/** 查看数据库名称。 */
export const select = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        if (!orm.state.user)
            reject("您尚未登录，无法访问数据库。")
        return reject("该功能目前不可用！")
    })
}