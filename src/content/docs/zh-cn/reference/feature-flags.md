---
title: 编译期特性开关 (Feature Flags)
description: SteelMC 编译期 Cargo Feature Flags 的完整参考。
---

SteelMC 使用 Rust 的 Cargo 特性开关（Feature Flags）在编译期启用或禁用特定功能。你可以利用它们按需定制适用于生产部署、死锁调试、内存性能分析、遥测追踪或代码生成维护的专属构建版本。

大多数用户通过顶层的 `steel` 包编译服务端可执行文件：

```bash
cargo build -p steel --features "feature_name"
```

## steel

以下特性开关用于控制服务端主可执行文件：

| 特性名称              | 默认启用 | 说明                                                                                                     |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `mimalloc`            | 是       | 使用 MiMalloc 作为全局内存分配器，以提升多线程高频内存分配性能。                                         |
| `stand-alone`         | 否       | 将默认服务器图标内嵌至二进制文件中，并在配置的图标文件缺失时自动写出。                                   |
| `deadlock_detection`  | 否       | 启用 `parking_lot` 的死锁检测功能，用于并发锁问题调试。                                                  |
| `dhat-heap`           | 否       | 启用 DHAT 堆内存分析器（Heap Profiler）。当与 `mimalloc` 同时开启时，DHAT 会接管并替换全局内存分配器。   |
| `spawn_chunk_display` | 否       | 在启动阶段生成出生点区块时，在终端中打印彩色的区块阶段进度网格。                                         |
| `slow_chunk_gen`      | 否       | 在出生点准备阶段人为放慢区块生成速度，并向下传递给 `steel-core/slow_chunk_gen`；便于观察终端区块生成网格。 |
| `jaeger`              | 否       | 启用基于 OTLP 协议的 OpenTelemetry 链路追踪导出，适用于 Jaeger 等追踪后端。                              |

### 使用示例

```bash
# 启用死锁检测进行构建
cargo build -p steel --features deadlock_detection

# 禁用默认的 MiMalloc 分配器进行构建
cargo build -p steel --no-default-features

# 启用出生点区块终端网格可视化与慢速生成演示
cargo build -p steel --features "spawn_chunk_display slow_chunk_gen"

# 启用 Jaeger / OpenTelemetry 追踪支持
cargo build -p steel --features jaeger
```

## steel-core

以下特性开关控制核心游戏逻辑与底层调试辅助功能：

| 特性名称         | 默认启用 | 说明                                                                                                                               |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `stand-alone`    | 否       | 在 `steel-core` 的 `Cargo.toml` 中有声明，但目前 `steel-core` 内部尚无活动的 `cfg(feature = "stand-alone")` 分支（内嵌图标逻辑由 `steel` 二进制包处理）。 |
| `slow_chunk_gen` | 否       | 当服务端开启慢速出生点生成时，在每个区块生成阶段之后插入短暂延迟。                                                                 |
| `flint`          | 否       | 暴露行为系统（Behavior）自省辅助接口，包括具体行为类型名称及行为注册表切片（供实现状态同步脚本等工具使用）。                       |

## steel-registry

以下特性开关控制游戏注册表系统与自动生成的注册表代码：

| 特性名称        | 默认启用 | 说明                                                                                     |
| --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `fmt`           | 否       | 在构建脚本（`build.rs`）生成注册表代码后自动对其运行 `rustfmt` 格式化。                  |
| `minecraft-src` | 否       | 启用将生成出的注册表数据与反编译参考数据 `minecraft-src` 进行比对校验的辅助功能。        |

## steel-utils

以下特性开关控制自动生成的通用工具数据代码：

| 特性名称 | 默认启用 | 说明                                                                    |
| -------- | -------- | ----------------------------------------------------------------------- |
| `fmt`    | 否       | 在构建脚本（`build.rs`）生成工具代码文件后自动对其运行 `rustfmt` 格式化。 |

## steel-worldgen

以下特性开关控制自动生成的世界生成数据代码：

| 特性名称 | 默认启用 | 说明                                                                        |
| -------- | -------- | --------------------------------------------------------------------------- |
| `fmt`    | 否       | 在构建脚本（`build.rs`）生成世界生成代码文件后自动对其运行 `rustfmt` 格式化。 |

## 组合使用多个特性

你可以在单次构建中同时开启多个特性（以空格或逗号分隔）：

```bash
# 同时启用多项服务端调试特性
cargo build -p steel --features "deadlock_detection spawn_chunk_display slow_chunk_gen"

# 构建内嵌默认图标的独立分发版服务端
cargo build -p steel --release --features stand-alone

# 在编译 steel-registry 时格式化生成的代码
cargo build -p steel-registry --features fmt
```

Cargo 的特性开关是按包（Package）隔离的。当需要启用非 `steel` 主包的子包特性时，请通过 `-p <包名>` 显式指定目标包。

## 生产环境建议

对于正式的生产环境服务器，建议遵循以下原则：

- 保持启用默认的 `mimalloc`（除非你正在使用 `dhat-heap` 进行内存分析）。
- 保持关闭 `deadlock_detection`、`dhat-heap`、`spawn_chunk_display` 和 `slow_chunk_gen`。
- 仅在希望二进制文件自动释放默认服务器图标时按需开启 `stand-alone`。
- 仅在已部署好 OTLP 追踪收集器（Collector）时开启 `jaeger`。
- `fmt` 与 `minecraft-src` 仅用于开发阶段与生成代码验证，无需在生产构建中开启。
