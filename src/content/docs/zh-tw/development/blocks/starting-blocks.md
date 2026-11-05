---
title: 入門方塊實作
description: 如何在 SteelMC 中實作你的第一個方塊。
sidebar:
  order: 1
---

在本指南中，你將學習如何在 SteelMC 中撰寫並註冊你的第一個方塊邏輯。

## 準備工作

在開始之前，請確保你已經：

- 按照[安裝指南](../../getting-started/installation)設定好了 Rust 開發環境
- 複製（Clone）了 SteelMC 程式碼儲存庫
- 具備基礎的 Rust 程式設計語法常識

## 檢查方塊實作狀態

你可以透過我們的[特性實作進度追蹤器](../../../tracker)查看哪些方塊已經實作，哪些方塊仍處於未實作（Planned）狀態。

## 方塊的運作原理

在 SteelMC 中，原版方塊的資料與其執行期邏輯是解耦的：

1. **方塊資料（Block Data）**：由程式碼產生器根據原版資料產生，包含方塊 ID、方塊狀態（BlockState）、硬度、遮光度等屬性。
2.**方塊行為（Block Behavior）** ：透過實作 `BlockBehavior` Trait 來定義，負責處理該方塊在世界中的互動行為（例如玩家右鍵點擊、放置、破壞、相鄰方塊更新等）。

## 實作一個方塊

以下以實作一個基礎的方塊行為為例：

### 1. 尋找未實作的方塊

在[特性實作進度追蹤器](../../../tracker)中挑選一個未實作的方塊（例如某種尚未實作特殊互動的方塊）。

### 2. 找到對應的原始碼模組

方塊邏輯位於 `crates/steel-core/src/block/` 目錄中。相關的行為檔案通常按方塊類型進行歸類整理。

### 3. 實作 BlockBehavior Trait

定義結構體並為其實作 `BlockBehavior`：

```rust
use steel_core::block::{BlockBehavior, BlockContext};

pub struct MyBlock;

impl BlockBehavior for MyBlock {
    // 依需求覆寫對應的生命週期或互動方法
}
```

### 4. 綁定方塊行為

在方塊行為註冊邏輯中，將對應的方塊 ID 映射至你實作的結構體執行個體。

### 5. 編譯與測試

執行以下指令確保編譯通過且程式碼符合品質規範：

```bash
cargo check
cargo test
cargo clippy
```

隨後啟動本機伺服器，進入遊戲放置該方塊並測試其行為是否與原版表現一致。
