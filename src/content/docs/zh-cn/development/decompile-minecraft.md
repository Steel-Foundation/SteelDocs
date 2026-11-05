---
title: 如何反编译 Minecraft
description: 如何反编译 Minecraft Java 版游戏本体以作为开发参考。
---

在 Minecraft 1.21.11 之前，原版代码经过混淆，必须借助反混淆映射表（Mapping）才能阅读；而本服务端的适配目标版本为 >= 1.21.11，原版已停止混淆，因此本文档针对这些免混淆的现代版本进行说明。

## 准备工作

你可以通过 Minecraft 官方启动器或第三方启动器（如 Prism Launcher 等）创建一个目标版本的客户端实例并启动一次，启动器会自动将对应的 `*.jar` 文件下载到本地。下载完成后找到该 jar 文件，即可使用下列几种方式之一进行反编译查看。

## 几种反编译与查看方式

- **使用官方仓库脚本**：直接运行 Steel 仓库中自带的 `update-minecraft-src.sh` 反编译脚本（该脚本底层使用 `gitcraft` 实现）。
- **在线查看反编译源码**：直接访问 [mcsrc.dev](https://mcsrc.dev)（例如直接打开 [https://mcsrc.dev/1/26.1](https://mcsrc.dev/1/26.1)），不仅免去本地配置，还方便将具体代码行的链接分享给其他协作者。
- **使用 GitCraft 生成本地 Git 仓库**：克隆 [gitcraft](https://github.com/WinPlay02/GitCraft) 仓库，并运行以下命令：
  ```bash
  ./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"
  ```
  运行完成后会在 `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` 目录下生成完整的反编译源码仓库。
- **使用 Vineflower 反编译** ：下载最新的 [vineflower.jar](https://github.com/Vineflower/vineflower/releases)，然后执行：
  ```bash
  java -jar vineflower-1.11.2.jar ./minecraft-26.1-client.jar --folder minecraft_26.1
  ```
  这会将源码完整解压到 `minecraft_26.1` 文件夹中。

## 其他实用参考资源

- 视频网站上的各类 Minecraft 模组开发与反编译教程。
