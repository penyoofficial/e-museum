import * as fs from 'fs'
import * as path from 'path'
import { CryptoLite } from './crypto-lite'
export { CryptoLite }

/** 
 * `User` 包含了名称、口令、全局权限和局部权限四个属性。
 * 其中，名称和口令必须在构造时指定；全局权限默认为 `Permission.INACCESSIBLE`；局部权限是优先于全局权限的“白名单”，默认为空。
 * 
 * *用户（User）是控制 ORM 的基本实体。*
 * *任何预设的安全控制 ORM 的函数/方法都会先检查用户的状态（state）。*
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

    constructor(name: string, token: string, pm?: [Permission, TableUASummary[]]) {
        this.name = name
        this.token = token
        if (pm)
            this.pmGlobal = pm[0], this.pmLocal = pm[1]
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
 * `Admin` 的全局权限和局部权限均不可变，前者为 `Permission.DOMINATE`、后者为空。
 * 这确保了管理员恒不在权限问题上受阻。
 * 且对于账户和数据库级别的部分服务，只有管理员可以执行。
 * 
 * *管理员（Admin）本质上是一种特殊的用户（User）。*
 */
export class Admin extends User {
    /** 全局权限 */
    readonly pmGlobal = Permission.DOMINATE
    /** 局部权限 */
    readonly pmLocal: TableUASummary[] = []

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

/** 获得 `Permission` 成员。 */
export const getPermission = (name: string) => {
    for (const p in Permission)
        if (Permission[p] === name)
            return name as Permission
    return null
}

/** 
 * `Database` 是业务数据的一级载体，主要由 `Table` 线性表组成。
 */
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

    /** 设置表。 */
    setTable(tb: Table) {
        let flag = false
        this.tbs.forEach(t => {
            if (t.name === tb.name) {
                t = tb
                return flag = true
            }
        })
        return flag
    }
}

/** 
 * `Table` 是业务数据的二级载体，逻辑形式上类似一份二维表格，主要由列定义和 `Unit` 散列线性表组成。
 */
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

    /** 根据列名称获取视图。 */
    selectColumn(names?: string[]) {
        if (names && names[0] === "*") {
            let view = new View()
            view.cdef = this.cdef
            view.rows = this.rows
            return view
        }
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
            view.rows.set(CryptoLite.getSHA512(JSON.stringify(v)), v)
        })
        return view
    }

    /** 根据行筛选条件获取视图。 */
    selectRow(conditions?: string[]) {
        if (!conditions)
            return this.selectColumn()
        const reg = /^ ?(.+?) ?(=|<=|>=|<|>) ?(.+?) ?$/
        /** 确定一行是否符合条件。 */
        const cdMatch = (row: Unit[], condition: string) => {
            let flag = false
            const paras = condition.match(reg) as string[]
            row.forEach(u => {
                if (u.cname === paras[1] && eval(`${u.value}${paras[2]}${paras[3]}`))
                    return flag = true
            })
            return flag
        }
        let vcs: string[] = []
        conditions.forEach(c => {
            if (reg.test(c))
                vcs.push(c)
        })
        let view = new View()
        view.cdef = this.cdef
        this.rows.forEach((v, k) => {
            vcs.forEach(c => {
                if (cdMatch(v, c))
                    view.rows.set(k, v)
            })
        })
        return view
    }

    /** 以**出自自身**的视图替换表本体。 */
    replace(v: View) {
        this.rows.forEach((oUnits, oMD5) => {
            v.rows.forEach((nUnits, nMD5) => {
                if (oMD5 === nMD5)
                    oUnits.forEach(oU => {
                        nUnits.forEach(nU => {
                            if (oU.cname === nU.cname)
                                oU.value = nU.value
                        })
                    })
            })
        })
        this.optimize()
    }

    /** 以**出自自身**的视图消除表本体。 */
    matchAndErase(v: View) {
        this.rows.forEach((oUnits, oMD5) => {
            v.rows.forEach((nUnits, nMD5) => {
                if (oMD5 === nMD5)
                    oUnits.forEach(oU => {
                        nUnits.forEach(nU => {
                            if (oU.cname === nU.cname)
                                oU.value = null
                        })
                    })
            })
        })
        this.optimize()
    }

    /** 重新计算行校验、移除全部空行和重复行。 */
    optimize() {
        let delKeys: string[] = []
        this.rows.forEach((v, k) => {
            let isEmpty = true
            v.forEach(u => {
                if (u.value)
                    isEmpty = false
            })
            if (isEmpty)
                return delKeys.push(k)
            const md5 = CryptoLite.getMD5(JSON.stringify(v))
            if (this.rows.get(md5))
                delKeys.push(k)
            this.rows.set(md5, v)
        })
        delKeys.forEach(k => {
            this.rows.delete(k)
        })
    }
}

/** 
 * `View` 一般做 `Table` 的被修改的副本，一致性校验会被冻结。
 * 
 * *视图（View）本质上是一种特殊的表（Table）。*
 */
export class View extends Table {
    constructor() {
        super(`view_${CryptoLite.getMD5(new Date().toISOString())}`)
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
export const getClassName = (st: SupportType) => {
    return st.toLowerCase().replace(/^\w/, char => {
        return char.toUpperCase()
    })
}

/** 
 * `Unit` 是业务数据的原子载体，若干 `Unit` 组合成行（row），若干行组合成 `Table`。
 */
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

/** 
 * `TableUASummary` 着重关注用户在特定表上的权限，一般做 `User` 局部权限（pmLocal）表的元素。
 */
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

/** 
 * `ORM` 将数据库的整体情况、参与者和业务数据从物理层抽象出来，避免了操作数据库时频繁进行 IO 操作的损耗。
 * 
 * *抽象数据库（ORM）在被应用前，必须已产生至少一个实例，这使抽象数据库能够从本地读取数据并初始化。*
 * *为了核验参与者的状态（state），抽象数据库所有的方法都不是静态的。*
 */
export class ORM {
    /** 线程锁 */
    private static lockPromise = Promise.resolve()
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
        /** 查询文件。 */
        const selectFile = (dirPath: string) => {
            const fileContents = new Map<string, string>()
            if (!fs.existsSync(dirPath))
                return fileContents
            const files = fs.readdirSync(dirPath, "utf8")
            for (const file of files) {
                const filePath = path.join(dirPath, file)
                const stats = fs.statSync(filePath)
                if (stats.isFile()) {
                    const content = fs.readFileSync(filePath, "utf8")
                    fileContents.set(file, content)
                } else if (stats.isDirectory()) {
                    const subDirContents = selectFile(filePath)
                    subDirContents.forEach((content, fileName) => {
                        fileContents.set(path.join(file, fileName), content)
                    })
                }
            }
            return fileContents
        }
        /** 查询文件夹。 */
        const selectFolder = (dirPath: string) => {
            let directories: string[] = []
            if (!fs.existsSync(dirPath))
                return directories
            const filesAndDirectories = fs.readdirSync(dirPath, "utf8")
            for (const item of filesAndDirectories) {
                const itemPath = path.join(dirPath, item)
                const stats = fs.statSync(itemPath)
                if (stats.isDirectory()) {
                    directories.push(itemPath)
                    const subDirectories = selectFolder(itemPath)
                    directories.push(...subDirectories)
                }
            }
            return directories
        }
        const oPath = path.join(__dirname, "../data")
        const accountsPath = path.join(oPath, "./#SYSTEM#/accounts")
        selectFile(accountsPath).forEach((v, k) => {
            if (k === "admins.bin") {
                const admins = JSON.parse(CryptoLite.fromBinary(v)) as Admin[]
                admins.forEach(a => {
                    if (a.pmGlobal === Permission.DOMINATE && a.pmLocal.length === 0)
                        ORM.accounts.push(new Admin(a.name, a.token))
                })
            }
            else if (k === "users.bin") {
                const users = JSON.parse(CryptoLite.fromBinary(v)) as User[]
                users.forEach(u => {
                    ORM.accounts.push(new User(u.name, u.token, [u.pmGlobal, u.pmLocal]))
                })
            }
        })
        const dataPath = path.join(oPath, "./#USER#")
        selectFolder(dataPath).forEach(db => {
            const dbObj = new Database(path.basename(db))
            selectFile(db).forEach(v => {
                dbObj.tbs.push(JSON.parse(CryptoLite.fromBinary(v)) as Table)
            })
            ORM.data.push(dbObj)
        })
        if (!ORM.accounts.length) {
            ORM.accounts.push(new Admin("root", "1234"))
            setTimeout(() => {
                console.warn("未发现任何用户可用，已自动为您创建了管理员 root，口令为 1234。")
                console.warn("请尽快创建您的管理员账户，并将默认账户删除！")
            }, 233)
        }
    }

    /** 阻塞所有尝试修改 ORM 核心数据和提交修改的线程，除非线程锁未生效。 */
    async lock(action: "on" | "off") {
        if (action === "on") {
            await ORM.lockPromise
            ORM.lockPromise = new Promise((resolve) => {
                resolve()
            })
        } else
            ORM.lockPromise = Promise.resolve()
    }

    /** 提交对 ORM 的更改到物理数据库。 */
    async synchronize() {
        /** 清除文件夹。 */
        const dropFolder = (folderPath: string) => {
            if (fs.existsSync(folderPath)) {
                fs.readdirSync(folderPath).forEach((file) => {
                    const curPath = path.join(folderPath, file)
                    if (fs.lstatSync(curPath).isDirectory())
                        dropFolder(curPath)
                    else
                        fs.unlinkSync(curPath)
                })
                fs.rmdirSync(folderPath)
            }
        }
        /** 创建文件夹。 */
        const createFolder = (path: string) => {
            fs.mkdirSync(path, { recursive: true })
        }
        /** 创建文件。 */
        const createFile = (path: string, content: string) => {
            fs.writeFileSync(path, content, "utf8")
        }
        await this.lock("on")
        const oPath = path.join(__dirname, "../data")
        dropFolder(oPath)
        const accountsPath = path.join(oPath, "./#SYSTEM#/accounts")
        createFolder(accountsPath)
        let admins: Admin[] = [], users: User[] = []
        ORM.accounts.forEach(a => {
            if (a instanceof Admin)
                admins.push(a)
            else
                users.push(a)
        })
        createFile(path.join(accountsPath, `./admins.bin`), CryptoLite.toBinary(JSON.stringify(admins)))
        createFile(path.join(accountsPath, `./users.bin`), CryptoLite.toBinary(JSON.stringify(users)))
        const dataPath = path.join(oPath, "./#USER#")
        ORM.data.forEach(db => {
            const dbPath = path.join(dataPath, db.name)
            createFolder(dbPath)
            db.tbs.forEach(tb => {
                createFile(path.join(dbPath, `./${tb.name}.bin`), CryptoLite.toBinary(JSON.stringify(tb)))
            })
        })
        this.lock("off")
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
    async setUser(user: User | Admin) {
        let flag = false
        await this.lock("on")
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
    async setDatabase(database: Database) {
        let flag = false
        await this.lock("on")
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