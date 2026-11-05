---
title: 伺服器設定
description: SteelMC 伺服器 config/config.toml 所有設定選項的完整參考。
sidebar:
  order: 2
---

SteelMC 透過位於 `config/config.toml` 的 TOML 設定檔進行配置。本頁列出所有伺服器全域設定項。

關於世界與維度的設定，請參閱[世界設定](../world-configuration)。

## 基本設定

| 設定項                                | 型別   | 預設值             | 說明                                                                          |
| ------------------------------------- | ------ | ------------------ | ----------------------------------------------------------------------------- |
| `server.server_port`                  | u16    | `25565`            | 伺服器監聽的 TCP 連接埠                                                       |
| `server.max_players`                  | u32    | `20`               | 允許同時在線的最大玩家人數                                                    |
| `server.allow_extended_view_distance` | bool   | `false`            | 允許將 `view_distance` 設為超過原版 32 區塊上限的值（最高支援 Steel 的 127 區塊上限） |
| `server.view_distance`                | u8     | `10`               | 最大視野距離（單位：區塊）。一般為 1–32，啟用延伸視野距離後支援 1–127         |
| `server.simulation_distance`          | u8     | `10`               | 最大模擬距離（單位：區塊），必須小於或等於 `view_distance`                    |
| `server.motd`                         | String | `"A Steel Server"` | 多人遊戲伺服器列表中顯示的訊息（MOTD）                                        |

:::note
如果將視野距離（`view_distance`）設定超過 32 區塊，原版用戶端仍需安裝支援超遠渲染距離的用戶端模組（如 Bobby、Distant Horizons 或 Sodium 擴充）才能實際顯示超出 32 區塊的畫面。
:::

## 執行緒池設定

用於手動指定伺服器各執行緒池的工作執行緒數量。設為 `0` 或省略時將使用各執行緒池的自動預設值（通常依 CPU 核心數自動決定）。

| 設定項                            | 型別  | 預設值 | 說明                                                                 |
| --------------------------------- | ----- | ------ | -------------------------------------------------------------------- |
| `server.threads.main_runtime`     | usize | `0`    | 主 Tokio 非同步執行期的工作執行緒數。設為 `0` 或省略則使用自動預設值 |
| `server.threads.chunk_runtime`    | usize | `0`    | 區塊 Tokio 非同步執行期的工作執行緒數                                |
| `server.threads.chunk_generation` | usize | `0`    | Rayon 區塊生成執行緒池的工作執行緒數                                 |

僅當你需要手動調配 CPU 資源（例如在同一台機器上為其他程序預留核心）時才需要調整這些選項。

## 安全性與正版驗證設定

| 設定項                       | 型別   | 預設值  | 說明                                                                       |
| ---------------------------- | ------ | ------- | -------------------------------------------------------------------------- |
| `server.online_mode`         | bool   | `true`  | 是否啟用 Mojang 正版身分驗證                                               |
| `server.auth_server`         | String | 省略    | 選用的正版模式 `hasJoined` 驗證端點。省略則預設使用 Mojang 官方服務        |
| `server.profile_server`      | String | 省略    | 選用的玩家名稱轉個人檔案（Profile）查詢端點。省略則預設使用 Mojang 官方服務 |
| `server.services_server`     | String | 省略    | 選用的安全聊天公開金鑰驗證端點。省略則預設使用 Mojang 官方服務             |
| `server.encryption`          | bool   | `true`  | 是否啟用用戶端與伺服器之間的網路通訊加密                                   |
| `server.allow_flight`        | bool   | `false` | 是否在原版移動檢查中允許未經授權的用戶端飛行                               |
| `server.enforce_secure_chat` | bool   | `false` | 是否強制要求安全聊天簽章。需要同時啟用 `online_mode = true` 與 `encryption = true` |

:::caution
停用 `online_mode`（離線模式）將允許未經正版驗證的用戶端直接連線。僅建議在私有內部網路、已設定前置代理驗證或本機開發除錯時停用。
:::

:::info
在進行協定除錯或使用機器人（Bot）壓力測試時，建議暫時停用 `encryption`（僅限測試環境！）。
:::

## 聊天防洗頻設定

| 設定項                                  | 型別 | 預設值 | 說明                                                         |
| --------------------------------------- | ---- | ------ | ------------------------------------------------------------ |
| `server.chat_spam_threshold_seconds`    | i32  | `10`   | 原版聊天防洗頻積分時間視窗（秒）。設為 `<= 0` 可停用防洗頻限制 |
| `server.command_spam_threshold_seconds` | i32  | `10`   | 原版指令防洗頻積分時間視窗（秒）。設為 `<= 0` 可停用防洗頻限制 |

## 伺服器圖示（Favicon）設定

| 設定項               | 型別   | 預設值                 | 說明                                     |
| -------------------- | ------ | ---------------------- | ---------------------------------------- |
| `server.use_favicon` | bool   | `true`                 | 是否啟用自訂伺服器圖示                   |
| `server.favicon`     | String | `"config/favicon.png"` | 圖示檔案路徑（須為 64×64 像素的 PNG 檔） |

## 網路壓縮設定

網路封包壓縮可有效降低頻寬使用量，但會消耗少量 CPU 資源。

| 設定項                         | 型別 | 預設值 | 有效範圍 | 說明                                     |
| ------------------------------ | ---- | ------ | -------- | ---------------------------------------- |
| `server.compression.threshold` | u32  | `256`  | `>= 256` | 觸發壓縮的封包大小門檻（位元組）         |
| `server.compression.level`     | i32  | `4`    | `1–9`    | Zlib 壓縮等級（`1` = 最快，`9` = 壓縮率最佳） |

`[server.compression]` 表為選用項；若省略該表，則停用封包壓縮。

## 伺服器連結（Server Links）

伺服器連結會顯示在用戶端多人遊戲暫停選單中。

| 設定項                       | 型別  | 預設值   | 說明                     |
| ---------------------------- | ----- | -------- | ------------------------ |
| `server.server_links.enable` | bool  | `true`   | 是否啟用伺服器連結功能   |
| `server.server_links.links`  | Array | 4 個連結 | 要顯示的伺服器連結列表   |

詳細設定方式請參閱[伺服器連結設定指南](../server-links)。

## 日誌（Logging）設定

| 設定項              | 型別   | 預設值      | 說明                                                                   |
| ------------------- | ------ | ----------- | ---------------------------------------------------------------------- |
| `log.log_path`      | String | `"./.logs"` | 日誌檔案與主控台指令歷史紀錄的存放目錄                                 |
| `log.log_level`     | String | `"info"`    | 日誌等級：`error`、`warn`、`info`、`debug` 或 `trace`                  |
| `log.time`          | String | `"uptime"`  | 日誌時間格式：`none`（無）、`date`（日期時間）或 `uptime`（執行時間）  |
| `log.module_path`   | bool   | `false`     | 是否在日誌中顯示 Rust 模組路徑                                         |
| `log.extra`         | bool   | `false`     | 是否顯示額外除錯中繼資料                                               |
| `log.log_file`      | bool   | `true`      | 是否將日誌同時寫入磁碟檔案                                             |
| `log.rotation_time` | String | `"daily"`   | 日誌檔案輪替週期：`none`、`hourly`、`daily`、`weekly` 或 `monthly`     |
| `log.max_history`   | usize  | `50`        | 主控台儲存的最大歷史指令筆數                                           |

## 完整設定範例

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

## 啟動驗證規則

伺服器在啟動時會對設定檔進行嚴格驗證：

- 包含未知欄位的設定會被直接拒絕
- `server.view_distance` 必須介於 `1` 到 `32` 之間（當 `server.allow_extended_view_distance` 為 `true` 時必須介於 `1` 到 `127` 之間）
- `server.simulation_distance` 必須小於或等於 `server.view_distance`
- `server.auth_server` 若已設定，必須是完整的 `http` 或 `https` 絕對 URL
- `server.profile_server` 若已設定，必須是完整的 `http` 或 `https` 絕對 URL
- `server.services_server` 若已設定，必須是完整的 `http` 或 `https` 絕對 URL
- `server.compression.threshold` 必須大於或等於 `256`
- `server.compression.level` 必須介於 `1` 到 `9` 之間
- 當 `server.enforce_secure_chat` 為 `true` 時，`server.online_mode` 與 `server.encryption` 必須同時為 `true`
- `log.log_level`、`log.time` 與 `log.rotation_time` 必須使用上表列出的合法值之一

若任何一項驗證未通過，伺服器將印出錯誤訊息並安全結束。
