---
title: 如何添加服务器链接 (Server Links)
description: 了解 Minecraft 服务器链接的基础概念与配置方式。
---

首先，什么是服务器链接（Server Links）？这一功能允许你在玩家按下 `Esc` 打开的暂停菜单中添加可点击的超链接按钮，例如服务器官网、封禁申诉页、社区规则、赞助商店或问题反馈页面等。

Steel 支持两种配置方式：一种是使用原版内置的预设标签类型（配置简单快捷，并自动跟随客户端语言显示）；另一种是使用自定义文本组件（`TextComponent`），可以自由定制文字内容、颜色与粗体等格式。

## 启用服务器链接

首先需要在 `config/config.toml` 中启用服务器链接功能：

```toml
# /config/config.toml

[server.server_links]
# 启用服务器链接功能
enable = true
```

将该配置段添加在 `[server]` 配置下方即可。如果需要临时关闭，只需将 `enable` 设为 `false`。

## 原版内置服务器链接类型

Minecraft 原版提供了 10 种内置链接标签类型：

- `bug_report`（漏洞报告）
- `community_guidelines`（社区准则）
- `support`（技术支持）
- `status`（服务器状态）
- `feedback`（意见反馈）
- `community`（社区）
- `website`（官方网站）
- `forums`（论坛）
- `news`（新闻动态）
- `announcements`（官方公告）

其中唯独 `bug_report` 具有特殊行为：当服务端断开连接、抛出异常或向客户端发送了异常数据包触发协议错误界面时，客户端也会在报错画面上直接展示该 `bug_report` 链接按钮。

配置写法如下：
```toml
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

完整片段示例：
```toml
# /config/config.toml

[server.server_links]
# 启用服务器链接功能
enable = true

# 内置链接类型（直接使用字符串标签）
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

## 自定义文本组件链接

你也可以将 `label` 配置为 `TextComponent`（文本组件），从而完全自定义按钮文字、颜色与字体样式：
```toml
[[server.server_links.links]]
label = { text = "加入 SteelMC Discord 社区", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```

### 更多参考

你可以在网上查阅更多关于 Minecraft `TextComponent` 聊天组件格式与颜色代码的教程。

<details>
<summary>完整配置文件示例</summary>

```toml
# /config/config.toml

[server]
# 服务端端口
server_port = 25565
# 最大在线玩家数
max_players = 20
# 最大视距（区块）
view_distance = 10
# 最大模拟距离（区块）
simulation_distance = 10
# 是否启用 Mojang 正版验证
online_mode = true
# 是否启用客户端-服务端通信加密
encryption = true
# 服务器列表显示的标语 (MOTD)
motd = "A Steel Server"
# 是否启用自定义服务器图标
use_favicon = true
# 服务器图标路径（PNG 格式，64x64 像素）
favicon = "config/favicon.png"
# 是否强制要求安全聊天签名
enforce_secure_chat = false

# 网络压缩设置
[server.compression]
threshold = 256
level = 4

# 服务器链接配置
[server.server_links]
# 启用服务器链接功能
enable = true

# 内置链接类型（字符串标签）
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

# 另一个内置链接类型
[[server.server_links.links]]
label = "website"
url = "https://github.com/4lve/SteelMC"

# Discord 公告频道
[[server.server_links.links]]
label = "announcements"
url = "https://discord.com/channels/1428487339759370322/1428487584966774795"

# 自定义 TextComponent（带样式的对象标签）
[[server.server_links.links]]
label = { text = "加入 SteelMC Discord 社区", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```
</details>
