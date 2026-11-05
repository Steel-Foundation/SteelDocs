---
title: 安装指南
description: 如何在你的系统上安装并运行 Steel。
sidebar:
  order: 1
---

本指南将向你介绍如何安装并运行 Steel。\
你有以下几种安装方式可供选择：

- [预编译二进制文件](#预编译二进制文件)
- [Docker 容器](#docker)
- [面板 Egg（Pelican / Pterodactyl）](#面板-eggpelican--pterodactyl)
- [从源码自行编译](#从源码自行编译)

## 如何选择安装方式

建议根据 Steel 的实际部署环境选择最合适的安装方式：

- 如果你想直接在宿主机系统上裸机运行 Steel，请使用**预编译二进制文件**。
- 如果你已经在使用 Kubernetes、Docker Swarm 或标准 Docker 宿主机，推荐使用**Docker 容器**。
- 如果你的目标环境是 Pelican、Pterodactyl（翼龙面板）或其他基于 Egg 的服务器管理面板，请使用官方提供的 JSON 或 YAML 格式**Steel Egg**。
- 如果你希望针对本机 CPU 指令集榨干原生性能，或者你的系统平台/架构暂未提供预编译包，请针对目标系统**从源码编译 Steel**。

| 安装方式                          | Linux x64 | Linux arm64 | Linux armv7 | Linux armv6 | Windows x64 | Windows arm | Mac arm | Mac x64 |
| --------------------------------- | :-------: | :---------: | :---------: | :---------: | :---------: | :---------: | :-----: | :-----: |
| [二进制文件](#预编译二进制文件) |    ✅     |     ❌      |     ❌      |     ❌      |     ✅      |     ❌      |   ✅    |   ❌    |
| [Docker](#docker)                 |    ✅     |     ✅      |     ❌      |     ❌      |     ✅      |     ✅      |   ✅    |   ✅    |
| [面板 Egg](#面板-eggpelican--pterodactyl) |    ✅     |     ❌      |     ❌      |     ❌      |     ❌      |     ❌      |   ❌    |   ❌    |
| [源码自编译](#从源码自行编译)   |    ✅     |     ✅      |     ⚠️      |     ⚠️      |     ✅      |     ✅      |   ✅    |   ✅    |

✅：已支持。 ❌：暂不支持。 ⚠️：需要少量手动调整。

下方各节将详细介绍每种安装方式的具体步骤。

## 预编译二进制文件

你可以在我们的[下载页面](../../download)获取面向以下平台的预编译二进制文件：

- Linux (x86_64)
- Windows (x86_64)
- macOS (ARM / Apple Silicon)

你也可以在 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 页面下载完全相同的文件。

下载完成后，只需在可执行文件所在目录打开你常用的终端（例如 PowerShell、Ghostty、Kitty 等），运行以下命令即可启动服务端：

```bash
# Windows
./steel.exe

# macOS / Linux
./steel
```

:::caution
由于二进制文件暂未进行 Apple 官方公证签名，macOS 用户需要先开启系统的开发者模式才能运行 Steel。

你可以在终端中运行以下命令并输入管理员密码来启用：

```bash
sudo devtools enable
```
:::

## Docker

Steel 不会发布 `latest` Docker 标签（Tag）。请始终指定具体的版本号标签，这样版本升级始终处于你的可控计划之内，避免容器发生意外自动更新。

`nightly` 标签可用于插件测试以及提前体验最新改动。它紧跟 `master` 分支的最新提交，可能包含尚未在正式版中修复的 Bug。**请勿在生产环境中使用 `nightly` 镜像。**### 启动容器

暴露服务端端口并将本地目录挂载为配置、存档与日志目录来启动 Steel 容器：

```bash
docker run -d -it -p 25565:25565 -v ./config:/config -v ./saves:/saves -v ./logs:/logs --name steel-mc ghcr.io/steel-foundation/steelmc:<version>
```

:::tip
要进入 Docker 容器内的 Steel 后台控制台，可运行以下命令：
```bash
docker attach <steel-mc|容器名称>
```
:::

:::note
拉取每夜构建版（Nightly）镜像的命令为：`docker pull ghcr.io/steel-foundation/steelmc:nightly`
:::

:::tip
同样的配置也可以写成 Docker Compose 服务文件（推荐）：

```yaml
# docker-compose.yml
services:
  steel:
    image: ghcr.io/steel-foundation/steelmc:<version>
    stdin_open: true
    tty: true
    container_name: steel-mc
    ports:
      - 25565:25565
    volumes:
      - ./config:/config
      - ./saves:/saves
      - ./logs:/logs
```

Docker Compose 是将 `docker run` 参数固化到配置文件中的常用方式。\
完整的 Docker Compose 配置参考请参阅：https://docs.docker.com/reference/compose-file/
:::

### 如何修改端口与挂载目录

如果你对 Docker 配置不太熟悉，可以参考以下常用参数速查说明：

- **`-p`（`--port`、`ports`）：**冒号前的第一个数字代表宿主机外部端口（可按需修改）；冒号后的第二个数字是 Docker 容器内部端口（仅在修改了 Steel 配置文件中的监听端口时才需同步修改）。例如，`-p 1111:25565` 会让外部玩家通过 Linux 服务器的 `1111` 端口连接到 Minecraft 服务端。
- **`-v`（`--volume`、`volumes`）：**冒号前的路径是宿主机上的本地路径（可使用相对于 `docker-compose.yml` 的相对路径）；冒号后的路径是容器内部路径，请勿修改。

## 面板 Egg（Pelican / Pterodactyl）

针对 Pelican 与 Pterodactyl（翼龙面板），Steel 提供了可直接从面板 Egg 商店导入的预设配置。

对于其他兼容 Egg 的面板平台，可以使用我们代码仓库中提供的 JSON 或 YAML Egg 文件，或在对应商店上线后直接下载导入。

Pelican：`[即将推出]`

Pterodactyl（翼龙面板）：`[即将推出]`

## 从源码自行编译

### 环境要求

- **Rust Nightly 工具链**—— Steel 使用了 Rust 2024 Edition 及 Nightly 特性
- **64 位操作系统**—— Linux、macOS 或 Windows
- **Git**—— 用于克隆代码仓库

### 安装 Rust

如果你尚未安装 Rust，请使用 [rustup](https://rustup.rs/) 进行安装：

```bash
# 仅限 Unix 系统（如 macOS、Linux）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel 依赖 Nightly 工具链。代码仓库根目录下已包含 `rust-toolchain.toml`，调用 Cargo 时会自动选择并安装正确的工具链版本。

### 从源码编译

```bash
# 克隆代码仓库
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# 以 Release 模式编译（针对本机 CPU 指令集优化，推荐用于实际运行）
cargo build-native --release
```

:::note
**编译产物二进制文件位于 `./target/release/steel`**
:::

:::caution
如果你想针对 32 位 `armv6` 与 `armv7` 架构编译，还需要克隆 `simdnbt` 仓库，在 `Cargo.toml` 中指向你的本地路径，并移除 `simdnbt` 中的 64 位架构限制。
如需协助，欢迎前往我们的 [Discord](/discord) 获取支持。
:::

#### 常用构建命令

| 命令                           | 用途说明                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| `cargo build-native`           | Debug 构建（编译快、运行慢，启用当前 CPU 架构专属指令集优化）            |
| `cargo build-native --release` | Release 构建（编译慢、运行高度优化，启用当前 CPU 架构专属指令集优化）    |
| `cargo build`                  | 通用 Debug 构建（编译快、运行慢）                                        |
| `cargo build --release`        | 通用 Release 构建（编译慢、运行高度优化）                                |
| `cargo check`                  | 快速语法与类型检查（不生成二进制文件）                                   |
| `cargo test`                   | 运行测试套件                                                             |
| `cargo clippy`                 | 运行 Clippy 静态代码检查                                                 |

:::caution
使用 `build-native` 编译出的原生二进制文件针对编译机 CPU 指令集做了特化，无法直接复制到其他不同架构/型号 CPU 的机器上运行（除非目标机器具有完全相同的 CPU 架构特性）。
:::

#### 编译特性开关（Build Features）

Steel 支持通过 `--features` 参数启用可选的编译期特性：

```bash
# 启用死锁检测（仅建议在调试时使用）
cargo build-native --features deadlock_detection

# 启用基于 dhat 的堆内存分析
cargo build-native --features dhat-heap

# 禁用默认的 mimalloc 内存分配器
cargo build-native --no-default-features
```**可用特性列表：**| 特性名称             | 说明                                                        |
| -------------------- | ----------------------------------------------------------- |
| `mimalloc`           | 使用 mimalloc 内存分配器（默认启用）                        |
| `deadlock_detection` | 启用 `parking_lot` 死锁检测，用于排查锁竞争与死锁问题       |
| `dhat-heap`          | 启用基于 `dhat` 的堆内存分配分析（Heap Profiling）          |

在开发过程中，如果你遇到服务端无响应挂起或怀疑存在锁冲突，**死锁检测（`deadlock_detection`）** 会非常实用。启用后，`parking_lot` 会自动检测潜在死锁并触发 Panic 输出详细诊断调用栈。

### 启动服务端

```bash
# 直接通过 Cargo 运行（Debug 模式）
cargo run-native

# 以 Release 优化模式运行
cargo run-native --release

# 或者直接运行已编译好的二进制文件
./target/release/steel
```

## 下一步

现在你已经成功运行起 Steel 服务端，接下来请前往[配置概览](../../configuration/overview)自定义你的服务器设置。
