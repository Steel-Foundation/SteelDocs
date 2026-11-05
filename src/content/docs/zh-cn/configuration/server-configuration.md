---
title: 服务端配置
description: SteelMC 服务端 config/config.toml 所有配置项的完整参考。
sidebar:
  order: 2
---

SteelMC 通过位于 `config/config.toml` 的 TOML 配置文件进行配置。本页列出所有服务端全局配置项。

关于世界与维度的设置，请参阅[世界配置](../world-configuration)。

## 基础设置

| 配置项                                | 类型   | 默认值             | 说明                                                                         |
| ------------------------------------- | ------ | ------------------ | ---------------------------------------------------------------------------- |
| `server.server_port`                  | u16    | `25565`            | 服务端监听的 TCP 端口                                                        |
| `server.max_players`                  | u32    | `20`               | 允许同时在线的最大玩家数                                                     |
| `server.allow_extended_view_distance` | bool   | `false`            | 允许将 `view_distance` 设置为超过原版 32 区块上限的值（最高支持 Steel 的 127 区块上限） |
| `server.view_distance`                | u8     | `10`               | 最大视距（单位：区块）。通常为 1–32，开启扩展视距后支持 1–127                |
| `server.simulation_distance`          | u8     | `10`               | 最大模拟距离（单位：区块），必须小于或等于 `view_distance`                   |
| `server.motd`                         | String | `"A Steel Server"` | 多人游戏服务器列表中显示的标语（MOTD）                                       |

:::note
如果将视距（`view_distance`）设置到 32 区块以上，原版客户端仍需安装支持超远渲染距离的客户端模组（如 Bobby、Distant Horizons 或 Sodium 扩展）才能实际渲染超出 32 区块的画面。
:::

## 线程池设置

用于手动指定服务端各线程池的工作线程数量。设为 `0` 或省略时将使用各线程池的自动默认值（通常根据 CPU 核心数自动决定）。

| 配置项                            | 类型  | 默认值 | 说明                                                             |
| --------------------------------- | ----- | ------ | ---------------------------------------------------------------- |
| `server.threads.main_runtime`     | usize | `0`    | 主 Tokio 异步运行时的工作线程数。设为 `0` 或省略则使用自动默认值 |
| `server.threads.chunk_runtime`    | usize | `0`    | 区块 Tokio 异步运行时的工作线程数                                |
| `server.threads.chunk_generation` | usize | `0`    | Rayon 区块生成线程池的工作线程数                                 |

仅当你需要手动分配 CPU 资源（例如在同一台机器上为其他进程预留核心）时才需要调整这些选项。

## 安全与正版验证设置

| 配置项                       | 类型   | 默认值  | 说明                                                                    |
| ---------------------------- | ------ | ------- | ----------------------------------------------------------------------- |
| `server.online_mode`         | bool   | `true`  | 是否启用 Mojang 正版身份验证                                            |
| `server.auth_server`         | String | 省略    | 可选的在线模式 `hasJoined` 验证服务端点。省略则默认使用 Mojang 官方服务 |
| `server.profile_server`      | String | 省略    | 可选的玩家名称转档案（Profile）查询端点。省略则默认使用 Mojang 官方服务 |
| `server.services_server`     | String | 省略    | 可选的安全聊天公钥验证端点。省略则默认使用 Mojang 官方服务              |
| `server.encryption`          | bool   | `true`  | 是否启用客户端与服务端之间的网络通信加密                                |
| `server.allow_flight`        | bool   | `false` | 是否在原版移动检查中允许未经授权的客户端飞行                            |
| `server.enforce_secure_chat` | bool   | `false` | 是否强制要求安全聊天签名。需要同时开启 `online_mode = true` 与 `encryption = true` |

:::caution
关闭 `online_mode`（离线模式）将允许未经正版验证的客户端直接进服。仅建议在私有内网、已配置前置代理验证或本地开发调试时关闭。
:::

:::info
在进行协议调试或使用假人（Bot）压测时，建议临时关闭 `encryption`（仅限测试环境！）。
:::

## 聊天防刷屏设置

| 配置项                                  | 类型 | 默认值 | 说明                                                         |
| --------------------------------------- | ---- | ------ | ------------------------------------------------------------ |
| `server.chat_spam_threshold_seconds`    | i32  | `10`   | 原版聊天防刷屏积分时间窗口（秒）。设为 `<= 0` 可禁用防刷屏踢出 |
| `server.command_spam_threshold_seconds` | i32  | `10`   | 原版命令防刷屏积分时间窗口（秒）。设为 `<= 0` 可禁用防刷屏踢出 |

## 服务器图标（Favicon）设置

| 配置项               | 类型   | 默认值                 | 说明                                     |
| -------------------- | ------ | ---------------------- | ---------------------------------------- |
| `server.use_favicon` | bool   | `true`                 | 是否启用自定义服务器图标                 |
| `server.favicon`     | String | `"config/favicon.png"` | 图标文件路径（要求为 64×64 像素的 PNG） |

## 网络压缩设置

网络数据包压缩可以显著降低带宽占用，但会消耗少量 CPU 资源。

| 配置项                         | 类型 | 默认值 | 有效范围 | 说明                                     |
| ------------------------------ | ---- | ------ | -------- | ---------------------------------------- |
| `server.compression.threshold` | u32  | `256`  | `>= 256` | 触发压缩的数据包大小阈值（字节）         |
| `server.compression.level`     | i32  | `4`    | `1–9`    | Zlib 压缩等级（`1` = 最快，`9` = 压缩率最高） |

`[server.compression]` 表为可选项；如果省略该表，则禁用数据包压缩。

## 服务器链接（Server Links）

服务器链接会显示在客户端多人游戏暂停菜单中。

| 配置项                       | 类型  | 默认值   | 说明                     |
| ---------------------------- | ----- | -------- | ------------------------ |
| `server.server_links.enable` | bool  | `true`   | 是否启用服务器链接功能   |
| `server.server_links.links`  | Array | 4 个链接 | 要显示的服务器链接列表   |

详细配置方法请参阅[服务器链接配置指南](../server-links)。

## 日志设置

| 配置项              | 类型   | 默认值      | 说明                                                                   |
| ------------------- | ------ | ----------- | ---------------------------------------------------------------------- |
| `log.log_path`      | String | `"./.logs"` | 日志文件与控制台命令历史记录的存放目录                                 |
| `log.log_level`     | String | `"info"`    | 日志级别：`error`、`warn`、`info`、`debug` 或 `trace`                  |
| `log.time`          | String | `"uptime"`  | 日志时间格式：`none`（无）、`date`（日期时间）或 `uptime`（运行时长）  |
| `log.module_path`   | bool   | `false`     | 是否在日志中显示 Rust 模块路径                                         |
| `log.extra`         | bool   | `false`     | 是否显示额外调试元数据                                                 |
| `log.log_file`      | bool   | `true`      | 是否将日志同时写入磁盘文件                                             |
| `log.rotation_time` | String | `"daily"`   | 日志文件轮转周期：`none`、`hourly`、`daily`、`weekly` 或 `monthly`     |
| `log.max_history`   | usize  | `50`        | 控制台保存的最大历史命令条数                                           |

## 完整配置示例

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
allow_extended_view_distance = false
view_distance = 12
simulation_distance = 10
online_mode = true
# auth_server = "https://sessionserver.mojang.com/session/minecraft/hasJoined"
# profile_server = "https://api.minecraftservices.com/minecraft/profile/lookup/name"
# services_server = "https://api.minecraftservices.com/publickeys"
encryption = true
allow_flight = false
motd = "Welcome to my Steel server!"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false
chat_spam_threshold_seconds = 10
command_spam_threshold_seconds = 10

[server.threads]
main_runtime = 0
chunk_runtime = 0
chunk_generation = 0

[server.compression]
threshold = 256
level = 4

[server.server_links]
enable = true

[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

[log]
log_path = "./.logs"
log_level = "info"
time = "uptime"
module_path = false
extra = false
log_file = true
rotation_time = "daily"
max_history = 50
```

## 启动校验规则

服务端在启动时会对配置文件进行严格校验：

- 包含未知字段的配置会被直接拒绝
- `server.view_distance` 必须在 `1` 到 `32` 之间（当 `server.allow_extended_view_distance` 为 `true` 时必须在 `1` 到 `127` 之间）
- `server.simulation_distance` 必须小于或等于 `server.view_distance`
- `server.auth_server` 若已设置，必须是完整的 `http` 或 `https` 绝对 URL
- `server.profile_server` 若已设置，必须是完整的 `http` 或 `https` 绝对 URL
- `server.services_server` 若已设置，必须是完整的 `http` 或 `https` 绝对 URL
- `server.compression.threshold` 必须大于或等于 `256`
- `server.compression.level` 必须在 `1` 到 `9` 之间
- 当 `server.enforce_secure_chat` 为 `true` 时，`server.online_mode` 与 `server.encryption` 必须同时为 `true`
- `log.log_level`、`log.time` 与 `log.rotation_time` 必须使用上表列出的合法枚举值之一

如果任何一项校验未通过，服务端将打印错误信息并安全退出。
