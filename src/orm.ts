import * as ENC from './encryption'

/** 
 * 用户。
 * 
 * `User` 包含了名称、口令、全局权限和局部权限四个属性。
 * 其中，名称和口令必须在构造时指定；全局权限默认为 `Permission.INACCESSIBLE`；局部权限是优先于全局权限的“白名单”，默认为空值。
 */
export class User {
    /** 名称 */
    name: string
    /** 口令 */
    token: string
    /** 全局权限 */
    pmGlobal = Permission.INACCESSIBLE
    /** 局部权限 */
    pmLocal: TableUASummary[] = []

    constructor(name: string, token: string) {
        this.name = name
        this.token = token
    }

    /** 获取用户在指定表上的权限。 */
    getTablePermission(namespace: string, tname: string) {
        let tm: TableUASummary | null = null
        this.pmLocal.forEach(tuas => {
            if (namespace === tuas.namespace && tname === tuas.name)
                return tm = tuas
        })
        if (tm)
            return (tm as TableUASummary).permission
        else
            return this.pmGlobal
    }

    /** 设置用户在指定表上的权限。 */
    setTablePermission(namespace: string, tname: string, permission: Permission) {
        let flag = false
        this.pmLocal.forEach(tuas => {
            if (namespace === tuas.namespace && tname === tuas.name) {
                tuas.permission = permission
                return flag = true
            }
        })
        if (!flag)
            return this.pmLocal.push(new TableUASummary(namespace, tname, permission))
    }
}

/** 
 * 管理员。
 * 
 * `Admin` 是一种特殊的 `User`，这主要体现在其全局权限为**不可变**的 `Permission.DOMINATE`、局部权限为**不可变**的空值。
 * 且对于账户和数据库级别的部分操作，只有管理员可以执行。
 */
export class Admin extends User {
    /** 全局权限 */
    readonly pmGlobal = Permission.DOMINATE
    /** 局部权限 */
    readonly pmLocal: TableUASummary[] = []
}

/** 用户权限类型。 */
export enum Permission {
    /** 不可访问 */
    INACCESSIBLE = "inaccessible",
    /** 只读 */
    READONLY = "readonly",
    /** 完全控制 */
    DOMINATE = "dominate"
}

/** 获得 `Permission` 成员。 */
export const getPermission = (name: string) => {
    for (const p in Permission)
        if (Permission[p] === name)
            return name as Permission
    return null
}

/** 数据库。 */
export class Database {
    /** 名称 */
    name: string
    /** 当前库所包含的表 */
    tbs: Table[] = []

    constructor(name: string) {
        this.name = name
    }

    /** 根据名称获取表。 */
    getTable(name: string): Table | null {
        let tbm: Table | null = null
        this.tbs.forEach(t => {
            if (t.name === name)
                return tbm = t
        })
        return tbm
    }
}

/** 数据表。 */
export class Table {
    /** 名称 */
    name: string
    /** 列定义（列名，列类型） */
    cdef = new Map<string, SupportType>()
    /** 当前表所包含的记录（行 MD5，值） */
    rows = new Map<string, Unit[]>()

    constructor(name: string) {
        if (name)
            this.name = name
    }

    /** 检查表是否为逻辑空。 */
    isEmpty() {
        return this.rows.size === 0
    }

    /** 获取列名。 */
    getColumnNames() {
        let cnames: string[] = []
        this.cdef.forEach((v, k) => {
            cnames.push(k)
        })
        return cnames
    }

    /** 根据名称获取列类型。 */
    getColumnType(name?: string): SupportType | SupportType[] | null {
        let stm: SupportType | null = null
        let sta: SupportType[] = []
        this.cdef.forEach((v, k) => {
            if (name && k === name)
                return stm = v
            if (!name)
                sta.push(v)
        })
        return name ? stm : sta
    }

    /** 根据列名称获取视图。 */
    getColumn(names?: string[]) {
        let view = new View()
        this.cdef.forEach((v, k) => {
            if ((names as string[]).includes(k) || !names)
                view.cdef.set(k, v)
        })
        let rtemp = this.rows
        rtemp.forEach(v => {
            v.forEach(u => {
                if (!(names as string[]).includes(u.cname as string) && names)
                    v.splice(v.indexOf(u), 1)
            })
            view.rows.set(ENC.getSHA512(JSON.stringify(v)), v)
        })
        return view
    }

    /** 根据行筛选条件获取视图。 */
    getRow(condition?: string[]) {
        if (!condition)
            return this.getColumn()
        let view = new View()
        condition.forEach(c => {
            const paras = c.match(/^ ?(.+?) (=|<=|>=) (.+?) ?$/) as string[]
            // to be edited
        })
        return view
    }

    /** 获取表数据的易读形式。 */
    getDataValue() {
        let data: unknown[][] = []
        this.rows.forEach(v => {
            let row: unknown[] = []
            v.forEach(u => {
                row.push(u.value)
            })
            data.push(row)
        })
        return data
    }
}

/** 视图。 */
export class View extends Table {
    constructor() {
        super(`view_${ENC.getMD5(new Date().toISOString())}`)
    }

    /** 获得与另一个视图的交叉视图。 */
    getCrossedView(anotherView: View) {
        let cv = new View()
        // to be edited
        return cv
    }
}

/** 数据库所支持的数据类型。 */
export enum SupportType {
    /** 数值 */
    NUMBER = "number",
    /** 字符串 */
    STRING = "string",
    /** JavaScript 序列化字符串 */
    OBJECT = "object",
    /** 布尔值 */
    BOOLEAN = "boolean",
    /** 日期 */
    DATE = "date",
    /** 函数 */
    FUNCTION = "function"
}

/** 获得 `SupportType` 成员。 */
export const getSupportType = (name: string) => {
    for (const st in SupportType)
        if (SupportType[st] === name)
            return name as SupportType
    return null
}

/** 将类型名转化为包装类名。 */
export const getClassName = (classNickname: SupportType | string) => {
    return classNickname.toLowerCase().replace(/^\w/, char => {
        return char.toUpperCase()
    })
}

/** 数据单元。 */
export class Unit {
    /** 所属列名 */
    cname: string
    /** 值 */
    value: unknown | null = null

    constructor(cname: string, value?: unknown) {
        this.cname = cname
        if (value)
            this.value = value
    }
}

/** 数据表用户权限摘要。 */
export class TableUASummary {
    /** 表命名空间（所属数据库） */
    namespace: Database["name"]
    /** 表名称 */
    name: Table["name"]
    /** 表权限 */
    permission: Permission

    constructor(namespace: string, name: string, permission: Permission) {
        this.namespace = namespace
        this.name = name
        this.permission = permission
    }
}

/** 虚拟数据库。 */
export default class ORM {
    /** 线程锁 */
    private static isLocked = false
    /** 账户群 */
    static accounts: (User | Admin)[] = []
    /** 数据 */
    static data: Database[] = []
    /** 状态 */
    state: {
        /** 当前操作用户 */
        user: User | Admin | null
        /** 命名空间（正在操作的数据库） */
        namespace: Database["name"]
    } = {
            user: null,
            namespace: ""
        }

    constructor() {
        ORM.accounts.push(new Admin("root", "1234"))
        ORM.data.push(new Database("demo"))
    }

    /** 提交对 ORM 的更改到物理数据库。 */
    async synchronize() {
        this.lock("on")
        // to be edited
        this.lock("off")
    }

    /** 阻塞所有尝试修改 ORM 核心数据和提交修改的线程，除非线程锁未生效。 */
    async lock(action: "on" | "off") {
        if (action === "on") {
            while (ORM.isLocked)
                await new Promise(resolve => setTimeout(resolve, 100))
            ORM.isLocked = true
        }
        else
            ORM.isLocked = false
    }

    /** 根据名称获取用户。 */
    getUser(name: string): User | Admin | null {
        let um: User | Admin | null = null
        ORM.accounts.forEach(u => {
            if (u.name === name)
                return um = u
        })
        return um
    }

    /** 安全设置用户。 */
    setUser(user: User | Admin) {
        let flag = false
        this.lock("on")
        ORM.accounts.forEach(u => {
            if (u.name === user.name) {
                u = user
                return flag = true
            }
        })
        this.lock("off")
        return flag
    }

    /** 根据名称获取数据库。 */
    getDatabase(name: string): Database | null {
        let dbm: Database | null = null
        ORM.data.forEach(db => {
            if (db.name === name)
                return dbm = db
        })
        return dbm
    }

    /** 安全设置数据库。 */
    setDatabase(database: Database) {
        let flag = false
        this.lock("on")
        ORM.data.forEach(db => {
            if (db.name === database.name) {
                db = database
                return flag = true
            }
        })
        this.lock("off")
        return flag
    }
}