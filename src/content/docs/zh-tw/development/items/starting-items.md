---
title: 入門物品實作
description: 如何在 SteelMC 中實作你的第一個物品。
sidebar:
  order: 1
---

在本指南中，你將學習如何在 SteelMC 中撰寫你的第一個物品邏輯。

## 準備工作

在開始之前，請確保你已經完成了以下準備：

- 安裝了 [Rust 開發環境](../../getting-started/installation)
- 複製（Clone）了 SteelMC 程式碼儲存庫
- 掌握了基礎的 Rust 程式設計語法

## 檢查物品實作狀態

你可以透過我們的[特性實作進度追蹤器](../../../tracker)查看哪些物品已經被標記為實作或尚未實作。

## 實作一個物品

物品系統的運作方式與[方塊系統](../blocks/starting-blocks)非常類似：

每個物品都有一個或多個與之關聯的 **物品行為（Item Behavior）**，用於定義該物品在遊戲中的各種互動邏輯（例如使用、點擊右鍵、食用等）。

### 1. 尋找未實作的物品

前往[特性實作進度追蹤器](../../../tracker)並切換至**Items** 標籤頁，挑選一個標記為尚未實作（Planned）的物品。

### 2. 找到對應原始碼檔案

在 `crates/steel-core/src/item/` 目錄下找到對應的物品分類檔案。

### 3. 實作 ItemBehavior Trait

定義一個結構體並為其實作 `ItemBehavior` Trait：

```rust
pub struct MyItemBehavior;

impl ItemBehavior for MyItemBehavior {
    // 依需求實作對應的物品掛鉤方法
}
```

### 4. 註冊物品行為

在 `ItemBehavior` 相關的對應程式碼中將你的方塊／物品 ID 關聯至此行為結構體上。

## 下一步

- 閱讀[方塊與物品註冊指南](../block_item_registration)了解更底層的註冊表機制
- 查看[程式碼規範](../code-standard)以符合合併要求
