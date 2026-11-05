---
title: 权限管理命令 (/perms)
description: 使用 /perms 命令在线查询与管理 SteelMC 的权限规则、权限组、继承关系与元数据。
sidebar:
  order: 2
---

`/perms` 命令用于在服务器运行期间动态管理权限系统。它分为三个子作用域：

```text
/perms user <targets> <operation>
/perms group <group> <operation>
/perms groups <operation>
```

- `user`：管理玩家个人的直接权限覆盖规则与所属权限组分配。
- `group`：管理单个指定权限组的权限规则、优先级（Priority）、继承关系与元数据（Metadata）。
- `groups`：列出所有权限组，以及管理所有新老玩家默认获得的权限组（`default_groups`）。

本文档假定你已了解权限键、通配符、权限组与上下文选择器等概念。如果你对这些概念尚不熟悉，建议先阅读[权限配置](../../configuration/permissions)。

:::tip
在修改某个玩家或权限组之前，建议先执行查询命令。直接覆盖规则、组继承规则、上下文限定规则以及权限组优先级共同决定了最终生效结果，单纯看某一条配置可能并不代表最终结果。
:::

## 权限鉴权机制

`/perms` 的每一项子操作都有对应的细粒度命令权限。例如，查看玩家权限信息需要 `steel.command.perms.user.info`。除非某项子操作被更具体的拒绝规则（`deny`）禁用，否则授予根权限 `steel.command.perms` 即可解锁 `/perms` 的所有子操作。

此外，查看或修改受管数据还需要操作者具备对应的管理授权（Authority）：

| 管理授权键 | 作用说明 |
| --- | --- |
| `steel.permission.manage.<permission>` | 允许查看、检查（check）或修改指定权限键的规则 |
| `steel.permission.group.<group>` | 允许查看、分配或修改指定权限组 |
| `steel.permission.metadata` | 允许查看、检查或修改权限元数据（Metadata） |

管理授权同样支持通配符。例如，`steel.permission.manage.minecraft.command.*` 允许管理所有下属命令权限（如 `minecraft.command.give`），而 `steel.permission.manage.*` 则允许管理任意权限键；同理，`steel.permission.group.*` 允许管理所有权限组。

信息查询类命令会根据执行者拥有的管理授权自动过滤输出内容。例如，若执行者没有 `steel.permission.metadata` 权限，`user info` 输出中会自动隐藏元数据部分，并过滤掉执行者无权管理的规则与权限组。

后台控制台（Console）与 RCON 自动绕过上述所有玩家权限与管理授权检查。

## 查询当前权限设置

在动手修改权限前，建议先运行以下查询命令。

### 查看玩家权限信息

```text
/perms user <targets> info
```

展示目标玩家已分配的权限组、直接权限规则与直接元数据覆盖项。注意：该命令展示的是玩家档案上直接存储的配置，而非展开所有继承关系后的完整列表。

所需命令权限：`steel.command.perms.user.info`

输出内容会根据执行者的权限管理、组管理与元数据管理授权进行过滤。

```text
/perms user Steve info
```

### 检查玩家的最终生效权限

```text
/perms user <targets> check <permission_expr>
```

完整计算目标玩家在指定权限表达式下的最终生效结果（综合计算默认组、已分配组、个人直接覆盖、继承关系、组优先级与上下文），并报告最终胜出的规则及其来源，或者提示该权限未设置（Unset）。

所需命令权限：`steel.command.perms.user.check`

附加管理授权：针对所检查权限键的 `steel.permission.manage.<permission>`。

```text
/perms user Steve check minecraft.command.gamemode.creative
/perms user Steve check minecraft.command.gamemode{domain=lobby}
```

### 查看权限组详情

```text
/perms group <group> info
```

展示指定权限组的优先级、父权限组、允许规则（`allow`）、拒绝规则（`deny`）以及元数据。超出执行者管理授权范围的条目会被自动隐藏。

所需命令权限：`steel.command.perms.group.info`

附加管理授权：`steel.permission.group.<group>`。显示元数据还需 `steel.permission.metadata`，显示各条权限规则还需对应的 `steel.permission.manage.<permission>`。

```text
/perms group moderator info
```

### 列出所有权限组

```text
/perms groups list
```

列出执行者有权管理的所有权限组，并标出哪些组属于默认权限组（`default_groups`）。

所需命令权限：`steel.command.perms.groups.list`

仅显示在执行者 `steel.permission.group.<group>` 授权范围内的权限组。

## 管理玩家个人权限规则

权限表达式（`<permission_expr>`）由权限键加上可选的上下文选择器组成：

```text
<permission>{<context>=<value>,...}
```

完整语法与裁决规则请参阅[上下文规则](../../configuration/permissions#contextual-rules)。

### 允许某项权限（Allow）

```text
/perms user <targets> allow <permission_expr>
```

为目标玩家添加或替换一条完全匹配该键与上下文的直接允许规则。同一权限键在其他上下文下的规则不受影响。

所需命令权限：`steel.command.perms.user.allow`

附加管理授权：`steel.permission.manage.<permission>`。

```text
/perms user Steve allow minecraft.command.teleport
/perms user Steve allow minecraft.command.gamemode{domain=lobby}
```

### 拒绝某项权限（Deny）

```text
/perms user <targets> deny <permission_expr>
```

为目标玩家添加或替换一条完全匹配该键与上下文的直接拒绝规则。具体的拒绝规则可以覆盖宽泛的允许规则。

所需命令权限：`steel.command.perms.user.deny`

附加管理授权：`steel.permission.manage.<permission>`。

```text
/perms user Steve deny minecraft.command.gamemode.creative
```

### 移除个人直接规则（Unset）

```text
/perms user <targets> unset <permission_expr>
```

仅移除目标玩家身上具有相同权限键且上下文完全一致的直接规则。从权限组继承而来的规则不会被移除。

所需命令权限：`steel.command.perms.user.unset`

附加管理授权：`steel.permission.manage.<permission>`。

```text
/perms user Steve unset minecraft.command.gamemode{domain=lobby}
```

## 分配玩家所属权限组

### 为玩家添加权限组

```text
/perms user <targets> group add <group>
```

将指定权限组分配给目标玩家。如果玩家已经拥有该组，则不会产生任何变化。

所需命令权限：`steel.command.perms.user.group.add`

附加管理授权：`steel.permission.group.<group>`。

```text
/perms user Steve group add moderator
```

### 移除玩家的权限组

```text
/perms user <targets> group remove <group>
```

从目标玩家身上移除已分配的指定权限组。注意：这不会移除玩家通过 `default_groups` 默认组或组继承关系获得的权限组。

所需命令权限：`steel.command.perms.user.group.remove`

附加管理授权：`steel.permission.group.<group>`。

```text
/perms user Steve group remove moderator
```

## 管理权限组

### 创建或删除权限组

```text
/perms group <group> create
/perms group <group> delete
```

`create` 会创建一个空权限组；`delete` 会从权限组配置中删除该组。如果目标组是系统必需的 `op` 组、仍处于 `default_groups` 默认组列表中，或者仍被其他权限组继承，Steel 会拒绝删除——请先移除这些引用关系。

所需命令权限：`steel.command.perms.group.create` 与 `steel.command.perms.group.delete`。

附加管理授权：`steel.permission.group.<group>`。

```text
/perms group moderator create
/perms group retired-staff delete
```

### 允许、拒绝或移除权限组规则

```text
/perms group <group> allow <permission_expr>
/perms group <group> deny <permission_expr>
/perms group <group> unset <permission_expr>
```

`allow` 与 `deny` 用于在权限组上添加或替换指定规则；`unset` 仅移除该组上具有相同权限键与完全一致上下文的规则。

所需命令权限：

- `steel.command.perms.group.allow`
- `steel.command.perms.group.deny`
- `steel.command.perms.group.unset`

附加管理授权：同时需要 `steel.permission.group.<group>` 与 `steel.permission.manage.<permission>`。

```text
/perms group moderator allow minecraft.command.teleport
/perms group moderator deny minecraft.command.stop
/perms group moderator unset minecraft.command.teleport
```

### 修改权限组优先级

```text
/perms group <group> priority <priority>
```

设置该权限组的 32 位有符号整数优先级（当不同权限组中具有相同具体度的规则发生冲突时，优先级数值更大者胜出；具体度始终优先于组优先级）。

所需命令权限：`steel.command.perms.group.priority`

附加管理授权：`steel.permission.group.<group>`。

```text
/perms group moderator priority 10
```

## 管理权限组继承关系

### 列出父权限组

```text
/perms group <group> inherit list
```

列出该权限组的直接父权限组（超出执行者组管理授权的父组会被省略）。

所需命令权限：`steel.command.perms.group.inherit.list`

附加管理授权：`steel.permission.group.<group>`。

```text
/perms group moderator inherit list
```

### 添加或移除父权限组

```text
/perms group <group> inherit add <parent>
/perms group <group> inherit remove <parent>
```

添加或移除一条直接继承关系。如果添加继承会导致循环依赖，操作将被拒绝。继承而来的规则保留其原定义所在权限组的优先级。

所需命令权限：`steel.command.perms.group.inherit.add` 与 `steel.command.perms.group.inherit.remove`。

附加管理授权：同时需要 `steel.permission.group.<group>` 与 `steel.permission.group.<parent>`。

```text
/perms group moderator inherit add helper
/perms group moderator inherit remove helper
```

## 管理元数据（Metadata）

元数据表达式使用带命名空间的键名，并支持与权限表达式相同的可选上下文语法：

```text
<namespace>:<key>{<context>=<value>,...}
```

设置元数据值时需显式指定类型：`int`（整数）、`bool`（布尔值）或 `string`（字符串）。解析优先级规则请参阅[元数据配置说明](../../configuration/permissions#metadata)。

如果字符串值中包含空格，请使用英文双引号包裹：

```text
/perms user Steve metadata set string "Senior Builder" plugin:rank
```

### 设置玩家元数据

```text
/perms user <targets> metadata set int <value> <metadata_expr>
/perms user <targets> metadata set bool <value> <metadata_expr>
/perms user <targets> metadata set string <value> <metadata_expr>
```

为目标玩家设置直接元数据覆盖值（仅替换具有相同元数据键且上下文完全一致的条目）。

所需命令权限：`steel.command.perms.user.metadata.set`

附加管理授权：`steel.permission.metadata`。

```text
/perms user Steve metadata set int 5 plugin:max_homes
/perms user Steve metadata set string gold plugin:chat/color{domain=lobby}
```

### 检查玩家生效元数据

```text
/perms user <targets> metadata check <metadata_expr>
```

解析目标玩家在指定上下文下的最终生效元数据值（综合权限组元数据与个人覆盖项），并报告最终生效值的来源。

所需命令权限：`steel.command.perms.user.metadata.check`

附加管理授权：`steel.permission.metadata`。

```text
/perms user Steve metadata check plugin:max_homes{world=survival:overworld}
```

### 移除玩家元数据

```text
/perms user <targets> metadata unset <metadata_expr>
```

仅移除玩家个人身上具有相同键与完全一致上下文的直接元数据条目（从权限组继承的元数据不受影响）。

所需命令权限：`steel.command.perms.user.metadata.unset`

附加管理授权：`steel.permission.metadata`。

```text
/perms user Steve metadata unset plugin:max_homes
```

### 设置或移除权限组元数据

```text
/perms group <group> metadata set int <value> <metadata_expr>
/perms group <group> metadata set bool <value> <metadata_expr>
/perms group <group> metadata set string <value> <metadata_expr>
/perms group <group> metadata unset <metadata_expr>
```

在权限组上设置或移除精确匹配的元数据条目。如需查看权限组上已配置的元数据，请使用 `/perms group <group> info`（权限组没有单独的 `metadata check` 子命令）。

所需命令权限：`steel.command.perms.group.metadata.set` 与 `steel.command.perms.group.metadata.unset`。

附加管理授权：同时需要 `steel.permission.group.<group>` 与 `steel.permission.metadata`。

```text
/perms group vip metadata set int 10 plugin:max_homes
/perms group vip metadata unset plugin:max_homes
```

## 管理默认权限组（Default Groups）

```text
/perms groups default add <group>
/perms groups default remove <group>
```

向 `default_groups` 列表中添加或移除一个权限组。默认权限组会自动作用于每一位玩家。从默认组列表中移除某个组不会删除该权限组本身。

所需命令权限：`steel.command.perms.groups.default.add` 与 `steel.command.perms.groups.default.remove`。

附加管理授权：`steel.permission.group.<group>`。

```text
/perms groups default add member
/perms groups default remove member
```

## 持久化与离线玩家支持

对权限组的修改会自动写回 `config/groups.toml`；对玩家个人的修改会自动更新至 `<save_root>/global/player_permissions.toml`，并支持直接指定在线玩家、已知离线玩家或可通过服务端档案查询解析的玩家名称。

所有文件读写与档案解析均在后台异步完成，绝不会阻塞服务端主游戏刻（Game Tick）。命令执行会异步挂起直至持久化完成，随后向命令执行者返回操作结果反馈。
