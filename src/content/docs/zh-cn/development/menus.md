---
title: 菜单系统 (Menus)
description: 如何在 SteelMC 中构建和处理容器与玩家界面菜单。
---

SteelMC 中的菜单（Menus，在原版中常称为 Container 或 ScreenHandler）负责同步玩家打开的各种容器界面（例如箱子、木桶、工作台、铁砧等）与物品槽位交互。

## 架构概念

- **MenuType**：定义菜单的类型与布局（如 `generic_9x3`、`anvil` 等）。
- **MenuSession**：跟踪玩家当前打开的窗口状态，处理槽位点击（Slot Click）、快捷移动（Shift-Click）与拖拽操作。
- **Inventory 同步** ：当玩家操作槽位时，服务端计算合法性并向客户端回传确认或回退数据包。

## 实现一个菜单

在 `crates/steel-core/src/menu/` 目录下查看已支持的容器类型：

```rust
use steel_core::menu::{Menu, MenuContext, SlotClick};

pub struct CustomMenu {
    // 菜单自定义状态
}

impl Menu for CustomMenu {
    fn handle_click(&mut self, ctx: &mut MenuContext, click: SlotClick) {
        // 处理槽位点击逻辑
    }
}
```
