---
title: 方塊與物品註冊
description: 了解 SteelMC 如何註冊方塊與物品行為，以及如何為其掛載自訂邏輯。
---

在 SteelMC 中，方塊和物品的所有基礎中繼資料（ID、硬度、堆疊上限、原版屬性等）均由程式碼產生器根據原版資料自動提取與產生。但是，方塊和物品在遊戲中的 **行為邏輯（Behaviors）** 需要手動註冊與綁定。

本指南將深入介紹方塊與物品行為的註冊機制與實作模式。

## 架構概覽

SteelMC 採用了「資料與邏輯分離」的實體元件思維：

- **靜態定義**：每個方塊由方塊狀態（BlockState）標識，物品由物品原型（Item Prototype）標識。
- **行為分發**：當玩家與方塊或物品互動時，伺服器透過行為註冊表（Behavior Registry）將事件路由至對應的 `BlockBehavior` 或 `ItemBehavior` 實作。

## 方塊行為註冊

方塊行為 Trait 定義了處理放置、破壞、使用、隨機刻（Random Tick）以及相鄰更新的方法。

### 1. 定義行為

```rust
use steel_core::block::{BlockBehavior, BlockContext, BlockPos};

#[derive(Default)]
pub struct CustomBlockBehavior;

impl BlockBehavior for CustomBlockBehavior {
    // 依需求覆寫對應的掛鉤函式
}
```

### 2. 註冊行為對應

在註冊表初始化階段，將原版方塊 ID 映射至該行為：

```rust
registry.register(blocks::MY_BLOCK, CustomBlockBehavior::default());
```

## 物品行為註冊

與方塊類似，物品行為 Trait 處理物品右鍵使用、與實體互動、作為食物食用等邏輯：

```rust
use steel_core::item::{ItemBehavior, ItemUseContext};

#[derive(Default)]
pub struct CustomItemBehavior;

impl ItemBehavior for CustomItemBehavior {
    // 覆寫物品互動邏輯
}
```

## 最佳實踐

- **優先複用已有行為**：許多方塊和物品共用相同的互動邏輯（例如門、半磚、樓梯、染料等），應優先繼承或組合複用現有的基礎行為。
- **避免執行期分配**：行為方法在遊戲主迴圈中高頻率呼叫，應盡量避免不必要的堆疊分配與複製。
- **與原版特性保持一致** ：行為邏輯的每一步處理都應盡可能對齊原版資料包與用戶端預期。
