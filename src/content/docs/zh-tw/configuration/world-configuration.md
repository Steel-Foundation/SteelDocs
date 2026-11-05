---
title: 世界設定
description: SteelMC 伺服器 config/worlds.toml 所有世界設定選項的完整參考。
sidebar:
  order: 3
---

SteelMC 的[世界（World）](../../reference/terminology#world)設定透過位於 `config/worlds.toml` 的 TOML 檔案完成。本頁列出所有世界、[域（Domain）](../../reference/terminology#domain)、[世界生成器（World Generator）](../../reference/terminology#world-generator)以及儲存後端設定項。

## 基本設定

| 設定項                | 型別       | 預設值         | 說明                                                          |
| --------------------- | ---------- | -------------- | ------------------------------------------------------------- |
| `save_path`           | String     | `"saves"`      | 儲存[世界](../../reference/terminology#world)存檔的根目錄     |
| `seed`                | String     | `""`           | 世界生成種子碼（留空則隨機生成）                              |
| `default_gamemode`    | String     | `"survival"`   | 新玩家資料的預設遊戲模式                                      |
| `difficulty`          | String     | `"normal"`     | 新存檔資料的遊戲難度                                          |
| `storage.type`        | Identifier | `"steel:disk"` | 預設世界儲存後端                                              |
| `player_storage.type` | Identifier | `"steel:disk"` | 玩家資料儲存後端                                              |

`seed`、`default_gamemode`、`difficulty` 與 `storage` 的值會從根設定向[域（Domains）](../../reference/terminology#domain)繼承，再從域向各個世界（Worlds）繼承。同時也可以在任意層級單獨覆寫這些值，進而實現靈活的多世界配置。

合法的遊戲模式（`default_gamemode`）包括：`survival`（生存）、`creative`（創造）、`adventure`（冒險）和 `spectator`（旁觀）。
合法的遊戲難度（`difficulty`）包括：`peaceful`（和平）、`easy`（簡單）、`normal`（普通）和 `hard`（困難）。

:::caution
如果對 Steel 的專有術語感到陌生，請先閱讀下方說明。
:::
遺憾的是，Mojang 在其內部程式碼中對術語的使用並不一致，`World`、`level` 和 `map` 往往混用來指稱同一個概念。此外，Steel 原生內建了類似 [Multiverse](https://modrinth.com/plugin/multiverse-core) 的多世界隔離與管理能力。為了清楚無歧義地描述這套體系，Steel 引入了一個新概念： **域（Domain）**。
術語表還詳細解釋了下文會用到的[維度（Dimension）](../../reference/terminology#dimension)與[世界生成器（World Generator）](../../reference/terminology#world-generator)。

## 域（Domains）

伺服器至少需要宣告一個[域（Domain）](../../reference/terminology#domain)，且必須有且僅有一個域設為預設域（`default = true`）。

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| 設定項                              | 型別   | 預設值 | 說明                                                             |
| ----------------------------------- | ------ | ------ | ---------------------------------------------------------------- |
| `domains.<domain>.worlds`           | Array  | 無     |**【必填】** 該域下的[世界](../../reference/terminology#world)列表 |
| `domains.<domain>.default`          | bool   | `false`| 是否將該域設為預設域                                             |
| `domains.<domain>.seed`             | String | 繼承   | 覆寫該域的世界種子碼                                             |
| `domains.<domain>.default_gamemode` | String | 繼承   | 覆寫該域的預設遊戲模式                                           |
| `domains.<domain>.difficulty`       | String | 繼承   | 覆寫該域的遊戲難度                                               |
| `domains.<domain>.storage`          | Table  | 繼承   | 覆寫該域的儲存後端設定                                           |

域名稱必須是合法的 Minecraft 命名空間識別碼（Identifier Namespace）。`global` 為系統保留名稱，不可用作域名。

## 世界（Worlds）

每個[域（Domain）](../../reference/terminology#domain)下至少需要包含一個[世界（World）](../../reference/terminology#world)，且必須有且僅有一個預設世界。

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
storage.type = "steel:ram"
```

| 設定項                 | 型別       | 預設值 | 說明                                                                                              |
| ---------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------- |
| `name`                 | String     | 無     |**【必填】** 該世界在域內的名稱                                                                   |
| `generator`            | Identifier | 無     |**【必填】** 使用的[世界生成器](../../reference/terminology#world-generator)（見下一節可用列表）  |
| `default`              | bool       | `false`| 是否為目前域的預設世界                                                                            |
| `seed`                 | String     | 繼承   | 覆寫該世界的種子碼                                                                                |
| `default_gamemode`     | String     | 繼承   | 覆寫該世界的預設遊戲模式                                                                          |
| `difficulty`           | String     | 繼承   | 覆寫該世界的遊戲難度                                                                              |
| `storage`              | Table      | 繼承   | 覆寫該世界的儲存後端設定                                                                          |
| `nether_portal_target` | String     | 自動   | 該世界中的地獄傳送門指向的同域目標世界名稱                                                        |
| `end_portal_target`    | String     | 自動   | 非終界世界中的終界傳送門指向的同域終界維度世界名稱                                                |
| `config`               | Table      | `{}`   | 世界生成器專屬設定表                                                                              |

世界名稱必須是合法的識別碼路徑，不得包含 `/`，且在同一域內必須唯一。

## 傳送門目標（Portal Targets）

傳送門的目標世界始終在來源世界所屬的[域（Domain）](../../reference/terminology#domain)內部解析。若未明確設定目標世界，Steel 會自動採用原版慣例的世界名稱：

- 位於 `the_nether` 的地獄傳送門預設通往 `overworld`
- 位於任何其他世界的地獄傳送門預設通往 `the_nether`
- 位於非終界世界的終界傳送門預設通往 `the_end`
- 從終界維度世界透過終界傳送門返回時，使用實體或玩家的重生點資料，而非 `end_portal_target`

遵循原版慣例名稱時，標準的 `overworld`、`the_nether` 和 `the_end` 三世界組合無需額外設定即可自動互通。若你使用了自訂世界名稱，則需要明確指定傳送門目標：

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

傳送門目標欄位填寫的是域內世界名稱，而非完整的 `namespace:path` 識別碼。它們不能跨域指向其他域的世界、不能指向自身所在世界，且必須指向同一域內已宣告的世界。使用終界維度的世界不能設定 `end_portal_target`，且 `end_portal_target` 指向的目標世界必須使用終界維度生成器。

## 世界生成器（Generators）

Steel 內建了以下[世界生成器](../../reference/terminology#world-generator)：

| 生成器                 | 設定說明                         |
| ---------------------- | -------------------------------- |
| `minecraft:overworld`  | 不接受 `config` 設定表           |
| `minecraft:the_nether` | 不接受 `config` 設定表           |
| `minecraft:the_end`    | 不接受 `config` 設定表           |
| `minecraft:flat`       | 接受選用的超平坦世界設定表       |
| `steel:empty`          | 必須提供 `config.dimension_type` |

### Minecraft 原版世界生成器

`minecraft:overworld`、`minecraft:the_nether` 與 `minecraft:the_end` 這三個[生成器](../../reference/terminology#world-generator)無需額外設定，它們會為各自的[維度](../../reference/terminology#dimension)生成與原版特性相容的[世界](../../reference/terminology#world)。

### 超平坦世界生成器（Flat）

`minecraft:flat` [世界生成器](../../reference/terminology#world-generator)接受選用的 `config` 設定表。若省略，Steel 預設使用主世界[維度](../../reference/terminology#dimension)、原版經典超平坦方塊層（1 層基岩 + 2 層泥土 + 1 層草地）以及預設結構覆寫清單。

| 設定項                | 型別           | 預設值                       | 說明                                                             |
| --------------------- | -------------- | ---------------------------- | ---------------------------------------------------------------- |
| `layers[].block`      | Identifier     | 無                           |**【必填】** 該層使用的方塊 ID                                   |
| `layers[].height`     | Integer        | 無                           |**【必填】** 該層的方塊高度，必須大於 `0`                        |
| `dimension_type`      | Identifier     | `"minecraft:overworld"`      | 超平坦[世界](../../reference/terminology#world)使用的維度類型    |
| `layers`              | 方塊層表陣列   | 基岩 1、泥土 2、草地 1       | 由下而上依序生成的方塊層定義                                     |
| `features`            | Boolean        | `false`                      | 是否生成裝飾性特徵（目前 `true` 尚未實作）                       |
| `lakes`               | Boolean        | `false`                      | 是否生成湖泊（目前 `true` 尚未實作）                             |
| `structure_overrides` | Identifier 陣列| 要塞（strongholds）與村莊    | 允許在此超平坦世界中生成的結構列表                               |

預設方塊層為高度 `1` 的 `minecraft:bedrock`、高度 `2` 的 `minecraft:dirt` 與高度 `1` 的 `minecraft:grass_block`。
預設的 `structure_overrides` 為 `minecraft:strongholds` 和 `minecraft:villages`。

自訂方塊層可以使用重複表陣列（`[[...layers]]`）或行內（Inline）表陣列撰寫：

#### 重複表寫法

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

#### 行內表寫法

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

### 虛空世界生成器（Empty）

使用 `steel:empty` 虛空[世界生成器](../../reference/terminology#world-generator)時，必須在 `config` 中指定 `dimension_type`，用於決定該世界的[維度](../../reference/terminology#dimension)屬性（如建築高度上限與迷霧顏色）：

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

## 儲存後端（Storage）

Steel 內建了以下[世界](../../reference/terminology#world)儲存後端。儲存方式可以在全域、單個[域（Domain）](../../reference/terminology#domain)以及單個世界三個層級分別設定。例如，你可以將全域設為記憶體儲存，同時讓某一個域使用磁碟儲存持久化至硬碟，並在該域下的某一個特定世界裡單獨改回記憶體儲存，進而獲得極高的靈活性。

:::caution
記憶體儲存（`steel:ram`）意味著整個世界完全駐留在記憶體中且不會寫入磁碟，記憶體使用量可能會隨區塊探索迅速增長。通常建議在小遊戲伺服器中將 `steel:ram` 與 `steel:empty` 虛空[世界生成器](../../reference/terminology#world-generator)搭配使用。
:::

| 儲存後端     | 設定說明                                     |
| ------------ | -------------------------------------------- |
| `steel:disk` | 選用設定 `config.path`（相對於 `save_path`） |
| `steel:ram`  | 無需額外設定，區塊不會儲存至磁碟             |

玩家資料儲存（`player_storage`）同樣支援 `steel:disk` 和 `steel:ram`。設為 `steel:ram` 時，玩家資料不會寫入磁碟保存。

自訂磁碟存檔子路徑範例：

```toml
[[domains.minecraft.worlds]]
name = "testing"
generator = "minecraft:overworld"

[domains.minecraft.worlds.storage]
type = "steel:disk"

[domains.minecraft.worlds.storage.config]
path = "custom/testing"
```

## 設定範例

本節首先展示首次啟動伺服器時自動產生的預設設定；第二個範例則結合上述概念，展示包含三個[域](../../reference/terminology#domain)、不同遊戲模式、混合儲存設定與自訂[世界生成器](../../reference/terminology#world-generator)的進階設定。

### 預設基本設定

以下是 `worlds.toml` 的預設設定，用於建立一套標準的生存模式[世界](../../reference/terminology#world)：

```toml
# /config/worlds.toml

# 根層級預設設定，除非被覆寫，否則由所有域和世界繼承。
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

# 世界可以選用地設定同域下的 `nether_portal_target` 和
# `end_portal_target` 欄位，以覆寫原版慣例的世界名稱。
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

### 多域進階設定範例

以下範例展示了多域混合設定：`minecraft` [域](../../reference/terminology#domain)以及 `flat` 域中的 `the_nether` [世界](../../reference/terminology#world)儲存在磁碟上；`empty` 和 `minecraft` 域使用生存模式，而 `flat` 域使用創造模式。

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

## 啟動驗證規則

伺服器在啟動時會對世界設定進行嚴格驗證：

- 包含未知欄位的設定會被直接拒絕
- 至少需要宣告一個[域（Domain）](../../reference/terminology#domain)
- 必須有且僅有一個域設定 `default = true`
- 每個域必須至少宣告一個[世界（World）](../../reference/terminology#world)
- 每個域必須有且僅有一個預設世界（`default = true`）
- 域名稱必須是合法的命名空間識別碼
- 域名稱 `global` 為系統保留字，禁止使用
- 世界名稱必須是合法的識別碼路徑，且不得包含 `/`
- `save_path` 和儲存路徑必須是乾淨的相對路徑
- [世界生成器](../../reference/terminology#world-generator)與儲存後端必須是 Steel 已知的註冊類型
- `nether_portal_target` 和 `end_portal_target` 必須指向同域內已存在的其他世界，不能指向來源世界自身
- 不能在終界維度的世界上設定 `end_portal_target`
- `end_portal_target` 必須指向一個終界維度的世界
- `minecraft:flat` 至少需要包含一個方塊層（Layer），且目前暫未實作 `features = true` 或 `lakes = true`

若驗證失敗，伺服器將印出錯誤訊息並安全結束。
