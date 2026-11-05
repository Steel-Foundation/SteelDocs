---
title: 核心術語表 (Terminology)
description: Steel 中常見的世界管理與設定核心術語說明。
sidebar:
  order: 1
---

Steel 對部分概念的命名與原版 Minecraft 以及 Mojang 內部原始碼中的習慣稱呼略有不同。本頁彙整了文件中頻繁出現的世界管理與設定核心術語定義。

## 快速速查表

| 術語 | 含義簡述 |
| --- | --- |
| [識別碼（Identifier）](#identifier) | 由 `namespace:path` 組成的唯一名稱，用於識別 Minecraft 與 Steel 中的各類資源 |
| [域（Domain）](#domain) | 共用玩家資料與預設設定的一組相關聯世界的集合 |
| [世界（World）](#world) | 域（Domain）內部的一張可遊玩地圖 |
| [維度（Dimension）](#dimension) | 世界所使用的物理規則集與視覺屬性（高度、天空、迷霧等） |
| [世界生成器（World Generator）](#world-generator) | 負責生成地形並選擇或接受維度類型的生成系統 |
| [傳送門目標（Portal Target）](#portal-target) | 傳送門將玩家或實體送往的同域目標世界 |

<a id="identifier"></a>

## 識別碼（Identifier）

**識別碼（Identifier）** 是由命名空間（Namespace）與路徑（Path）組成的名稱，書寫格式為 `namespace:path`。

常見範例包括：`minecraft:overworld`、`minecraft:flat`、`minecraft:stone`、`minecraft:stick` 以及 `steel:disk`。

Steel 使用識別碼來指稱世界生成器、維度類型、儲存後端、方塊和物品等各類資源。在所屬的註冊表或設定情境中，每個識別碼都應當是唯一的。

在世界設定中，域名稱（Domain Name）遵循命名空間部分的語法規則，而世界名稱（World Name）遵循路徑部分的語法規則。

<a id="domain"></a>

## 域（Domain）**域（Domain）** 是一組彼此關聯的世界（Worlds）的集合，也是 `worlds.toml` 設定檔中的最高組織層級。

諸如種子碼（Seed）、預設遊戲模式、難度與儲存後端等域層級設定，會自動被該域下的所有世界繼承。**玩家資料（物品欄、經驗值、座標等）也是綁定在「域」上的**——在兩個不同的域之間切換，體驗上類似於在跨服架構中切換分流伺服器，因為玩家資料不會跨越域的邊界。

例如：一套標準的原版生存設定通常包含一個名為 `minecraft` 的域，其下包含主世界（`overworld`）、地獄（`the_nether`）和終界（`the_end`）三個世界。

<a id="world"></a>

## 世界（World）**世界（World）** 是位於某個域內部的一張可遊玩地圖。

在原版 Minecraft 中，大家通常直接稱呼它們為主世界、地獄或終界。而在 Steel 中，你可以在同一個域下定義比原版更多的世界：例如，一個域內可以同時包含 `overworld`、`overworld_2`（資源世界）和 `testing`（測試世界）。

每個世界都需要指定一個世界生成器（World Generator），並且可以單獨覆寫從所屬域繼承來的種子碼、遊戲模式、難度或儲存後端等設定。

<a id="dimension"></a>

## 維度（Dimension）**維度（Dimension）** 描述了一個世界所採用的物理規則與視覺環境屬性，包括建築高度範圍、天空渲染、迷霧顏色以及其他維度專屬行為（例如水是否會蒸發、床是否會爆炸）。

例如：主世界（Overworld）維度的總高度為 384 格；地獄（Nether）具有地獄專屬迷霧；終界（The End）具有終界星空天空盒。

注意：**維度並不等同於一張具體的存檔地圖**——多個不同的世界完全可以使用同一種維度類型。

<a id="world-generator"></a>

## 世界生成器（World Generator）**世界生成器（World Generator）** 負責為世界生成具體的地形方塊。

有些生成器固定綁定某一個維度（例如 `minecraft:overworld` 生成器固定使用主世界維度）；而另一些生成器則支援在設定中指定維度類型（例如 `minecraft:flat` 超平坦生成器可以使用主世界、地獄或終界的維度屬性來建立超平坦世界）。

<a id="portal-target"></a>

## 傳送門目標（Portal Target）

**傳送門目標（Portal Target）** 是指傳送門將玩家或實體傳送過去的**同一域內**的目標世界。

預設情況下，Steel 遵循原版慣例的世界名稱自動關聯（`overworld`、`the_nether` 與 `the_end`）。若你使用了自訂的世界名稱，可以在 `worlds.toml` 中透過 `nether_portal_target` 和 `end_portal_target` 明確指定目標世界。

## 相關頁面

- [世界設定](../../configuration/world-configuration)
