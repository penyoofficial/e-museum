# 欢迎使用 PenyoDB

PenyoDB 是一款基于 TypeScript 的 NoSQL 数据库，兼容部分 SQL 语法。

## 开始

PenyoDB 必须运行在 Node.js（*或 Deno*[^isDenoAvailable?]）上。

在项目目录下打开终端，输入：

```text
npm i
npm run dev
```

[^isDenoAvailable?]: 理论上项目也可以在 Deno 上运行，但未经测试。

## 模块设计

```mermaid
flowchart RL
    subgraph 核心模块
        index["index\n（Shell 式用户交互）"] -- 语义解析 --> uop["account/database/table\n（用户业务操作）"] -- 操作 ORM --> orm["orm\n（抽象数据库）"]
        orm -- 暴露成员 --> uop -- 回报 Promise --> index
    end
    subgraph 辅助模块
        index -.- ansi-sgr("ansi-sgr\n（Shell 样式）")
        orm -.- encryption("encryption\n（加密算法）")
    end
```
