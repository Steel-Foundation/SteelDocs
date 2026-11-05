---
title: 入門物品實現
description: 點樣喺 SteelMC 入面實現你嘅第一個物品。
sidebar:
  order: 1
---

喺本指南入面，你將會學習點樣喺 SteelMC 入面編寫你嘅第一個物品邏輯。

## 準備工作

喺開始之前，請確保你已經完成咗以下準備：

- 安裝咗 [Rust 開發環境](../../getting-started/installation)
- Clone 咗 SteelMC 程式碼倉庫
- 掌握咗基礎嘅 Rust 編程語法

## 檢查物品實現狀態

你可以透過我哋嘅[特性實現進度追蹤器](../../../tracker)查看邊啲物品已經被標記為實現或尚未實現。

## 實現一個物品

物品系統嘅運作方式同[方塊系統](../blocks/starting-blocks)非常類似：

每個物品都有一個或多個與之關聯嘅 **物品行為（Item Behavior）**，用於定義該物品喺遊戲入面嘅各種交互邏輯（例如使用、點擊右鍵、食用等）。

### 1. 尋找未實現嘅物品

前往[特性實現進度追蹤器](../../../tracker)並切換去**Items** 標籤頁，揀選一個標記為尚未實現（Planned）嘅物品。

### 2. 搵到對應源碼檔案

喺 `crates/steel-core/src/item/` 目錄下搵到對應嘅物品分類檔案。

### 3. 實現 ItemBehavior Trait

定義一個結構體並為其實現 `ItemBehavior` Trait：

```rust
pub struct MyItemBehavior;

impl ItemBehavior for MyItemBehavior {
    // 按需實現對應嘅物品鉤子方法
}
```

### 4. 註冊物品行為

喺 `ItemBehavior` 相關嘅對應程式碼入面將你嘅方塊／物品 ID 關聯至此行為結構體上面。

## 下一步

- 閱讀[方塊與物品註冊指南](../block_item_registration)了解更底層嘅註冊表機制
- 查看[程式碼規範](../code-standard)以符合合併要求
