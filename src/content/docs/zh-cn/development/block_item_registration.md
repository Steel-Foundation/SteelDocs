---
title: 方块与物品注册
description: 了解 SteelMC 如何注册方块与物品行为，以及如何为其挂载自定义逻辑。
---

在 SteelMC 中，方块和物品的所有基础元数据（ID、硬度、堆叠上限、原版属性等）均由代码生成器根据原版数据自动提取与生成。但是，方块和物品在游戏中的 **行为逻辑（Behaviors）** 需要手动注册与绑定。

本指南将深入介绍方块与物品行为的注册机制与实现模式。

## 架构概览

SteelMC 采用了“数据与逻辑分离”的实体组件思想：

- **静态定义**：每个方块由方块状态（BlockState）标识，物品由物品原型（Item Prototype）标识。
- **行为分发**：当玩家与方块或物品交互时，服务端通过行为注册表（Behavior Registry）将事件路由到对应的 `BlockBehavior` 或 `ItemBehavior` 实现。

## 方块行为注册

方块行为 Trait 定义了处理放置、破坏、使用、随机刻（Random Tick）以及相邻更新的方法。

### 1. 定义行为

```rust
use steel_core::block::{BlockBehavior, BlockContext, BlockPos};

#[derive(Default)]
pub struct CustomBlockBehavior;

impl BlockBehavior for CustomBlockBehavior {
    // 按需覆写对应的钩子函数
}
```

### 2. 注册行为映射

在注册表初始化阶段，将原版方块 ID 映射到该行为：

```rust
registry.register(blocks::MY_BLOCK, CustomBlockBehavior::default());
```

## 物品行为注册

与方块类似，物品行为 Trait 处理物品右键使用、与实体交互、作为食物食用等逻辑：

```rust
use steel_core::item::{ItemBehavior, ItemUseContext};

#[derive(Default)]
pub struct CustomItemBehavior;

impl ItemBehavior for CustomItemBehavior {
    // 覆写物品交互逻辑
}
```

## 最佳实践

- **优先复用已有行为**：许多方块和物品共享相同的交互逻辑（例如门、台阶、楼梯、染料等），应优先继承或组合复用现有的基础行为。
- **避免运行时分配**：行为方法在游戏主循环中高频调用，应尽量避免不必要的堆分配与克隆。
- **与原版特性保持一致** ：行为逻辑的每一步处理都应尽可能对齐原版数据包与客户端预期。
