---
title: 01. 创建命令
description: 学习如何在 SteelMC 中实现你的第一个自定义命令。
sidebar:
  order: 1
---

在 SteelMC 中，命令系统采用了类似于原版 Brigadier 的命令语法树模型。每个命令节点可以包含字面量分支、参数节点以及执行器。

## 命令基础

所有命令均定义在 `crates/steel-core/src/command/` 目录下。

### 1. 实现命令

要创建一个新命令，通常需要实现命令注册函数：

```rust
use steel_core::command::builder::literal;
use steel_core::command::CommandDispatcher;

pub fn register(dispatcher: &mut CommandDispatcher) {
    let cmd = literal("hello")
        .executes(|ctx| {
            ctx.sender().send_message("Hello from SteelMC!");
            Ok(1)
        });

    dispatcher.register(cmd);
}
```

### 2. 节点与层级

你可以通过 `.then()` 方法为命令追加子分支：

```rust
let cmd = literal("mycmd")
    .then(literal("sub1").executes(|ctx| { ... }))
    .then(literal("sub2").executes(|ctx| { ... }));
```

## 下一步

- 阅读 [02. 参数解析](./02-arguments) 了解如何为命令传递动态参数
