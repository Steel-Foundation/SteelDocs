---
title: 权限配置
description: 在 SteelMC 中配置命令权限、权限组、玩家独立覆盖规则与权限元数据（Metadata）。
sidebar:
  order: 4
---

SteelMC 的权限系统通过 `config/groups.toml` 进行配置，同时也支持在服务器运行期间使用 `/perms` 命令实时修改。

权限系统负责控制命令的执行权限、命令参数补全建议（Suggestions），以及下发给每个客户端的命令语法树。同一套系统还支持上下文感知规则（Contextual Rules）以及供服务端功能与插件使用的强类型元数据（Metadata）。

## 权限文件说明

Steel 使用两个权限配置文件：

| 文件路径 | 用途说明 |
| ---- | ------- |
| `config/groups.toml` | 服务端全局权限组与默认权限组定义 |
| `<save_root>/global/player_permissions.toml` | 玩家个人的所属权限组、直接权限覆盖规则与元数据 |

日常配置服务器权限策略时请编辑 `groups.toml`。玩家个人权限文件位于世界配置中 `save_path`（默认为 `saves`）下的 `global` 目录，由 Steel 和 `/perms` 命令自动管理；通常只有在服务端离线状态下进行数据恢复或批量迁移时才需要手动编辑该文件。

## 默认权限组

新创建的服务器默认包含两个权限组：`default` 与 `op`。由于 `default` 列在 `default_groups` 中，所有进服玩家都会自动获得 `default` 组权限；而必需的 `op` 组默认授予所有权限（`*`），并通过 `/op` 命令分配给管理员。

你可以通过 `[groups.<组名>]` 表添加自定义服务器角色组。每个权限组都可以包含允许/拒绝权限规则、元数据以及继承的父权限组。后文的[完整配置示例](#完整配置示例)展示了这些部分的组合方式。

:::caution
除非你希望服务器里的所有玩家都拥有全部管理员权限，否则切勿将 `op` 加入 `default_groups`。
:::

## 权限键（Permission Keys）

权限键是由点号（`.`）分隔的小写字符串：

```text
minecraft.command.give
steel.command.fly
plugin.region.build
```

:::caution
权限键语法有严格校验：每个分段只能包含小写 ASCII 字母、数字、`_` 和 `-`。不允许出现空分段或大写字母。
:::

通配符（`*`）仅允许作为最后一个分段出现：

| 权限键 | 匹配含义 |
| --- | ------- |
| `*` | 匹配所有权限 |
| `minecraft.command.*` | 匹配所有子级权限（例如 `minecraft.command.give`） |
| `minecraft.command.give` | 仅精确匹配该权限键本身 |

注意：`minecraft.command.*` 会匹配 `minecraft.command.give`，但 **不会** 匹配 `minecraft.command` 本身。

:::note
通配符仅匹配下级子节点。如果某个系统在父节点与子节点两个层级都定义了有意义的权限，请同时授予 `minecraft.command` 和 `minecraft.command.*`。
:::

## 命令权限

绝大多数内置命令会自动遵循以下权限键格式：

```text
<命名空间>.command.<命令名>
```

常见示例：

| 命令 | 对应权限键 |
| ------- | ---------- |
| `/give` | `minecraft.command.give` |
| `/fly` | `steel.command.fly` |
| `/tp` 与 `/teleport` | `minecraft.command.teleport` |
| `/xp` 与 `/experience` | `minecraft.command.experience` |
| `/perms` | `steel.command.perms` |

默认向全员开放的命令（例如 `/list`）在未显式配置权限时即可直接使用，但你仍然可以通过显式添加 `deny`（拒绝）规则来禁用它。

部分命令还提供了更细粒度的子命令或参数值权限。例如，`/tick freeze` 既可以通过授予顶层的 `minecraft.command.tick` 解锁，也可以只授予细粒度的 `minecraft.command.tick.freeze`。

`/gamemode` 支持按目标游戏模式细分权限：

| 允许的操作 | 对应权限键 |
| ------ | ---------- |
| 切换为任意游戏模式 | `minecraft.command.gamemode` |
| 仅限切换为生存模式 | `minecraft.command.gamemode.survival` |
| 仅限切换为创造模式 | `minecraft.command.gamemode.creative` |
| 仅限切换为冒险模式 | `minecraft.command.gamemode.adventure` |
| 仅限切换为旁观模式 | `minecraft.command.gamemode.spectator` |

宽泛的父级允许规则会授予所有子动作权限，但更具体的子级拒绝规则（`deny`）可以覆盖它。例如，在 `allow` 中添加 `minecraft.command.gamemode` 并在 `deny` 中添加 `minecraft.command.gamemode.creative`，即可允许切换除创造模式以外的所有游戏模式。

## 权限组配置

权限组定义在 `[groups.<组名>]` 表下：

```toml
[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
]
deny = [
  "minecraft.command.stop",
]
metadata = []
```

权限组名称必须符合合法的权限分段规则：仅限小写字母、数字、`_` 和 `-`。

### 权限组继承（Group Inheritance）

权限组可以继承其他权限组的权限规则与元数据：

```toml
[groups.helper]
priority = 5
inherits = []
allow = ["minecraft.command.teleport"]
deny = []
metadata = []

[groups.moderator]
priority = 10
inherits = ["helper"]
allow = ["minecraft.command.gamemode.spectator"]
deny = []
metadata = []
```

`moderator` 组的成员会同时获得这两项权限。注意：继承自 `helper` 的传送权限规则依然保留 `helper` 组自身的优先级 `5`，而不会变成 `moderator` 组的优先级 `10`。

继承关系具有传递性，且每个被继承的权限组最多生效一次。如果存在循环继承或引用了不存在的权限组，配置校验将直接报错。

<a id="contextual-rules"></a>

### 上下文规则（Contextual Rules）

权限规则与元数据规则均可附带上下文选择器（Context Selectors）：

```toml
[groups.builder]
priority = 5
inherits = []
allow = [
  "plugin.region.build{world=lobby:spawn,plugin:region=market}",
  "minecraft.command.gamemode{domain=lobby}",
]
deny = [
  "minecraft.command.gamemode.creative{world=lobby:spawn}",
]
metadata = []
```

内置上下文键：

| 上下文键 | 示例 | 生效范围 |
| ------- | ------- | ------- |
| `domain` | `domain=lobby` | 仅在指定的[域（Domain）](../../reference/terminology#domain)内生效 |
| `world` | `world=lobby:spawn` | 仅在指定的已加载[世界（World）](../../reference/terminology#world)内生效 |

插件或服务端子系统还可以提供自定义上下文键。虽然不带命名空间的键（如 `region=spawn`）也是合法的，但对于插件自定义的上下文，推荐使用带命名空间的键（如 `plugin:region=spawn`）。

多个上下文选择器之间为逻辑与（AND）关系：

```text
plugin.region.build{world=lobby:spawn,plugin:region=market}
```

:::caution
上下文语法有严格校验，同一个上下文键在一个表达式中只能出现一次。

`world=lobby:spawn` 本身就已经包含了 `lobby` 域信息，因此会自动匹配限定在 `domain=lobby` 的上下文，无需重复书写。如果同时写出了两者，域名必须一致，否则像 `{domain=survival,world=lobby:spawn}` 这样冲突的表达式会被判定为非法。

上下文值不能为空，且不能包含空白字符、`{`、`}`、`,` 或 `=`。域名遵循 Minecraft 命名空间语法，世界则必须写为 `<域名>:<世界名>` 格式。
:::

上下文的具体度（Specificity）按累加计算：全局规则的具体度最低；每个 `domain` 或自定义选择器增加 `1` 级具体度；而 `world` 选择器因为同时确定了域和已加载的世界，会增加 `2` 级具体度。因此，同时匹配多个选择器的规则比只匹配单个选择器的规则具有更高的优先级。

<a id="metadata"></a>

## 元数据（Metadata）

元数据（Metadata）是采用与权限相同的组继承与上下文模型进行解析的强类型键值对，支持布尔值（Boolean）、整数（Integer）或字符串（String）：

```toml
[groups.vip]
priority = 20
inherits = []
allow = []
deny = []
metadata = [
  { key = "plugin:homes", value = 10 },
  { key = "plugin:homes{domain=lobby}", value = 3 },
  { key = "plugin:chat/color", value = "gold" },
  { key = "plugin:can_fly", value = true },
]
```

元数据键必须是带命名空间的标识符（例如 `plugin:homes` 或 `plugin:chat/color`）。某个键的值具体代表什么含义，由定义该键的插件或子系统决定：例如，家园插件可以将上述规则解析为“常规情况下最多可设置 10 个家，但在 `lobby` 域内最多只能设置 3 个家”。Steel 负责存储并按上下文解析这些元数据值，但不会仅仅因为写了这些示例键就自动内置家园、聊天颜色或飞行功能。

元数据解析仅考虑键名完全一致的条目。当存在多条匹配当前上下文的条目时，Steel 按以下先后顺序决定最终生效的值：

1. 上下文最具体的条目优先。
2. 当上下文具体度相同时，直接设置在玩家个人身上的值优先于权限组的值。
3. 当同为权限组的值且具体度相同时，所属权限组优先级（`priority`）更高的值优先。
4. 若以上全部相同，则取有效元数据集合中的最后一条记录。

与权限不同，元数据没有允许/拒绝（Allow/Deny）状态，且元数据键不支持通配符匹配。设置元数据值只会替换具有相同元数据键且上下文完全一致的条目；移除时也只会删除该精确匹配的条目。同一个元数据键的全局值与带上下文的值可以并存。

## 权限冲突裁决顺序

未配置的权限默认视为拒绝（Deny）。当多条权限规则同时匹配时，Steel 按以下优先级顺序选出最终生效的规则：

1. **权限键更具体者优先** （例如精确权限键优先于 `*` 通配符）。
2. **上下文更具体者优先**（例如指定了 `world` 的规则优先于全局规则）。
3.**当具体度相同时，玩家个人直接覆盖规则优先于权限组规则**。
4.**当同为权限组规则且具体度相同时，权限组 `priority` 更高者优先**。
5.**若以上全部相同，拒绝（`deny`）优先于允许（`allow`）** 。

这意味着一条具体的拒绝规则可以轻松覆盖一条宽泛的允许规则：

```toml
[groups.staff]
priority = 10
inherits = []
allow = ["minecraft.command.*"]
deny = ["minecraft.command.stop"]
metadata = []
```

该组内的管理员可以使用绝大多数 Minecraft 原版命令，但无法执行 `/stop` 关服。

## 完整配置示例

以下配置为小型服务器提供了一个实用的权限起点：

```toml
default_groups = ["default"]

[groups.default]
priority = 0
inherits = []
allow = []
deny = []
metadata = []

[groups.vip]
priority = 5
inherits = []
allow = []
deny = []
metadata = [
  { key = "example_homes:max", value = 5 },
  { key = "example_chat:color", value = "gold" },
]

[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
  "minecraft.command.tick.freeze",
]
deny = []
metadata = []

[groups.op]
priority = 0
inherits = []
allow = ["*"]
deny = []
metadata = []
```

- 所有玩家默认获得 `default` 组。
- 将 `vip` 组分配给需要享受插件权益的玩家。
- 将 `moderator` 组分配给需要执行日常巡查命令的协管员。
- `/op` 命令会为目标玩家分配必需的 `op` 组，默认授予全部权限。

注：上例中的 `example_homes:max` 与 `example_chat:color` 仅为格式演示，只有当你安装了读取这些键的插件或子系统时才会实际生效。请将它们替换为你实际安装的插件所支持的元数据键。

## 运行时权限管理命令

在服务器运行期间，可以使用 `/perms` 命令随时查询与修改权限配置，其基本语法为：

```text
/perms <user|group|groups> ...
```

在进行修改前，可以先用以下命令查看当前权限状态：

```text
/perms user <目标玩家> info
/perms group <权限组名> info
/perms groups list
```

这些命令会展示玩家的个人权限设置、权限组的规则与继承关系，以及当前所有可用的权限组。关于每个子命令的详细用法、所需权限与示例，请参阅[权限管理命令](../../commands/permissions)。

## OP 管理员（Operators）

`/op <目标玩家>` 与 `/deop <目标玩家>` 底层直接由这套权限系统驱动：

- `/op` 会为玩家添加 `op` 权限组。
- `/deop` 会移除玩家的 `op` 权限组。
- 默认的 `op` 权限组授予了 `*`（全部权限）。
- `op` 权限组是系统必需组，无法通过 `/perms` 删除。

目标玩家可以是当前在线玩家、曾经进过服的离线玩家，或是服务端能够解析出档案的任意玩家名称。

## 客户端命令语法树同步

玩家客户端只会收到其有权限使用的命令节点，这会直接影响：

- 客户端命令语法树中可见的命令
- 客户端 Tab 键自动补全
- 服务端动态命令参数建议（Suggestions）
- 客户端 `F3 + F4` 游戏模式切换器可用性

后台控制台（Console）与 RCON 始终绕过权限检查，拥有最高执行权限。
