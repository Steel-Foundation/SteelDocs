---
title: 04. 命令权限控制
description: 如何在 SteelMC 中为命令配置权限节点与条件控制。
sidebar:
  order: 4
---

SteelMC 提供了细粒度的命令权限系统。玩家客户端在登录时收到的命令语法树会根据其权限进行裁剪。

## 要求权限

使用 `.requires()` 方法为命令节点添加权限检查谓词：

```rust
literal("kick")
    .requires(|sender| sender.has_permission("minecraft.command.kick"))
    .then(...)
```

## 继承与权限树

关于权限节点命名与权限组配置，请参阅[权限配置指南](../../../configuration/permissions)。
