---
title: 03. 参数自动补全 (Suggestions)
description: 如何在 SteelMC 中为命令参数提供客户端 Tab 自动补全建议。
sidebar:
  order: 3
---

自动补全建议允许客户端在按下 Tab 键时向服务端请求候选项列表。

## 为参数添加补全

使用 `.suggests()` 方法为参数节点挂载补全生成器：

```rust
argument("biome", StringArgument::word())
    .suggests(|ctx, builder| {
        builder.suggest("plains");
        builder.suggest("desert");
        builder.suggest("mountains");
        Ok(builder.build())
    })
```

## 异步与动态补全

当候选项依赖世界状态或在线玩家列表时，可以在闭包中动态查询当前在线玩家或已加载维度。
