import ORM, { SupportType } from "./orm"

/** 陈列表。 */
export const show = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 陈列项 */
export const desc = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 创建表。 */
export const create = async (orm: ORM, name: string, cdef: Map<string, SupportType>) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 删除表。 */
export const drop = async (orm: ORM, name: string) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 给表中全部列添加数据。 */
export const insert = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 修改表中指定列数据。 */
export const update = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 删除表中指定列数据。 */
export const del = async (orm: ORM) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}

/** 查询表中指定列数据。 */
export const select = async (orm: ORM, needDistinct: boolean, cnames: string[], tnames: string[], conditions?: string[]) => {
    return new Promise<string>((resolve, reject) => {
        return reject("该功能目前不可用！")
    })
}