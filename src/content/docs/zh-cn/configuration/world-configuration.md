---
title: 世界配置
description: SteelMC 服务端 config/worlds.toml 所有世界配置项的完整参考。
sidebar:
  order: 3
---

SteelMC 的[世界（World）](../../reference/terminology#world)配置通过位于 `config/worlds.toml` 的 TOML 文件完成。本页列出所有世界、[域（Domain）](../../reference/terminology#domain)、[世界生成器（World Generator）](../../reference/terminology#world-generator)以及存储后端配置项。

## 基础设置

| 配置项                | 类型       | 默认值         | 说明                                                          |
| --------------------- | ---------- | -------------- | ------------------------------------------------------------- |
| `save_path`           | String     | `"saves"`      | 保存[世界](../../reference/terminology#world)存档的根目录     |
| `seed`                | String     | `""`           | 世界生成种子（留空则随机生成）                                |
| `default_gamemode`    | String     | `"survival"`   | 新玩家数据的默认游戏模式                                      |
| `difficulty`          | String     | `"normal"`     | 新存档数据的游戏难度                                          |
| `storage.type`        | Identifier | `"steel:disk"` | 默认世界存储后端                                              |
| `player_storage.type` | Identifier | `"steel:disk"` | 玩家数据存储后端                                              |

`seed`、`default_gamemode`、`difficulty` 与 `storage` 的值会从根配置向[域（Domains）](../../reference/terminology#domain)继承，再从域向各个世界（Worlds）继承。同时也可以在任意层级单独覆盖这些值，从而实现灵活的多世界配置。

合法的游戏模式（`default_gamemode`）包括：`survival`（生存）、`creative`（创造）、`adventure`（冒险）和 `spectator`（旁观）。
合法的游戏难度（`difficulty`）包括：`peaceful`（和平）、`easy`（简单）、`normal`（普通）和 `hard`（困难）。

:::caution
如果对 Steel 的专有概念感到陌生，请先阅读下方说明。
:::
遗憾的是，Mojang 在其内部代码中对术语的使用并不统一，`World`、`level` 和 `map` 往往混用来指代同一个概念。此外，Steel 原生内置了类似 [Multiverse](https://modrinth.com/plugin/multiverse-core) 的多世界隔离与管理能力。为了清晰无歧义地描述这套体系，Steel 引入了一个新概念： **域（Domain）**。
术语表还详细解释了下文会用到的[维度（Dimension）](../../reference/terminology#dimension)与[世界生成器（World Generator）](../../reference/terminology#world-generator)。

## 域（Domains）

服务端至少需要声明一个[域（Domain）](../../reference/terminology#domain)，且必须有且仅有一个域设为默认域（`default = true`）。

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| 配置项                              | 类型   | 默认值 | 说明                                                             |
| ----------------------------------- | ------ | ------ | ---------------------------------------------------------------- |
| `domains.<domain>.worlds`           | Array  | 无     |**【必填】** 该域下的[世界](../../reference/terminology#world)列表 |
| `domains.<domain>.default`          | bool   | `false`| 是否将该域设为默认域                                             |
| `domains.<domain>.seed`             | String | 继承   | 覆盖该域的世界种子                                               |
| `domains.<domain>.default_gamemode` | String | 继承   | 覆盖该域的默认游戏模式                                           |
| `domains.<domain>.difficulty`       | String | 继承   | 覆盖该域的游戏难度                                               |
| `domains.<domain>.storage`          | Table  | 继承   | 覆盖该域的存储后端配置                                           |

域名称必须是合法的 Minecraft 命名空间标识符（Identifier Namespace）。`global` 为系统保留名称，不可用作域名。

## 世界（Worlds）

每个[域（Domain）](../../reference/terminology#domain)下至少需要包含一个[世界（World）](../../reference/terminology#world)，且必须有且仅有一个默认世界。

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
storage.type = "steel:ram"
```

| 配置项                 | 类型       | 默认值 | 说明                                                                                              |
| ---------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------- |
| `name`                 | String     | 无     |**【必填】** 该世界在域内的名称                                                                   |
| `generator`            | Identifier | 无     |**【必填】** 使用的[世界生成器](../../reference/terminology#world-generator)（见下一节可用列表）  |
| `default`              | bool       | `false`| 是否为当前域的默认世界                                                                            |
| `seed`                 | String     | 继承   | 覆盖该世界的种子                                                                                  |
| `default_gamemode`     | String     | 继承   | 覆盖该世界的默认游戏模式                                                                          |
| `difficulty`           | String     | 继承   | 覆盖该世界的游戏难度                                                                              |
| `storage`              | Table      | 继承   | 覆盖该世界的存储后端配置                                                                          |
| `nether_portal_target` | String     | 自动   | 该世界中的下界传送门指向的同域目标世界名称                                                        |
| `end_portal_target`    | String     | 自动   | 非末地世界中的末地传送门指向的同域末地维度世界名称                                                |
| `config`               | Table      | `{}`   | 世界生成器专属配置表                                                                              |

世界名称必须是合法的标识符路径，不得包含 `/`，且在同一域内必须唯一。

## 传送门目标（Portal Targets）

传送门的目标世界始终在源世界所属的[域（Domain）](../../reference/terminology#domain)内部解析。如果未显式配置目标世界，Steel 会自动采用原版约定的世界名称：

- 位于 `the_nether` 的下界传送门默认通往 `overworld`
- 位于任何其他世界的下界传送门默认通往 `the_nether`
- 位于非末地世界的末地传送门默认通往 `the_end`
- 从末地维度世界通过末地传送门返回时，使用实体或玩家的重生点数据，而非 `end_portal_target`

遵循原版约定名称时，标准的 `overworld`、`the_nether` 和 `the_end` 三世界组合无需额外配置即可自动互通。如果你使用了自定义世界名称，则需要显式指定传送门目标：

```toml
[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld2"
generator = "minecraft:overworld"
default = true
nether_portal_target = "the_nether2"
end_portal_target = "the_end2"

[[domains.minecraft.worlds]]
name = "the_nether2"
generator = "minecraft:the_nether"
nether_portal_target = "overworld2"

[[domains.minecraft.worlds]]
name = "the_end2"
generator = "minecraft:the_end"
```

传送门目标字段填写的是域内世界名称，而非完整的 `namespace:path` 标识符。它们不能跨域指向其他域的世界、不能指向自身所在世界，且必须指向同一域内已声明的世界。使用末地维度的世界不能设置 `end_portal_target`，且 `end_portal_target` 指向的目标世界必须使用末地维度生成器。

## 世界生成器（Generators）

Steel 内置了以下[世界生成器](../../reference/terminology#world-generator)：

| 生成器                 | 配置说明                         |
| ---------------------- | -------------------------------- |
| `minecraft:overworld`  | 不接受 `config` 配置表           |
| `minecraft:the_nether` | 不接受 `config` 配置表           |
| `minecraft:the_end`    | 不接受 `config` 配置表           |
| `minecraft:flat`       | 接受可选的超平坦世界配置表       |
| `steel:empty`          | 必须提供 `config.dimension_type` |

### Minecraft 原版世界生成器

`minecraft:overworld`、`minecraft:the_nether` 与 `minecraft:the_end` 这三个[生成器](../../reference/terminology#world-generator)无需额外配置，它们会为各自的[维度](../../reference/terminology#dimension)生成与原版特性对齐的[世界](../../reference/terminology#world)。

### 超平坦世界生成器（Flat）

`minecraft:flat` [世界生成器](../../reference/terminology#world-generator)接受可选的 `config` 配置表。若省略，Steel 默认使用主世界[维度](../../reference/terminology#dimension)、原版经典超平坦方块层（1 层基岩 + 2 层泥土 + 1 层草方块）以及默认结构白名单。

| 配置项                | 类型           | 默认值                       | 说明                                                             |
| --------------------- | -------------- | ---------------------------- | ---------------------------------------------------------------- |
| `layers[].block`      | Identifier     | 无                           |**【必填】** 该层使用的方块 ID                                   |
| `layers[].height`     | Integer        | 无                           |**【必填】** 该层的方块厚度，必须大于 `0`                        |
| `dimension_type`      | Identifier     | `"minecraft:overworld"`      | 超平坦[世界](../../reference/terminology#world)使用的维度类型    |
| `layers`              | 方块层表数组   | 基岩 1、泥土 2、草方块 1     | 从底向上依次生成的方块层定义                                     |
| `features`            | Boolean        | `false`                      | 是否生成装饰性地物（目前 `true` 尚未实现）                       |
| `lakes`               | Boolean        | `false`                      | 是否生成湖泊（目前 `true` 尚未实现）                             |
| `structure_overrides` | Identifier 数组| 要塞（strongholds）与村庄    | 允许在该超平坦世界中生成的结构列表                               |

默认方块层为高度 `1` 的 `minecraft:bedrock`、高度 `2` 的 `minecraft:dirt` 与高度 `1` 的 `minecraft:grass_block`。
默认的 `structure_overrides` 为 `minecraft:strongholds` 和 `minecraft:villages`。

自定义方块层可以使用多段表数组（`[[...layers]]`）或内联表数组编写：

#### 多段表写法

```toml
[domains.dev]
default = true

[[domains.dev.worlds]]
name = "flat"
generator = "minecraft:flat"
default = true

[domains.dev.worlds.config]
features = false
lakes = false
structure_overrides = ["minecraft:villages"]

[[domains.dev.worlds.config.layers]]
block = "minecraft:bedrock"
height = 1

[[domains.dev.worlds.config.layers]]
block = "minecraft:grass_block"
height = 3
```

#### 内联表写法

```toml
[domains.flat]
default = true

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:blackstone", height = 2 },
  { block = "minecraft:netherrack", height = 1 }
]

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:end_stone", height = 3 }
]
```

### 虚空世界生成器（Empty）

使用 `steel:empty` 虚空[世界生成器](../../reference/terminology#world-generator)时，必须在 `config` 中指定 `dimension_type`，用于决定该世界的[维度](../../reference/terminology#dimension)属性（如建筑高度上限与迷雾颜色）：

```toml
[domains.empty]
default = true
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "void"
generator = "steel:empty"
default = true

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## 存储后端（Storage）

Steel 内置了以下[世界](../../reference/terminology#world)存储后端。存储方式可以在全局、单个[域（Domain）](../../reference/terminology#domain)以及单个世界三个层级分别设置。例如，你可以将全局设为内存存储，同时让某一个域使用磁盘存储持久化到硬盘，并在该域下的某一个特定世界里单独改回内存存储，从而获得极高的灵活性。

:::caution
内存存储（`steel:ram`）意味着整个世界完全驻留在内存中且不会写入磁盘，内存占用可能会随区块探索迅速增长。通常建议在小游戏服中将 `steel:ram` 与 `steel:empty` 虚空[世界生成器](../../reference/terminology#world-generator)搭配使用。
:::

| 存储后端     | 配置说明                                     |
| ------------ | -------------------------------------------- |
| `steel:disk` | 可选配置 `config.path`（相对于 `save_path`） |
| `steel:ram`  | 无需额外配置，区块不会保存到磁盘             |

玩家数据存储（`player_storage`）同样支持 `steel:disk` 和 `steel:ram`。设为 `steel:ram` 时，玩家数据不会落盘保存。

自定义磁盘存档子路径示例：

```toml
[[domains.minecraft.worlds]]
name = "testing"
generator = "minecraft:overworld"

[domains.minecraft.worlds.storage]
type = "steel:disk"

[domains.minecraft.worlds.storage.config]
path = "custom/testing"
```

## 配置示例

本节首先展示首次启动服务端时自动生成的默认配置；第二个示例则结合上述概念，展示包含三个[域](../../reference/terminology#domain)、不同游戏模式、混合存储设置与自定义[世界生成器](../../reference/terminology#world-generator)的进阶配置。

### 默认基础配置

以下是 `worlds.toml` 的默认配置，用于创建一套标准的生存模式[世界](../../reference/terminology#world)：

```toml
# /config/worlds.toml

# 根级默认配置，除非被覆盖，否则由所有域和世界继承。
save_path = "saves"
seed = ""
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:disk"

[domains.minecraft]
default = true

# 世界可以可选地设置同域下的 `nether_portal_target` 和
# `end_portal_target` 字段，以覆盖原版默认约定的世界名。
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"
```

### 多域进阶配置示例

以下示例展示了多域混合配置：`minecraft` [域](../../reference/terminology#domain)以及 `flat` 域中的 `the_nether` [世界](../../reference/terminology#world)保存在磁盘上；`empty` 和 `minecraft` 域使用生存模式，而 `flat` 域使用创造模式。

```toml
save_path = "saves"
seed = ""
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:disk"

[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"

[domains.flat]
default_gamemode = "creative"
storage.type = "steel:ram"

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:blackstone", height = 2 },
    { block = "minecraft:netherrack", height = 1 }
]
storage.type = "steel:disk"

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:end_stone", height = 3 }
]

[domains.empty]
default = false
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "empty"
default = true
generator = "steel:empty"

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## 启动校验规则

服务端在启动时会对世界配置进行严格校验：

- 包含未知字段的配置会被直接拒绝
- 至少需要声明一个[域（Domain）](../../reference/terminology#domain)
- 必须有且仅有一个域设置 `default = true`
- 每个域必须至少声明一个[世界（World）](../../reference/terminology#world)
- 每个域必须有且仅有一个默认世界（`default = true`）
- 域名必须是合法的命名空间标识符
- 域名 `global` 为系统保留字，禁止使用
- 世界名称必须是合法的标识符路径，且不得包含 `/`
- `save_path` 和存储路径必须是干净的相对路径
- [世界生成器](../../reference/terminology#world-generator)与存储后端必须是 Steel 已知的注册类型
- `nether_portal_target` 和 `end_portal_target` 必须指向同域内已存在的其他世界，不能指向源世界自身
- 不能在末地维度的世界上设置 `end_portal_target`
- `end_portal_target` 必须指向一个末地维度的世界
- `minecraft:flat` 至少需要包含一个方块层（Layer），且目前暂未实现 `features = true` 或 `lakes = true`

如果校验失败，服务端将输出错误提示并退出。
