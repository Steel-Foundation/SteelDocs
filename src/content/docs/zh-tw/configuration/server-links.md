---
title: 如何新增伺服器連結 (Server Links)
description: 了解 Minecraft 伺服器連結的基本概念與設定方式。
---

首先，什麼是伺服器連結（Server Links）？這項功能允許你在玩家按下 `Esc` 開啟的暫停選單中加入可點擊的超連結按鈕，例如伺服器官網、停權申訴頁面、社群規範、贊助商店或問題回報頁面等。

Steel 支援兩種設定方式：一種是使用原版內建的預設標籤類型（設定簡單快速，並自動跟隨用戶端語言顯示）；另一種是使用自訂文字組件（`TextComponent`），可以自由定義文字內容、顏色與粗體等樣式。

## 啟用伺服器連結

首先需要在 `config/config.toml` 中啟用伺服器連結功能：

```toml
# /config/config.toml

[server.server_links]
# 啟用伺服器連結功能
enable = true
```

將此設定區段加在 `[server]` 設定下方即可。若要暫時停用，只需將 `enable` 設為 `false`。

## 原版內建伺服器連結類型

Minecraft 原版提供了 10 種內建連結標籤類型：

- `bug_report`（錯誤回報）
- `community_guidelines`（社群守則）
- `support`（技術支援）
- `status`（伺服器狀態）
- `feedback`（意見回饋）
- `community`（社群）
- `website`（官方網站）
- `forums`（論壇）
- `news`（最新消息）
- `announcements`（官方公告）

其中唯獨 `bug_report` 具有特殊行為：當伺服器中斷連線、拋出例外狀況或傳送了格式錯誤的封包給用戶端而觸發協定錯誤畫面時，用戶端也會在錯誤畫面上直接顯示該 `bug_report` 連結按鈕。

設定寫法如下：
```toml
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

完整片段範例：
```toml
# /config/config.toml

[server.server_links]
# 啟用伺服器連結功能
enable = true

# 內建連結類型（直接使用字串標籤）
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

## 自訂文字組件連結

你也可以將 `label` 設定為 `TextComponent`（文字組件），進而完全自訂按鈕文字、顏色與字體樣式：
```toml
[[server.server_links.links]]
label = { text = "造訪 SteelMC Discord 社群", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```

### 更多參考資源

你可以在網路上查閱更多關於 Minecraft `TextComponent` 聊天組件格式與顏色代碼的教學。

<details>
<summary>完整設定檔範例</summary>

```toml
# /config/config.toml

[server]
# 伺服器連接埠
server_port = 25565
# 最大在線玩家人數
max_players = 20
# 最大視野距離（區塊）
view_distance = 10
# 最大模擬距離（區塊）
simulation_distance = 10
# 是否啟用 Mojang 正版驗證
online_mode = true
# 是否啟用用戶端-伺服器通訊加密
encryption = true
# 伺服器列表顯示的訊息 (MOTD)
motd = "A Steel Server"
# 是否啟用自訂伺服器圖示
use_favicon = true
# 伺服器圖示路徑（PNG 格式，64x64 像素）
favicon = "config/favicon.png"
# 是否強制要求安全聊天簽章
enforce_secure_chat = false

# 網路壓縮設定
[server.compression]
threshold = 256
level = 4

# 伺服器連結設定
[server.server_links]
# 啟用伺服器連結功能
enable = true

# 內建連結類型（字串標籤）
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

# 另一個內建連結類型
[[server.server_links.links]]
label = "website"
url = "https://github.com/4lve/SteelMC"

# Discord 公告頻道
[[server.server_links.links]]
label = "announcements"
url = "https://discord.com/channels/1428487339759370322/1428487584966774795"

# 自訂 TextComponent（帶格式樣式的物件標籤）
[[server.server_links.links]]
label = { text = "造訪 SteelMC Discord 社群", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```
</details>
