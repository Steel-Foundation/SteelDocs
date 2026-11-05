---
title: 常见问题 (FAQ)
description: 关于 SteelMC 的常见问题解答。
---

这里汇总了大家最常问到的问题与解答！
:::caution[免责声明]
Steel 目前仍处于 Pre-Alpha 早期开发阶段，因此各项功能特性与以下回答可能会随版本迭代频繁变动！
:::

## 我该如何安装 Steel？

你可以在[安装指南](../installation)中查看完整的安装与部署教程。

## 有提供面板 Egg 吗？

有的，我们提供了适用于翼龙面板（Pterodactyl）与 Pelican 的 Egg 配置文件，详情请参阅[安装指南](../installation)。

## 为什么找不到服务端 `*.jar` 文件？

Steel 不是用 Java 编写的，因此不存在 `*.jar` 文件。\
不用担心，你可以在我们的[下载页面](../../download)或 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 中直接下载适用于 Windows、Linux 与 macOS 的原生可执行文件。

## Steel 会实现原版特性对齐（Vanilla Parity）吗？

简明扼要地说： **这正是我们的核心目标。**

## Steel 支持插件吗？我现有的 Paper / Bukkit 插件能在 Steel 上用吗？

目前还不支持。Steel 仍在紧锣密鼓地开发中，插件系统已在规划内但尚未开放。\
未来 Steel 将推出原生插件 API，我们非常期待能博采 Paper / Bukkit 与主流模组 API 的众长！由于底层语言和架构不同，现有的 Paper / Bukkit Java 插件无法直接运行。

## 未来的插件会用什么语言编写？

核心原生插件 API 将使用 Rust 编写，同时社区也可以通过扩展支持 WebAssembly（WASM）或其他脚本运行时来接入更多编程语言。

## Steel 支持模组（Mods）吗？我能装现有的模组吗？

不支持 NeoForge / Forge / Fabric 模组。与插件类似，Steel 基于 Rust 构建，内部架构与 Java 版截然不同，未来扩展的实现方式与能力边界也会有所区别。

## 如何提高飞行速度？

只需在游戏内执行 `/fly speed <速度倍率>` 命令即可，其中速度倍率支持 0 到 30 之间的小数。

## 我可以把 `steel-worldgen`（世界生成模块）集成到 Paper 或 Fabric 中吗？

目前已经有一些概念验证（PoC）尝试，我们也很乐意提供协助，但本项目的核心目标是打造一个完整的独立 Minecraft 服务端。若要在 Java 服务端中调用 Rust 模块，通常需要借助 JNI 或 Project Panama。

## 为什么我快速飞行时每隔几秒就会被服务器拉回（回弹）？

这是由于触发了原版的玩家移动校验游戏规则（Gamerule），你可以执行 `/gamerule player_movement_check false` 来关闭该校验。

## 为什么不和其他 Rust Minecraft 服务端重写项目合并开发？

每个重写项目都有各自的技术愿景、架构取舍与管理方式。现有的其他项目未能完全契合我们的设计理念，因此我们决定从零开始打造 Steel。

## 我该如何参与并向 Steel 贡献代码？

请参阅我们的[贡献指南](../../development/start-contributing/)。

## 我遇到了问题或 Bug，该怎么办？

欢迎在 [GitHub Issues](https://github.com/Steel-Foundation/SteelMC/issues) 上提交反馈，或加入我们的 [Discord 社区](/discord) 并在 `bugs` 频道中报告。
