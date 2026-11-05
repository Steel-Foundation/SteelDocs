---
title: 02. 参数解析
description: 学习如何在 SteelMC 中使用与实现命令参数类型。
sidebar:
  order: 2
---

命令参数节点允许从玩家输入的命令行中提取动态输入，例如整数、字符串、坐标、目标选择器等。

## 使用参数节点

使用 `argument` 构建器函数创建参数节点：

```rust
use steel_core::command::builder::{argument, literal};
use steel_core::command::arguments::IntegerArgument;

let cmd = literal("givexp")
    .then(argument("amount", IntegerArgument::new(1, 100))
        .executes(|ctx| {
            let amount = ctx.get_argument::<i32>("amount")?;
            // 处理逻辑
            Ok(1)
        })
    );
```

## 常见参数类型

- **基础标量**：整数（Integer）、浮点数（Float）、布尔值（Bool）
- **字符串**：单词（Word）、引号字符串（String）、贪婪字符串（GreedyString）
- **Minecraft 专用** ：方块坐标（BlockPos）、玩家选择器（EntitySelector）、资源位置（Identifier）
