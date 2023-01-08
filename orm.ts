import * as ECC from './ecc-lite'

/** 用户。 */
interface User {
    /** 名称 */
    name: string
    /** 口令 */
    token: string
    /** 权限 */
    permission: Permission | {
        db: Map<Database["name"], Permission>
        tb: Map<Table["name"], Permission>[]
    }
}

/**
 * 用户权限类型。
*/
enum Permission {
    /** 不可访问 */
    INACCESSIBLE,
    /** 只读 */
    READONLY,
    /** 完全控制 */
    DOMINATE
}

/** 数据库。 */
interface Database {
    /** 名称 */
    name: string
    /** 当前库所包含的表 */
    tbs: Table[]
}

/** 数据表。 */
interface Table {
    /** 名称 */
    name: string
    /** 列定义（列名，列类型） */
    cdef: Map<string, SupportType>
    /** 当前表所包含的记录 */
    rows: Row[]
}

/** 数据库所支持的数据类型。 */
enum SupportType {
    /** 数值 */
    NUMBER,
    /** 二进制数值 */
    BINARY,
    /** 十六进制数值 */
    HEXDECIMAL,
    /** 字符串 */
    STRING,
    /** JavaScript 序列化字符串 */
    JSON,
    /** 布尔值 */
    BOOLEAN,
    /** 日期 */
    DATE,
    /** 计算属性 */
    COMPUTED,
    /** 函数 */
    FUNCTION
}

/** 数据记录。 */
interface Row {
    /** 校验码 */
    checkCode: string
    /** 值 */
    value: any
}

/** 虚拟数据库。 */
export default class ORM {
    /** 可用状态 */
    static isInitialized = false
    /** 线程锁 */
    static isLocked = false
    /** 账户群 */
    private static accounts: {
        /** 根管理员。只能从物理机上登录 */
        root: User | null
        users: User[]
    } = {
            root: null,
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

    constructor(name: string, token: string, ip?: string) {
        // L106-113 仅供开发使用，将来会被移除
        ip = "127.0.0.1"
        ORM.accounts.root = {
            name: "root",
            token: "1234",
            permission: Permission.DOMINATE
        }
        this.state.user = ORM.accounts.root
        this.state.namespace = ""
        if (this.state.user.name === name && this.state.user.token === token && ip === "127.0.0.1")
            ORM.isInitialized = true
    }

    /** 获取账户群。 */
    getAccounts() {
        if (ORM.isInitialized)
            return ORM.accounts
    }

    /** 获取数据。 */
    getData() {
        if (ORM.isInitialized)
            return ORM.data
    }
}