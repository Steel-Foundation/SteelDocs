---
title: 如何升级 Minecraft 目标版本
description: SteelMC 升级适配 Minecraft 新版本的完整操作指南。
---

本指南详细介绍了将 Steel 升级适配至 Minecraft 新版本所需的完整步骤与关键核对点。

正如你所预料的那样，将 Steel 这样一个高性能服务端升级到全新的 Minecraft 版本绝非轻而易举的小任务，请务必保持耐心！

**需要掌握的前置知识：**- Java 与 Rust 开发经验
- Gradle 构建工具基础

要升级 Steel，我们首先需要从新版 Minecraft 中提取出所有最新的结构与注册表信息。这意味着升级流程始于**SteelExtractor** 数据提取器。如果你还不了解它，可以在[此处阅读详细说明](../tools/steel_extractor)。

为了确保版本平稳过渡并降低工作负荷，建议在 Mojang 刚发布新版本快照（Snapshot）阶段就着手开始跟进升级。

## 1. 修改 SteelExtractor 的目标版本

在 SteelExtractor 的 `gradle.properties` 中配置了目标 Minecraft 版本及其依赖版本：

```properties
minecraft_version=26.1-snapshot-11
loader_version=0.18.4
loom_version=1.15-SNAPSHOT
fabric_kotlin_version=1.13.9+kotlin.2.3.10
```

升级至新版本的修改步骤如下：

1. 将 `minecraft_version` 修改为目标版本号
2. 更新 `fabric_version`，使其适配该 Minecraft 版本的最新 Fabric API
3. 如有需要，更新 `loader_version` 与 `fabric_kotlin_version`
4. 如适用，更新 `build.gradle` 中的 Parchment 映射表版本

你可以在 [https://fabricmc.net/develop](https://fabricmc.net/develop) 查询对应的各组件版本号。

配置完成后，按[数据提取指南](../tools/steel_extractor/)运行 Minecraft 并提取数据。\
例如在 26.1 快照阶段，Gradle 构建系统经历了重大变更，并将运行环境从 Java 21 升级到了 Java 25。该快照涉及的所有修改细节可参阅此提交：https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. 拷贝 SteelExtractor 生成的 JSON 文件

将生成的全部 JSON 文件移动并覆盖到 Steel 仓库中的对应位置。在最新版本中，Extractor 运行输出目录下的子文件夹结构已经与 Steel 保持一对一完全一致。

## 3. 从新版 Minecraft 原版客户端提取内置数据

获取新版 Minecraft 的 client.jar。这可以通过官方启动器下载，也可以从 Mojang 官方分发链接获取。下载后将其解压，解压后会呈现如下目录结构：

```text
└── 📁minecraft-26.1-snapshot-11-client
    └── 📁assets
    └── 📁com
    └── 📁data
    └── 📁META-INF
    └── 📁net
    ├── flightrecorder-config.jfc
    ├── pack.png
    └── version.json
```

将解压出的 `data` 目录完整拷贝到：`steel-registry/build_assets/builtin_datapacks/minecraft/data`。\
拷贝完成后整体目录结构如下：

```text
└── 📁build_assets
    └── 📁builtin_datapacks
        └── 📁minecraft
            └── 📁data
                └── 📁minecraft
                    └── 📁advancement
                    └── 📁equipment
                    └── 📁font
                    └── 📁frog_variant
                    └── 📁instrument
                    └── 📁items
                    ...
                    └── 📁zombie_nautilus_variant
                ├── .mcassetsroot
            ├── pack.mcmeta
    ├── attributes.json
    ├── block_entities.json
    ├── blocks.json
    ├── entities.json
    ├── fluids.json
    ├── game_rules.json
    ├── items.json
    ├── level_events.json
    ├── menutypes.json
    ├── mob_effects.json
    ├── multi_noise_biome_source_parameters.json
    ├── packets.json
    ├── potions.json
    ├── sound_events.json
    ├── sound_types.json
    └── tags.json
```

## 4. 修复注册表编译报错

注册表修复流程分为两个阶段。\
在绝大多数情况下，引入新数据后注册表会立即报错并导致 Steel 无法编译，因为某些原版数据结构发生了变更。因此我们首先修复注册表模块。

Steel 的注册表模块由三个主要文件夹构成：
- `build_assets`：存放上一步提取出的原始 JSON 与内置数据包。
- `build`：包含在编译期根据 JSON 数据自动生成 Rust 代码的构建脚本源码。这就是第一阶段的修改所在。\
建议在拷贝完新文件后执行 `git diff`，查看哪些 JSON 文件的字段和数据结构发生了改变，从而确定需要同步修改哪些注册表生成逻辑。\
随后在 `build` 目录中调整对应的生成代码。修改完毕后，代码生成出的注册表本身通常会暴露第二阶段的编译报错（因为运行时的注册表消费端结构尚未同步更新）。在实际的注册表源码中对应同步这些结构变更后，整个模块即可顺利通过编译。

## 5. 修复与适配剩余模块

这一步包括修复因版本更新带来的协议数据包（Packets）变更、世界生成管线变动，并逐步实现新版本引入的全新游戏机制与特性。具体工作量取决于该版本改动的广度。祝升级顺利！
