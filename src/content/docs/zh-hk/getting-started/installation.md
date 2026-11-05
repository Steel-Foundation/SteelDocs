---
title: 安裝指南
description: 點樣喺你嘅系統上面安裝並運行 Steel。
sidebar:
  order: 1
---

本指南會向你介紹點樣安裝並運行 Steel。\
你有以下幾種安裝方式可以揀：

- [預編譯二進制檔案](#預編譯二進制檔案)
- [Docker 容器](#docker)
- [面板 Egg（Pelican / Pterodactyl）](#面板-eggpelican--pterodactyl)
- [由源碼自行編譯](#由源碼自行編譯)

## 點樣選擇安裝方式

建議根據 Steel 嘅實際部署環境揀選最合適嘅安裝方式：

- 如果你想直接喺宿主機系統上面裸機運行 Steel，請使用**預編譯二進制檔案**。
- 如果你已經用緊 Kubernetes、Docker Swarm 或標準 Docker 宿主機，推薦使用**Docker 容器**。
- 如果你嘅目標平台係 Pelican、Pterodactyl（翼龍面板）或其他基於 Egg 嘅伺服器管理面板，請使用官方提供嘅 JSON 或 YAML 格式**Steel Egg**。
- 如果你希望發揮本機處理器指令集嘅原生極限效能，或者你嘅系統平台／架構暫未提供預編譯包，請針對目標系統**由源碼編譯 Steel**。

| 安裝方式                          | Linux x64 | Linux arm64 | Linux armv7 | Linux armv6 | Windows x64 | Windows arm | Mac arm | Mac x64 |
| --------------------------------- | :-------: | :---------: | :---------: | :---------: | :---------: | :---------: | :-----: | :-----: |
| [二進制檔案](#預編譯二進制檔案) |    ✅     |     ❌      |     ❌      |     ❌      |     ✅      |     ❌      |   ✅    |   ❌    |
| [Docker](#docker)                 |    ✅     |     ✅      |     ❌      |     ❌      |     ✅      |     ✅      |   ✅    |   ✅    |
| [面板 Egg](#面板-eggpelican--pterodactyl) |    ✅     |     ❌      |     ❌      |     ❌      |     ❌      |     ❌      |   ❌    |   ❌    |
| [源碼自編譯](#由源碼自行編譯)   |    ✅     |     ✅      |     ⚠️      |     ⚠️      |     ✅      |     ✅      |   ✅    |   ✅    |

✅：已支援。 ❌：暫唔支援。 ⚠️：需要少量手動調整。

下方各節會詳細介紹每種安裝方式嘅具體步驟。

## 預編譯二進制檔案

你可以喺我哋嘅[下載頁面](../../download)獲取面向以下平台嘅預編譯二進制檔案：

- Linux (x86_64)
- Windows (x86_64)
- macOS (ARM / Apple Silicon)

你亦可以喺 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 頁面下載完全相同嘅檔案。

下載完成後，只需要喺執行檔所在目錄打開你慣用嘅終端機（例如 PowerShell、Ghostty、Kitty 等），運行以下指令即可啟動伺服器：

```bash
# Windows
./steel.exe

# macOS / Linux
./steel
```

:::caution
由於執行檔暫未進行 Apple 官方公證簽名，macOS 用戶需要先開啟系統嘅開發者模式先可以運行 Steel。

你可以喺終端機運行以下指令並輸入管理員密碼嚟啟用：

```bash
sudo devtools enable
```
:::

## Docker

Steel 唔會發佈 `latest` Docker 標籤（Tag）。請務必指定具體嘅版本號標籤，咁樣版本升級始終處於你嘅可控計劃之內，避免容器發生預期之外嘅自動更新。

`nightly` 標籤可用於插件測試以及搶先體驗最新改動。佢緊貼 `master` 分支嘅最新提交，可能包含尚未喺正式版中修復嘅 Bug。**請勿喺生產環境中使用 `nightly` 映像檔。**### 啟動容器

公開伺服器端口並將本地目錄掛載為設定、存檔與日誌目錄嚟啟動 Steel 容器：

```bash
docker run -d -it -p 25565:25565 -v ./config:/config -v ./saves:/saves -v ./logs:/logs --name steel-mc ghcr.io/steel-foundation/steelmc:<version>
```

:::tip
要進入 Docker 容器內嘅 Steel 後台控制台，可以運行以下指令：
```bash
docker attach <steel-mc|容器名稱>
```
:::

:::note
拉取每夜建置版（Nightly）映像檔嘅指令為：`docker pull ghcr.io/steel-foundation/steelmc:nightly`
:::

:::tip
同樣嘅設定亦可以寫成 Docker Compose 服務檔案（推薦）：

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

Docker Compose 係將 `docker run` 參數寫入設定檔管理嘅常用方式。\
完整嘅 Docker Compose 語法參考請見：https://docs.docker.com/reference/compose-file/
:::

### 點樣修改端口與掛載目錄

如果你對 Docker 設定唔太熟，可以參考以下常用參數速查說明：

- **`-p`（`--port`、`ports`）：**冒號前嘅第一個數字代表宿主機外部端口（可按需修改）；冒號後嘅第二個數字係 Docker 容器內部端口（僅喺修改咗 Steel 設定檔入面嘅監聽端口時先需要同步修改）。例如，`-p 1111:25565` 會令外部玩家透過 Linux 伺服器嘅 `1111` 端口連接到 Minecraft 伺服器。
- **`-v`（`--volume`、`volumes`）：**冒號前嘅路徑係宿主機上面嘅本地路徑（可以使用相對於 `docker-compose.yml` 嘅相對路徑）；冒號後嘅路徑係容器內部路徑，請勿修改。

## 面板 Egg（Pelican / Pterodactyl）

針對 Pelican 與 Pterodactyl（翼龍面板），Steel 提供咗可以直接由面板 Egg 商店匯入嘅預設設定檔。

對於其他兼容 Egg 嘅面板平台，可以使用我哋倉庫中提供嘅 JSON 或 YAML Egg 檔案，或喺對應商店上架後直接下載匯入。

Pelican：`[即將推出]`

Pterodactyl（翼龍面板）：`[即將推出]`

## 由源碼自行編譯

### 環境要求

- **Rust Nightly 工具鏈**—— Steel 使用咗 Rust 2024 Edition 及 Nightly 特性
- **64 位元作業系統**—— Linux、macOS 或 Windows
- **Git**—— 用於 Clone 代碼倉庫

### 安裝 Rust

如果你仲未安裝 Rust，請使用 [rustup](https://rustup.rs/) 進行安裝：

```bash
# 僅限 Unix 系統（如 macOS、Linux）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel 依賴 Nightly 工具鏈。代碼倉庫根目錄下已包含 `rust-toolchain.toml`，調用 Cargo 時會自動揀選並安裝正確嘅工具鏈版本。

### 由源碼建置

```bash
# Clone 代碼倉庫
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# 以 Release 模式建置（針對本機 CPU 指令集優化，推薦用於實際運行）
cargo build-native --release
```

:::note
**編譯產物二進制檔案位於 `./target/release/steel`**
:::

:::caution
如果你想針對 32 位元 `armv6` 與 `armv7` 架構建置，仲需要 Clone `simdnbt` 倉庫，喺 `Cargo.toml` 入面指向你嘅本地版本，並移除 `simdnbt` 入面嘅 64 位元架構限制。
如需協助，歡迎前往我哋嘅 [Discord](/discord) 獲取支援。
:::

#### 常用建置指令

| 指令                           | 用途說明                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| `cargo build-native`           | Debug 建置（編譯快、運行慢，啟用目前 CPU 架構專屬指令集優化）            |
| `cargo build-native --release` | Release 建置（編譯慢、運行高度優化，啟用目前 CPU 架構專屬指令集優化）    |
| `cargo build`                  | 通用 Debug 建置（編譯快、運行慢）                                        |
| `cargo build --release`        | 通用 Release 建置（編譯慢、運行高度優化）                                |
| `cargo check`                  | 快速語法與類型檢查（唔生成二進制檔案）                                   |
| `cargo test`                   | 運行測試套件                                                             |
| `cargo clippy`                 | 運行 Clippy 靜態程式碼檢查                                               |

:::caution
使用 `build-native` 編譯出嘅原生二進制檔案針對編譯機 CPU 指令集做咗特化，無法直接複製到其他唔同架構／型號 CPU 嘅機器上面運行（除非目標機器具有完全相同嘅 CPU 架構特性）。
:::

#### 建置特性開關（Build Features）

Steel 支援透過 `--features` 參數啟用可選嘅編譯期特性：

```bash
# 啟用死鎖檢測（僅建議喺除錯時使用）
cargo build-native --features deadlock_detection

# 啟用基於 dhat 嘅堆記憶體分析
cargo build-native --features dhat-heap

# 停用預設嘅 mimalloc 記憶體分配器
cargo build-native --no-default-features
```**可用特性列表：**| 特性名稱             | 說明                                                        |
| -------------------- | ----------------------------------------------------------- |
| `mimalloc`           | 使用 mimalloc 記憶體分配器（預設啟用）                      |
| `deadlock_detection` | 啟用 `parking_lot` 死鎖檢測，用於排查鎖競爭與死鎖問題       |
| `dhat-heap`          | 啟用基於 `dhat` 嘅堆記憶體分配分析（Heap Profiling）        |

喺開發過程中，如果你遇到伺服器無回應掛起或者懷疑有鎖衝突，**死鎖檢測（`deadlock_detection`）** 會非常實用。啟用後，`parking_lot` 會自動檢測潛在死鎖並觸發 Panic 輸出詳細診斷資訊。

### 啟動伺服器

```bash
# 直接透過 Cargo 運行（Debug 模式）
cargo run-native

# 以 Release 優化模式運行
cargo run-native --release

# 或者直接運行已建置好嘅二進制檔案
./target/release/steel
```

## 下一步

而家你已經成功運行起 Steel 伺服器，接落嚟請前往[設定概覽](../../configuration/overview)自訂你嘅伺服器設定。
