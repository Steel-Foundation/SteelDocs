---
title: 選單系統 (Menus)
description: 如何在 SteelMC 中建構與處理容器與玩家介面選單。
---

SteelMC 中的選單（Menus，在原版中常稱為 Container 或 ScreenHandler）負責同步玩家開啟的各種容器介面（例如箱子、木桶、工作台、鐵砧等）與物品欄位互動。

## 架構概念

- **MenuType**：定義選單的型別與版面配置（如 `generic_9x3`、`anvil` 等）。
- **MenuSession**：追蹤玩家目前開啟的視窗狀態，處理欄位點擊（Slot Click）、快速移動（Shift-Click）與拖曳操作。
- **Inventory 同步** ：當玩家操作欄位時，伺服器計算合法性並向用戶端回傳確認或還原封包。

## 實作一個選單

在 `crates/steel-core/src/menu/` 目錄下查看已支援的容器型別：

```rust
use steel_core::menu::{Menu, MenuContext, SlotClick};

pub struct CustomMenu {
    // 選單自訂狀態
}

impl Menu for CustomMenu {
    fn handle_click(&mut self, ctx: &mut MenuContext, click: SlotClick) {
        // 處理欄位點擊邏輯
    }
}
```
