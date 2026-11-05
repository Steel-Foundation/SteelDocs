---
title: 入門方塊實現
description: 點樣喺 SteelMC 入面實現你嘅第一個方塊。
sidebar:
  order: 1
---

喺本指南入面，你將會學習點樣喺 SteelMC 入面編寫並註冊你嘅第一個方塊邏輯。

## 準備工作

喺開始之前，請確保你已經：

- 按照[安裝指南](../../getting-started/installation)設定好咗 Rust 開發環境
- Clone 咗 SteelMC 程式碼倉庫
- 具備基礎嘅 Rust 編程語法常識

## 檢查方塊實現狀態

你可以透過我哋嘅[特性實現進度追蹤器](../../../tracker)查看邊啲方塊已經實現，邊啲方塊仍處於未實現（Planned）狀態。

## 方塊嘅運作原理

喺 SteelMC 入面，原版方塊嘅數據同佢運行時邏輯係解耦嘅：

1. **方塊數據（Block Data）**：由程式碼生成器根據原版數據生成，包含方塊 ID、方塊狀態（BlockState）、硬度、阻光度等屬性。
2.**方塊行為（Block Behavior）** ：透過實現 `BlockBehavior` Trait 嚟定義，負責處理該方塊喺世界入面嘅互動行為（例如玩家右鍵點擊、放置、破壞、相鄰方塊更新等）。

## 實現一個方塊

以下以實現一個基礎嘅方塊行為為例：

### 1. 尋找未實現嘅方塊

喺[特性實現進度追蹤器](../../../tracker)入面揀選一個未實現嘅方塊（例如某種尚未實現特殊互動嘅方塊）。

### 2. 搵到對應嘅源碼模組

方塊邏輯位於 `crates/steel-core/src/block/` 目錄中。相關嘅行為檔案通常按方塊類型進行歸類整理。

### 3. 實現 BlockBehavior Trait

定義結構體並為其實現 `BlockBehavior`：

```rust
use steel_core::block::{BlockBehavior, BlockContext};

pub struct MyBlock;

impl BlockBehavior for MyBlock {
    // 按需覆寫對應嘅生命週期或互動方法
}
```

### 4. 綁定方塊行為

喺方塊行為註冊邏輯入面，將對應嘅方塊 ID 映射至你實現嘅結構體實例。

### 5. 編譯與測試

運行以下指令確保編譯通過且程式碼符合質量規範：

```bash
cargo check
cargo test
cargo clippy
```

隨後啟動本地伺服器，進入遊戲放置該方塊並測試佢嘅行為係咪同原版表現一致。
