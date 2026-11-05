---
title: 入门物品实现
description: 如何在 SteelMC 中实现你的第一个物品。
sidebar:
  order: 1
---

在本指南中，你将学习如何在 SteelMC 中编写你的第一个物品逻辑。

## 准备工作

在开始之前，请确保你已经完成了以下准备：

- 安装了 [Rust 开发环境](../../getting-started/installation)
- 克隆了 SteelMC 代码仓库
- 掌握了基础的 Rust 编程语法

## 检查物品实现状态

你可以通过我们的[特性实现追踪器](../../../tracker)查看哪些物品已经被标记为实现或尚未实现。

## 实现一个物品

物品系统的工作方式与[方块系统](../blocks/starting-blocks)非常类似：

每个物品都有一个或多个与之关联的 **物品行为（Item Behavior）**，用于定义该物品在游戏中的各种交互逻辑（例如使用、点击右键、食用等）。

### 1. 查找未实现的物品

前往[特性实现追踪器](../../../tracker)并切换到**Items** 选项卡，挑选一个标记为未实现（Planned）的物品。

### 2. 找到对应源码文件

在 `crates/steel-core/src/item/` 目录下找到对应的物品分类文件。

### 3. 实现 ItemBehavior Trait

定义一个结构体并为它实现 `ItemBehavior` Trait：

```rust
pub struct MyItemBehavior;

impl ItemBehavior for MyItemBehavior {
    // 按需实现对应的物品钩子方法
}
```

### 4. 注册物品行为

在 `ItemBehavior` 相关的映射代码中将你的方块/物品 ID 关联到此行为结构体上。

## 下一步

- 阅读[方块与物品注册指南](../block_item_registration)了解更底层的注册表机制
- 查看[代码规范](../code-standard)以符合合并要求
