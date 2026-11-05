---
title: 02. 參數解析
description: 學習如何在 SteelMC 中使用與實作指令參數型別。
sidebar:
  order: 2
---

指令參數節點允許從玩家輸入的命令列中提取動態輸入，例如整數、字串、座標、目標選擇器等。

## 使用參數節點

使用 `argument` 建構器函式建立參數節點：

```rust
use steel_core::command::builder::{argument, literal};
use steel_core::command::arguments::IntegerArgument;

let cmd = literal("givexp")
    .then(argument("amount", IntegerArgument::new(1, 100))
        .executes(|ctx| {
            let amount = ctx.get_argument::<i32>("amount")?;
            // 處理邏輯
            Ok(1)
        })
    );
```

## 常見參數型別

- **基礎純量**：整數（Integer）、浮點數（Float）、布林值（Bool）
- **字串**：單詞（Word）、引號字串（String）、貪婪字串（GreedyString）
- **Minecraft 專用** ：方塊座標（BlockPos）、玩家選擇器（EntitySelector）、資源位置（Identifier）
