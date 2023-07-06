import ORM, { Permission } from "./orm"

/** 陈列用户。 */
export const show = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 创建用户。 */
export const create = async (orm: ORM, name: string, token: string) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 删除用户。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 授权用户。 */
export const grant = async (orm: ORM, permission: Permission, userName: string, namespace?: string, name?: string) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}