---
title: 世界設定
description: SteelMC 伺服器 config/worlds.toml 所有世界設定選項嘅完整參考。
sidebar:
  order: 3
---

SteelMC 嘅[世界（World）](../../reference/terminology#world)設定透過位於 `config/worlds.toml` 嘅 TOML 檔案完成。本頁列出所有世界、[域（Domain）](../../reference/terminology#domain)、[世界生成器（World Generator）](../../reference/terminology#world-generator)以及儲存後端設定項。

## 基本設定

| 設定項                | 類型       | 預設值         | 說明                                                          |
| --------------------- | ---------- | -------------- | ------------------------------------------------------------- |
| `save_path`           | String     | `"saves"`      | 保存[世界](../../reference/terminology#world)存檔嘅根目錄     |
| `seed`                | String     | `""`           | 世界生成種子碼（留空則隨機生成）                              |
| `default_gamemode`    | String     | `"survival"`   | 新玩家數據嘅預設遊戲模式                                      |
| `difficulty`          | String     | `"normal"`     | 新存檔數據嘅遊戲難度                                          |
| `storage.type`        | Identifier | `"steel:disk"` | 預設世界儲存後端                                              |
| `player_storage.type` | Identifier | `"steel:disk"` | 玩家數據儲存後端                                              |

`seed`、`default_gamemode`、`difficulty` 與 `storage` 嘅值會由根設定向[域（Domains）](../../reference/terminology#domain)繼承，再由域向各個世界（Worlds）繼承。同時亦可以喺任意層級單獨覆寫呢啲值，從而實現靈活嘅多世界配置。

合法嘅遊戲模式（`default_gamemode`）包括：`survival`（生存）、`creative`（創造）、`adventure`（冒險）同 `spectator`（旁觀）。
合法嘅遊戲難度（`difficulty`）包括：`peaceful`（和平）、`easy`（簡單）、`normal`（普通）同 `hard`（困難）。

:::caution
如果對 Steel 嘅專有術語感到陌生，請先閱讀下方說明。
:::
遺憾嘅係，Mojang 喺佢內部程式碼入面對於術語嘅使用並唔統一，`World`、`level` 同 `map` 往往混用嚟指代同一個概念。此外，Steel 原生內置咗類似 [Multiverse](https://modrinth.com/plugin/multiverse-core) 嘅多世界隔離與管理能力。為咗清晰無歧義咁描述呢套體系，Steel 引入咗一個新概念： **域（Domain）**。
術語表仲詳細解釋咗下文會用到嘅[維度（Dimension）](../../reference/terminology#dimension)與[世界生成器（World Generator）](../../reference/terminology#world-generator)。

## 域（Domains）

伺服器至少需要聲明一個[域（Domain）](../../reference/terminology#domain)，而且必須有且僅有一個域設為預設域（`default = true`）。

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| 設定項                              | 類型   | 預設值 | 說明                                                             |
| ----------------------------------- | ------ | ------ | ---------------------------------------------------------------- |
| `domains.<domain>.worlds`           | Array  | 無     |**【必填】** 該域下嘅[世界](../../reference/terminology#world)列表 |
| `domains.<domain>.default`          | bool   | `false`| 是否將該域設為預設域                                             |
| `domains.<domain>.seed`             | String | 繼承   | 覆寫該域嘅世界種子碼                                             |
| `domains.<domain>.default_gamemode` | String | 繼承   | 覆寫該域嘅預設遊戲模式                                           |
| `domains.<domain>.difficulty`       | String | 繼承   | 覆寫該域嘅遊戲難度                                               |
| `domains.<domain>.storage`          | Table  | 繼承   | 覆寫該域嘅儲存後端設定                                           |

域名稱必須係合法嘅 Minecraft 命名空間標識符（Identifier Namespace）。`global` 為系統保留名稱，唔可以用作域名。

## 世界（Worlds）

每個[域（Domain）](../../reference/terminology#domain)下至少需要包含一個[世界（World）](../../reference/terminology#world)，而且必須有且僅有一個預設世界。

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
storage.type = "steel:ram"
```

| 設定項                 | 類型       | 預設值 | 說明                                                                                              |
| ---------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------- |
| `name`                 | String     | 無     |**【必填】** 該世界喺域內嘅名稱                                                                   |
| `generator`            | Identifier | 無     |**【必填】** 使用嘅[世界生成器](../../reference/terminology#world-generator)（見下一節可用列表）  |
| `default`              | bool       | `false`| 是否為目前域嘅預設世界                                                                            |
| `seed`                 | String     | 繼承   | 覆寫該世界嘅種子碼                                                                                |
| `default_gamemode`     | String     | 繼承   | 覆寫該世界嘅預設遊戲模式                                                                          |
| `difficulty`           | String     | 繼承   | 覆寫該世界嘅遊戲難度                                                                              |
| `storage`              | Table      | 繼承   | 覆寫該世界嘅儲存後端設定                                                                          |
| `nether_portal_target` | String     | 自動   | 該世界中嘅下界傳送門指向嘅同域目標世界名稱                                                        |
| `end_portal_target`    | String     | 自動   | 非末地世界中嘅末地傳送門指向嘅同域末地維度世界名稱                                                |
| `config`               | Table      | `{}`   | 世界生成器專屬設定表                                                                              |

世界名稱必須係合法嘅標識符路徑，唔可以包含 `/`，而且喺同一域內必須唯一。

## 傳送門目標（Portal Targets）

傳送門嘅目標世界始終喺來源世界所屬嘅[域（Domain）](../../reference/terminology#domain)內部解析。如果未明確設定目標世界，Steel 會自動採用原版約定嘅世界名稱：

- 位於 `the_nether` 嘅下界傳送門預設通往 `overworld`
- 位於任何其他世界嘅下界傳送門預設通往 `the_nether`
- 位於非末地世界嘅末地傳送門預設通往 `the_end`
- 由末地維度世界透過末地傳送門返回時，使用實體或玩家嘅重生點數據，而非 `end_portal_target`

遵循原版約定名稱時，標準嘅 `overworld`、`the_nether` 同 `the_end` 三世界組合無需額外設定即可自動互通。如果你使用咗自訂世界名稱，則需要明確指定傳送門目標：

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

傳送門目標欄位填寫嘅係域內世界名稱，而唔係完整嘅 `namespace:path` 標識符。佢哋唔可以跨域指向其他域嘅世界、唔可以指向自身所在世界，而且必須指向同一域內已聲明嘅世界。使用末地維度嘅世界唔可以設定 `end_portal_target`，而且 `end_portal_target` 指向嘅目標世界必須使用末地維度生成器。

## 世界生成器（Generators）

Steel 內置咗以下[世界生成器](../../reference/terminology#world-generator)：

| 生成器                 | 設定說明                         |
| ---------------------- | -------------------------------- |
| `minecraft:overworld`  | 唔接受 `config` 設定表           |
| `minecraft:the_nether` | 唔接受 `config` 設定表           |
| `minecraft:the_end`    | 唔接受 `config` 設定表           |
| `minecraft:flat`       | 接受可選嘅超平坦世界設定表       |
| `steel:empty`          | 必須提供 `config.dimension_type` |

### Minecraft 原版世界生成器

`minecraft:overworld`、`minecraft:the_nether` 與 `minecraft:the_end` 呢三個[生成器](../../reference/terminology#world-generator)無需額外設定，佢哋會為各自嘅[維度](../../reference/terminology#dimension)生成與原版特性相容嘅[世界](../../reference/terminology#world)。

### 超平坦世界生成器（Flat）

`minecraft:flat` [世界生成器](../../reference/terminology#world-generator)接受可選嘅 `config` 設定表。若省略，Steel 預設使用主世界[維度](../../reference/terminology#dimension)、原版經典超平坦方塊層（1 層基岩 + 2 層泥土 + 1 層草方塊）以及預設結構覆寫清單。

| 設定項                | 類型           | 預設值                       | 說明                                                             |
| --------------------- | -------------- | ---------------------------- | ---------------------------------------------------------------- |
| `layers[].block`      | Identifier     | 無                           |**【必填】** 該層使用嘅方塊 ID                                   |
| `layers[].height`     | Integer        | 無                           |**【必填】** 該層嘅方塊高度，必須大過 `0`                        |
| `dimension_type`      | Identifier     | `"minecraft:overworld"`      | 超平坦[世界](../../reference/terminology#world)使用嘅維度類型    |
| `layers`              | 方塊層表陣列   | 基岩 1、泥土 2、草方塊 1     | 由底向上依序生成嘅方塊層定義                                     |
| `features`            | Boolean        | `false`                      | 是否生成裝飾性地物（目前 `true` 尚未實現）                       |
| `lakes`               | Boolean        | `false`                      | 是否生成湖泊（目前 `true` 尚未實現）                             |
| `structure_overrides` | Identifier 陣列| 要塞（strongholds）與村莊    | 允許喺此超平坦世界中生成嘅結構列表                               |

預設方塊層為高度 `1` 嘅 `minecraft:bedrock`、高度 `2` 嘅 `minecraft:dirt` 與高度 `1` 嘅 `minecraft:grass_block`。
預設嘅 `structure_overrides` 為 `minecraft:strongholds` 同 `minecraft:villages`。

自訂方塊層可以使用重複表陣列（`[[...layers]]`）或行內（Inline）表陣列編寫：

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

使用 `steel:empty` 虛空[世界生成器](../../reference/terminology#world-generator)時，必須喺 `config` 入面指定 `dimension_type`，用於決定該世界嘅[維度](../../reference/terminology#dimension)屬性（如建築高度上限與迷霧顏色）：

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

Steel 內置咗以下[世界](../../reference/terminology#world)儲存後端。儲存方式可以喺全局、單個[域（Domain）](../../reference/terminology#domain)以及單個世界三個層級分別設定。例如，你可以將全局設為記憶體儲存，同時令某一個域使用磁碟儲存持久化至硬碟，並喺該域下嘅某一個特定世界入面單獨改回記憶體儲存，從而獲得極高嘅靈活性。

:::caution
記憶體儲存（`steel:ram`）意味住成個世界完全駐留喺記憶體入面而且唔會寫入磁碟，記憶體佔用可能會隨區塊探索迅速增長。通常建議喺小遊戲伺服器入面將 `steel:ram` 與 `steel:empty` 虛空[世界生成器](../../reference/terminology#world-generator)搭配使用。
:::

| 儲存後端     | 設定說明                                     |
| ------------ | -------------------------------------------- |
| `steel:disk` | 可選設定 `config.path`（相對於 `save_path`） |
| `steel:ram`  | 無需額外設定，區塊唔會保存至磁碟             |

玩家數據儲存（`player_storage`）同樣支援 `steel:disk` 同 `steel:ram`。設為 `steel:ram` 時，玩家數據唔會寫入磁碟保存。

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

本節首先展示首次啟動伺服器時自動生成嘅預設設定；第二個範例則結合上述概念，展示包含三個[域](../../reference/terminology#domain)、唔同遊戲模式、混合儲存設定與自訂[世界生成器](../../reference/terminology#world-generator)嘅進階設定。

### 預設基本設定

以下係 `worlds.toml` 嘅預設設定，用於建立一套標準嘅生存模式[世界](../../reference/terminology#world)：

```toml
# /config/worlds.toml

# 根層級預設設定，除非被覆寫，否則由所有域同世界繼承。
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

# 世界可以可選地設定同域下嘅 `nether_portal_target` 同
# `end_portal_target` 欄位，以覆寫原版約定嘅世界名稱。
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

以下範例展示咗多域混合設定：`minecraft` [域](../../reference/terminology#domain)以及 `flat` 域入面嘅 `the_nether` [世界](../../reference/terminology#world)保存喺磁碟上面；`empty` 同 `minecraft` 域使用生存模式，而 `flat` 域使用創造模式。

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

伺服器喺啟動時會對世界設定進行嚴格驗證：

- 包含未知欄位嘅設定會被直接拒絕
- 至少需要聲明一個[域（Domain）](../../reference/terminology#domain)
- 必須有且僅有一個域設定 `default = true`
- 每個域必須至少聲明一個[世界（World）](../../reference/terminology#world)
- 每個域必須有且僅有一個預設世界（`default = true`）
- 域名稱必須係合法嘅命名空間標識符
- 域名稱 `global` 為系統保留字，禁止使用
- 世界名稱必須係合法嘅標識符路徑，而且唔可以包含 `/`
- `save_path` 同儲存路徑必須係乾淨嘅相對路徑
- [世界生成器](../../reference/terminology#world-generator)與儲存後端必須係 Steel 已知嘅註冊類型
- `nether_portal_target` 同 `end_portal_target` 必須指向同域內已存在嘅其他世界，唔可以指向來源世界自身
- 唔可以喺末地維度嘅世界上設定 `end_portal_target`
- `end_portal_target` 必須指向一個末地維度嘅世界
- `minecraft:flat` 至少需要包含一個方塊層（Layer），而且目前暫未實現 `features = true` 或 `lakes = true`

如果驗證失敗，伺服器將會輸出錯誤提示並安全退出。
