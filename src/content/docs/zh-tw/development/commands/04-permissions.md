---
title: 04. 指令權限控制
description: 如何在 SteelMC 中為指令設定權限節點與條件控制。
sidebar:
  order: 4
---

SteelMC 提供了細緻的指令權限系統。玩家用戶端在登入時收到的指令語法樹會根據其權限進行修剪。

## 要求權限

使用 `.requires()` 方法為指令節點加入權限檢查述詞：

```rust
literal("kick")
    .requires(|sender| sender.has_permission("minecraft.command.kick"))
    .then(...)
```

## 繼承與權限樹

關於權限節點命名與權限群組設定，請參閱[權限設定指南](../../../configuration/permissions)。
