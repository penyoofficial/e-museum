import * as ENC from './encryption'

/** 用户。 */
export class User {
    /** 名称 */
    name: string = `user_${ENC.getMD5(new Date().toISOString())}`
    /** 口令 */
    token: string = "1234"
    /** 权限 */
    permission: Permission | TableUASummary[] = Permission.INACCESSIBLE

    constructor(name?: string, token?: string) {
        if (name)
            this.name = name
        if (name && token)
            this.token = token
    }

    /** 获取用户在指定表上的权限。 */
    getTablePermission(namespace: string, tname: string) {
        if ((this.permission as Permission) in Permission)
            return this.permission as Permission
        let tm: TableUASummary | null = null
        if (this.permission?.[0] instanceof TableUASummary)
            (this.permission as TableUASummary[]).forEach(tuas => {
                if (namespace === tuas.namespace && tname === tuas.name)
                    return tm = tuas
            })
        if (!tm)
            return Permission.INACCESSIBLE
        return tm
    }

    /** 设置用户在指定表上的权限。 */
    setTablePermission(namespace: string, tname: string, permission: Permission) {

    }
}

/** 管理员。 */
export class Admin extends User {
    /** 权限 */
    readonly permission = Permission.DOMINATE

    constructor(name: string, token: string) {
        super(name, token)
    }
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

/** 数据库。 */
export class Database {
    /** 名称 */
    name: string = `database_${ENC.getMD5(new Date().toISOString())}`
    /** 当前库所包含的表 */
    tbs: Table[] = []

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
    name: string = `table_${ENC.getMD5(new Date().toISOString())}`
    /** 列定义（列名，列类型） */
    cdef = new Map<string, SupportType>()
    /** 当前表所包含的记录（行 MD5，值） */
    rows = new Map<string, Unit<unknown>[]>()

    /** 根据名称获取列类型。 */
    getColumnType(name: string): SupportType | null {
        let stm: SupportType | null = null
        this.cdef.forEach((v, k) => {
            if (k === name)
                return stm = v
        })
        return stm
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
}

/** 视图。 */
export class View extends Table {
    /** 名称 */
    name: string = `view_${ENC.getMD5(new Date().toISOString())}`

    /** 获得与另一个视图的交叉视图。 */
    getCrossedView(anotherView: View) {
        let cv = new View()
        // to be edited
        return cv
    }

    /** 检查视图是否为逻辑空。 */
    isEmpty() {
        return this.rows.size == 0
    }

    /** 转换为控制台视图。 */
    toConsoleView() {

    }
}

/** 数据库所支持的数据类型。 */
export enum SupportType {
    /** 数值 */
    NUMBER = "number",
    /** 二进制数值 */
    BINARY = "binary",
    /** 十六进制数值 */
    HEXDECIMAL = "hexdecimal",
    /** 字符串 */
    STRING = "string",
    /** JavaScript 序列化字符串 */
    JSON = "json",
    /** 布尔值 */
    BOOLEAN = "boolean",
    /** 日期 */
    DATE = "date",
    /** 计算属性 */
    COMPUTED = "computed",
    /** 函数 */
    FUNCTION = "function"
}

/** 数据单元。 */
export class Unit<T> {
    /** 所属列名 */
    cname: string | undefined = undefined
    /** 值 */
    value: T | null = null
}

/** 数据表用户权限摘要。 */
export class TableUASummary {
    /** 表命名空间（所属数据库） */
    namespace: Database["name"] | undefined = undefined
    /** 表名称 */
    name: Table["name"] | undefined = undefined
    /** 表权限 */
    permission: Permission = Permission.INACCESSIBLE
}

/** 虚拟数据库。 */
export default class ORM {
    /** 线程锁 */
    static isLocked = false
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
    }

    /** 提交对 ORM 的更改到物理数据库。 */
    async synchronize() {
        await this.untilUnlock()
        // to be edited
    }

    /** 阻塞所有尝试修改 ORM 核心数据和提交修改的线程，除非线程锁未生效。 */
    async untilUnlock() {
        while (ORM.isLocked)
            await new Promise(resolve => setTimeout(resolve, 100))
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

    /** 根据名称设置用户。 */
    setUser(name: string, user: User | Admin) {
        let flag = false
        ORM.accounts.forEach(u => {
            if (u.name === name) {
                u = user
                return flag = true
            }
        })
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

    /** 根据名称设置数据库。 */
    setDatabase(name: string, database: Database) {
        let flag = false
        ORM.data.forEach(db => {
            if (db.name === name) {
                db = database
                return flag = true
            }
        })
        return flag
    }
}