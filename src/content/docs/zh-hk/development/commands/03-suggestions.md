---
title: 03. 參數自動補全 (Suggestions)
description: 點樣喺 SteelMC 入面為指令參數提供客戶端 Tab 自動補全建議。
sidebar:
  order: 3
---

自動補全建議允許客戶端喺撳 Tab 鍵時向伺服器請求候選項列表。

## 為參數加入補全

使用 `.suggests()` 方法為參數節點掛載補全生成器：

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

當候選項依賴世界狀態或在線玩家列表嗰陣，可以喺閉包入面動態查詢目前在線玩家或已載入維度。
