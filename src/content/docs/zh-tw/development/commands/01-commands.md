---
title: 01. 建立指令
description: 學習如何在 SteelMC 中實作你的第一個自訂指令。
sidebar:
  order: 1
---

在 SteelMC 中，指令系統採用了類似於原版 Brigadier 的指令語法樹模型。每個指令節點可以包含常值分支、參數節點以及執行器。

## 指令基礎

所有指令均定義在 `crates/steel-core/src/command/` 目錄下。

### 1. 實作指令

要建立一個新指令，通常需要實作指令註冊函式：

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

### 2. 節點與階層

你可以透過 `.then()` 方法為指令追加子分支：

```rust
let cmd = literal("mycmd")
    .then(literal("sub1").executes(|ctx| { ... }))
    .then(literal("sub2").executes(|ctx| { ... }));
```

## 下一步

- 閱讀 [02. 參數解析](./02-arguments) 了解如何為指令傳遞動態參數
