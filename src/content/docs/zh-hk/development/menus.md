---
title: 選單系統 (Menus)
description: 點樣喺 SteelMC 入面建構與處理容器與玩家介面選單。
---

SteelMC 入面嘅選單（Menus，喺原版入面常稱為 Container 或 ScreenHandler）負責同步玩家開啟嘅各種容器介面（例如箱子、木桶、工作台、鐵砧等）與物品槽位互動。

## 架構概念

- **MenuType**：定義選單嘅類型與佈局（如 `generic_9x3`、`anvil` 等）。
- **MenuSession**：追蹤玩家目前開啟嘅視窗狀態，處理槽位點擊（Slot Click）、快速移動（Shift-Click）與拖動操作。
- **Inventory 同步** ：當玩家操作槽位時，伺服器計算合法性並向客戶端回傳確認或還原封包。

## 實現一個選單

喺 `crates/steel-core/src/menu/` 目錄下查看已支援嘅容器類型：

```rust
use steel_core::menu::{Menu, MenuContext, SlotClick};

pub struct CustomMenu {
    // 選單自訂狀態
}

impl Menu for CustomMenu {
    fn handle_click(&mut self, ctx: &mut MenuContext, click: SlotClick) {
        // 處理槽位點擊邏輯
    }
}
```
