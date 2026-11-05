---
title: 核心术语表 (Terminology)
description: Steel 中常见的世界管理与配置核心术语说明。
sidebar:
  order: 1
---

Steel 对部分概念的命名与原版 Minecraft 以及 Mojang 内部源码中的习惯称呼略有不同。本页汇总了文档中频繁出现的世界管理与配置核心术语定义。

## 快速速查表

| 术语 | 含义简述 |
| --- | --- |
| [标识符（Identifier）](#identifier) | 由 `namespace:path` 组成的唯一名称，用于标识 Minecraft 与 Steel 中的各类资源 |
| [域（Domain）](#domain) | 共享玩家数据与默认配置的一组相关联世界的集合 |
| [世界（World）](#world) | 域（Domain）内部的一张可游玩地图 |
| [维度（Dimension）](#dimension) | 世界所使用的物理规则集与视觉属性（高度、天空、迷雾等） |
| [世界生成器（World Generator）](#world-generator) | 负责生成地形并选择或接受维度类型的生成系统 |
| [传送门目标（Portal Target）](#portal-target) | 传送门将玩家或实体送往的同域目标世界 |

<a id="identifier"></a>

## 标识符（Identifier）

**标识符（Identifier）** 是由命名空间（Namespace）与路径（Path）组成的名称，书写格式为 `namespace:path`。

常见示例包括：`minecraft:overworld`、`minecraft:flat`、`minecraft:stone`、`minecraft:stick` 以及 `steel:disk`。

Steel 使用标识符来指代世界生成器、维度类型、存储后端、方块和物品等各类资源。在所属的注册表或配置上下文中，每个标识符都应当是唯一的。

在世界配置中，域名（Domain Name）遵循命名空间部分的语法规则，而世界名（World Name）遵循路径部分的语法规则。

<a id="domain"></a>

## 域（Domain）**域（Domain）** 是一组彼此关联的世界（Worlds）的集合，也是 `worlds.toml` 配置文件中的最高组织层级。

诸如种子（Seed）、默认游戏模式、难度与存储后端等域级别设置，会自动被该域下的所有世界继承。**玩家数据（物品栏、经验、位置等）也是绑定在“域”上的**——在两个不同的域之间切换，体验上类似于在群组服中切换子服，因为玩家数据不会跨出域的边界。

例如：一套标准的原版生存配置通常包含一个名为 `minecraft` 的域，其下包含主世界（`overworld`）、下界（`the_nether`）和末地（`the_end`）三个世界。

<a id="world"></a>

## 世界（World）**世界（World）** 是位于某个域内部的一张可游玩地图。

在原版 Minecraft 中，大家通常直接称呼它们为主世界、下界或末地。而在 Steel 中，你可以在同一个域下定义比原版更多的世界：例如，一个域内可以同时包含 `overworld`、`overworld_2`（资源世界）和 `testing`（测试世界）。

每个世界都需要指定一个世界生成器（World Generator），并且可以单独覆盖从所属域继承来的种子、游戏模式、难度或存储后端等设置。

<a id="dimension"></a>

## 维度（Dimension）**维度（Dimension）** 描述了一个世界所采用的物理规则与视觉环境属性，包括建筑高度范围、天空渲染、迷雾颜色以及其他维度专属机制（例如水是否会蒸发、床是否会爆炸）。

例如：主世界（Overworld）维度的总高度为 384 格；下界（Nether）具有下界专属迷雾；末地（The End）具有末地星空天空盒。

注意：**维度并不等同于一张具体的存档地图**——多个不同的世界完全可以使用同一种维度类型。

<a id="world-generator"></a>

## 世界生成器（World Generator）**世界生成器（World Generator）** 负责为世界生成具体的地形方块。

有些生成器固定绑定某一个维度（例如 `minecraft:overworld` 生成器固定使用主世界维度）；而另一些生成器则支持在配置中指定维度类型（例如 `minecraft:flat` 超平坦生成器可以使用主世界、下界或末地的维度属性来创建超平坦世界）。

<a id="portal-target"></a>

## 传送门目标（Portal Target）

**传送门目标（Portal Target）** 是指传送门将玩家或实体传送过去的**同一域内**的目标世界。

默认情况下，Steel 遵循原版约定的世界名称自动关联（`overworld`、`the_nether` 与 `the_end`）。如果你使用了自定义的世界名称，可以在 `worlds.toml` 中通过 `nether_portal_target` 和 `end_portal_target` 显式指定目标世界。

## 相关页面

- [世界配置](../../configuration/world-configuration)
