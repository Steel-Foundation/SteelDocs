---
title: 命令参考
description: SteelMC 命令语法约定与详细参考文档。
sidebar:
  order: 1
---

本章节记录了需要详细说明的 SteelMC 命令体系。每篇参考文档都详细介绍了各项操作的具体作用、所需的权限节点以及安全使用方式。

## 命令索引

- [`/perms`](../permissions) —— 查询与管理玩家权限规则、权限组、继承关系、默认组及元数据（Metadata）
- [服务端控制台](../console) —— 后台终端快捷键、命令历史记录、反向搜索、Tab 自动补全与优雅停服

原版命令遵循标准的 Minecraft 命令语法。对于未附加 Steel 专属扩展行为的原版命令，可直接参阅 [Minecraft Wiki 命令列表](https://zh.minecraft.wiki/w/%E5%91%BD%E4%BB%A4)。

## 命令语法约定

在命令参考文档中，尖括号 `<...>` 表示必须由你提供的必填参数：

```text
/command <必填参数>
```

实际输入命令时请不要输入尖括号本身。例如，`/perms group <group> info` 在实际执行时应输入：

```text
/perms group moderator info
```

目标玩家参数（`<targets>`）支持输入玩家名称或兼容的 Minecraft 目标选择器（如 `@s`、`@a`）。使用玩家档案（Profile）作为目标的命令还可以解析曾经进过服的已知离线玩家。

## 命令权限

大多数命令的权限键直接由其带命名空间的命令 ID 派生而来：

```text
<命名空间>.command.<命令名>
```

部分命令族还会为各个子操作发布更细粒度的权限节点。除非被更具体的拒绝规则（`deny`）覆盖，否则授予根级命令权限即可解锁其下属的所有子操作。后台控制台（Console）与 RCON 始终绕过玩家权限检查。

关于权限键、权限组、上下文选择器与冲突裁决规则的详细说明，请参阅[权限配置](../../configuration/permissions)。
