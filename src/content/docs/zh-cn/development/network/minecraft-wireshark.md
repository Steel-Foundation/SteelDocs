---
title: 使用 Wireshark 调试网络流量
description: 如何使用 Wireshark 抓包分析 Minecraft 网络协议数据包。
---

本文档介绍了如何使用 Wireshark 抓包分析 Minecraft 客户端与服务端之间的原始网络流量。

如果你不想使用 Wireshark，也可以参考社区的另一个抓包项目：[SniffCraft](https://github.com/adepierre/SniffCraft)。

## 准备工作

首先，必须在服务端中 **禁用加密与数据包压缩**：
将压缩阈值（threshold）设为足够大或禁用，相关配置位于初次启动后生成的 `config/config.toml` 中。

你需要准备：

- 一个本地运行的**Minecraft 服务端**- 具备抓取 `localhost`（回环网卡）权限的**Wireshark**抓取到的数据包可以对照 Minecraft 官方协议文档进行核对：
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

## 安装 Minecraft 协议解析插件 (Dissector)

推荐编译并使用 Wireshark 的 Minecraft 协议解析插件：

- **仓库地址**：[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)
- **推荐版本**：Wireshark 4.6

按照仓库说明编译出 `.so` 或 `.dll` 动态库后，复制到 Wireshark 插件目录中。

## 过滤显示规则

在 Wireshark 中使用以下过滤器，即可过滤出清晰的 Minecraft 协议数据：

```text
mcje
```

经过插件解析后，数据包将呈现格式化的结构字段，极大方便了协议对接与调试。

![Wireshark 抓包输出视图](@/assets/wireshark_output.webp "Minecraft 数据包解析器输出示例")
