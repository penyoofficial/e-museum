import * as ENC from './encryption'

/** 用户。 */
export class User {
    /** 名称 */
    name: string
    /** 口令 */
    token: string
    /** 权限 */
    permission: Permission | TableUASummary[] = Permission.INACCESSIBLE

    constructor(name?: string, token?: string) {
        if (name)
            this.name = name
        if (name && token)
            this.token = token
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
    name: string
    /** 当前库所包含的表 */
    tbs: Table[] = []

    /** 根据名称获取表。 */
    getTable(name: string) {
        let tb: Table | null = null
        this.tbs.forEach(t => {
            if (t.name === name)
                return tb = t
        })
        return tb
    }
}

/** 数据表。 */
export class Table {
    /** 名称 */
    name: string
    /** 列定义（列名，列类型） */
    cdef = new Map<string, SupportType>()
    /** 当前表所包含的记录（行 MD5，值） */
    rows = new Map<string, Unit<unknown>[]>()

    /** 根据名称获取列类型。 */
    getColumnType(name: string) {
        let st: SupportType | null = null
        this.cdef.forEach((v, k) => {
            if (k === name)
                return st = v
        })
        return st
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
                if (!(names as string[]).includes(u.cname) && names)
                    v.splice(v.indexOf(u), 1)
            })
            view.rows.set(ENC.getMD5(JSON.stringify(v)), v)
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
    /** 获得两个视图的交叉视图。 */
    getCrossedView(v1: View, v2: View) {
        let cv = new View()
        // to be edited
        return cv
    }

    isEmpty() {
        return this.rows.size == 0
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
    cname: string
    /** 值 */
    value: T
}

/** 数据表用户权限摘要。 */
export class TableUASummary {
    /** 表命名空间（所属数据库） */
    namespace: Database["name"]
    /** 表名称 */
    name: Table["name"]
    /** 表权限 */
    permission: Permission = Permission.INACCESSIBLE
}

/** 虚拟数据库。 */
export default class ORM {
    /** 可用状态 */
    static isInitialized = false
    /** 线程锁 */
    static isLocked = false
    /** 账户群 */
    private static accounts: {
        /** 根管理员 */
        root: User
        users: User[]
    } = {
            root: new User("root"),
            users: []
        }
    /** 数据 */
    private static data: Database[] = []
    /** 状态 */
    state: {
        /** 当前操作用户 */
        user: User | null
        /** 命名空间（正在操作的数据库） */
        namespace: Database["name"] | undefined
    } = {
            user: null,
            namespace: undefined
        }

    constructor(name: string, token: string) {
        ORM.accounts.root = {
            name: "root",
            token: "1234",
            permission: Permission.DOMINATE
        }
        this.state.user = ORM.accounts.root
        this.state.namespace = ""
        if (this.state.user.name === name && this.state.user.token === token)
            ORM.isInitialized = true
    }

    /** 提交对 ORM 的更改到物理数据库，并重加密。 */
    static synchronize() {
        if (ORM.isInitialized) {
            // to be edited
            return
        }
        try {
            throw new Error("ORM 未初始化，所有类方法均不可用！")
        } catch (e) {
            console.error(e)
        }
    }

    /** 获取账户群。 */
    getAccounts() {
        if (ORM.isInitialized)
            return ORM.accounts
        try {
            throw new Error("ORM 未初始化，所有类方法均不可用！")
        } catch (e) {
            console.error(e)
        }
    }

    /** 根据名称获取用户。 */
    getUser(name: string) {
        const accounts = this.getAccounts() as {
            root: User
            users: User[]
        }
        let flag: User | null = null
        if (name === "root")
            return accounts.root
        accounts.users.forEach(u => {
            if (u.name === name)
                flag = u
        })
        return flag
    }

    /** 获取数据。 */
    getData() {
        if (ORM.isInitialized)
            return ORM.data
        try {
            throw new Error("ORM 未初始化，所有类方法均不可用！")
        } catch (e) {
            console.error(e)
        }
    }

    /** 根据名称获取数据库。 */
    getDatabase(name: string) {
        const database = this.getData() as Database[]
        let flag: Database | null = null
        database.forEach(db => {
            if (db.name === name)
                flag = db
        })
        return flag
    }
}