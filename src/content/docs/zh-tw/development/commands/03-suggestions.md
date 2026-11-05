---
title: 03. 參數自動補全 (Suggestions)
description: 如何在 SteelMC 中為指令參數提供用戶端 Tab 自動補全建議。
sidebar:
  order: 3
---

自動補全建議允許用戶端在按下 Tab 鍵時向伺服器請求候選清單。

## 為參數加入補全

使用 `.suggests()` 方法為參數節點掛載補全產生器：

```rust
argument("biome", StringArgument::word())
    .suggests(|ctx, builder| {
        builder.suggest("plains");
        builder.suggest("desert");
        builder.suggest("mountains");
        Ok(builder.build())
    })
```

## 非同步與動態補全

當候選項依賴世界狀態或在線玩家清單時，可以在閉包中動態查詢目前在線玩家或已載入維度。
