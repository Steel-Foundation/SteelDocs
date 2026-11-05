---
title: 核心術語表 (Terminology)
description: Steel 入面常見嘅世界管理與設定核心術語說明。
sidebar:
  order: 1
---

Steel 對部分概念嘅命名與原版 Minecraft 以及 Mojang 內部源碼中嘅習慣稱呼略有唔同。本頁整理咗文檔入面頻繁出現嘅世界管理與設定核心術語定義。

## 快速速查表

| 術語 | 含義簡述 |
| --- | --- |
| [標識符（Identifier）](#identifier) | 由 `namespace:path` 組成嘅唯一名稱，用於標識 Minecraft 與 Steel 入面嘅各類資源 |
| [域（Domain）](#domain) | 共用玩家數據與預設設定嘅一組相關聯世界嘅集合 |
| [世界（World）](#world) | 域（Domain）內部嘅一張可遊玩地圖 |
| [維度（Dimension）](#dimension) | 世界所使用嘅物理規則集與視覺屬性（高度、天空、迷霧等） |
| [世界生成器（World Generator）](#world-generator) | 負責生成地形並選擇或接受維度類型嘅生成系統 |
| [傳送門目標（Portal Target）](#portal-target) | 傳送門將玩家或實體送往嘅同域目標世界 |

<a id="identifier"></a>

## 標識符（Identifier）

**標識符（Identifier）** 係由命名空間（Namespace）與路徑（Path）組成嘅名稱，書寫格式為 `namespace:path`。

常見範例包括：`minecraft:overworld`、`minecraft:flat`、`minecraft:stone`、`minecraft:stick` 以及 `steel:disk`。

Steel 使用標識符嚟指代世界生成器、維度類型、儲存後端、方塊同物品等各類資源。喺所屬嘅註冊表或設定上下文中，每個標識符都應當係唯一嘅。

喺世界設定入面，域名稱（Domain Name）遵循命名空間部分嘅語法規則，而世界名稱（World Name）遵循路徑部分嘅語法規則。

<a id="domain"></a>

## 域（Domain）**域（Domain）** 係一組彼此關聯嘅世界（Worlds）嘅集合，亦係 `worlds.toml` 設定檔入面嘅最高組織層級。

諸如種子碼（Seed）、預設遊戲模式、難度與儲存後端等域層級設定，會自動被該域下嘅所有世界繼承。**玩家數據（物品欄、經驗值、位置等）亦係綁定喺「域」上面嘅**——喺兩個唔同嘅域之間切換，體驗上類似於喺跨服架構入面切換子服，因為玩家數據唔會跨越域嘅邊界。

例如：一套標準嘅原版生存設定通常包含一個名為 `minecraft` 嘅域，其下包含主世界（`overworld`）、下界（`the_nether`）同末地（`the_end`）三個世界。

<a id="world"></a>

## 世界（World）**世界（World）** 係位於某個域內部嘅一張可遊玩地圖。

喺原版 Minecraft 入面，大家通常直接稱呼佢哋為主世界、下界或末地。而喺 Steel 入面，你可以喺同一個域下定義比原版更多嘅世界：例如，一個域內可以同時包含 `overworld`、`overworld_2`（資源世界）同 `testing`（測試世界）。

每個世界都需要指定一個世界生成器（World Generator），並且可以單獨覆寫由所屬域繼承嚟嘅種子碼、遊戲模式、難度或儲存後端等設定。

<a id="dimension"></a>

## 維度（Dimension）**維度（Dimension）** 描述咗一個世界所採用嘅物理規則與視覺環境屬性，包括建築高度範圍、天空渲染、迷霧顏色以及其他維度專屬行為（例如水會唔會蒸發、床會唔會爆炸）。

例如：主世界（Overworld）維度嘅總高度為 384 格；下界（Nether）具有下界專屬迷霧；末地（The End）具有末地星空天空盒。

注意：**維度並唔等同於一張具體嘅存檔地圖**——多個唔同嘅世界完全可以使用同一種維度類型。

<a id="world-generator"></a>

## 世界生成器（World Generator）**世界生成器（World Generator）** 負責為世界生成具體嘅地形方塊。

有啲生成器固定綁定某一個維度（例如 `minecraft:overworld` 生成器固定使用主世界維度）；而另一啲生成器則支援喺設定入面指定維度類型（例如 `minecraft:flat` 超平坦生成器可以使用主世界、下界或末地嘅維度屬性嚟建立超平坦世界）。

<a id="portal-target"></a>

## 傳送門目標（Portal Target）

**傳送門目標（Portal Target）** 係指傳送門將玩家或實體傳送過去嘅**同一域內**嘅目標世界。

預設情況下，Steel 遵循原版約定嘅世界名稱自動關聯（`overworld`、`the_nether` 與 `the_end`）。如果你使用咗自訂嘅世界名稱，可以喺 `worlds.toml` 入面透過 `nether_portal_target` 同 `end_portal_target` 顯式指定目標世界。

## 相關頁面

- [世界設定](../../configuration/world-configuration)
