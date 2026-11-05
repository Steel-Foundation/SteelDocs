---
title: 安裝指南
description: 如何在你的系統上安裝並執行 Steel。
sidebar:
  order: 1
---

本指南將向你介紹如何安裝並執行 Steel。\
你有以下幾種安裝方式可供選擇：

- [預編譯二進位檔](#預編譯二進位檔)
- [Docker 容器](#docker)
- [面板 Egg（Pelican / Pterodactyl）](#面板-eggpelican--pterodactyl)
- [從原始碼自行編譯](#從原始碼自行編譯)

## 如何選擇安裝方式

建議根據 Steel 的實際部署環境選擇最合適的安裝方式：

- 如果你想直接在主機系統上直接執行 Steel，請使用**預編譯二進位檔**。
- 如果你已經在使用 Kubernetes、Docker Swarm 或標準 Docker 主機，推薦使用**Docker 容器**。
- 如果你的目標平台是 Pelican、Pterodactyl（翼龍面板）或其他基於 Egg 的伺服器管理面板，請使用官方提供的 JSON 或 YAML 格式**Steel Egg**。
- 如果你希望發揮本機處理器指令集的原生極限效能，或者你的系統平台／架構暫未提供預編譯版本，請針對目標系統**從原始碼編譯 Steel**。

| 安裝方式                          | Linux x64 | Linux arm64 | Linux armv7 | Linux armv6 | Windows x64 | Windows arm | Mac arm | Mac x64 |
| --------------------------------- | :-------: | :---------: | :---------: | :---------: | :---------: | :---------: | :-----: | :-----: |
| [二進位檔](#預編譯二進位檔)   |    ✅     |     ❌      |     ❌      |     ❌      |     ✅      |     ❌      |   ✅    |   ❌    |
| [Docker](#docker)                 |    ✅     |     ✅      |     ❌      |     ❌      |     ✅      |     ✅      |   ✅    |   ✅    |
| [面板 Egg](#面板-eggpelican--pterodactyl) |    ✅     |     ❌      |     ❌      |     ❌      |     ❌      |     ❌      |   ❌    |   ❌    |
| [原始碼自編譯](#從原始碼自行編譯) |    ✅     |     ✅      |     ⚠️      |     ⚠️      |     ✅      |     ✅      |   ✅    |   ✅    |

✅：已支援。 ❌：目前不支援。 ⚠️：需要少量手動調整。

下方各節將詳細說明每種安裝方式的具體步驟。

## 預編譯二進位檔

你可以在我們的[下載頁面](../../download)取得適用於以下平台的預編譯二進位檔：

- Linux (x86_64)
- Windows (x86_64)
- macOS (ARM / Apple Silicon)

你也可以在 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 頁面下載完全相同的檔案。

下載完成後，只需在執行檔所在目錄開啟你慣用的終端機（例如 PowerShell、Ghostty、Kitty 等），執行以下指令即可啟動伺服器：

```bash
# Windows
./steel.exe

# macOS / Linux
./steel
```

:::caution
由於執行檔暫未進行 Apple 官方公證簽署，macOS 使用者需要先開啟系統的開發人員模式才能執行 Steel。

你可以在終端機中執行以下指令並輸入管理員密碼來啟用：

```bash
sudo devtools enable
```
:::

## Docker

Steel 不會發佈 `latest` Docker 標籤（Tag）。請務必指定具體的版本號標籤，如此一來版本升級都能按計畫進行，避免容器發生非預期的自動更新。

`nightly` 標籤可供外掛測試以及搶先體驗最新變更。它緊跟 `master` 分支的最新提交，可能包含尚未在正式版中修復的 Bug。**請勿在正式環境中使用 `nightly` 映像檔。**### 啟動容器

公開伺服器連接埠並將本機目錄掛載為設定、存檔與日誌目錄來啟動 Steel 容器：

```bash
docker run -d -it -p 25565:25565 -v ./config:/config -v ./saves:/saves -v ./logs:/logs --name steel-mc ghcr.io/steel-foundation/steelmc:<version>
```

:::tip
若要進入 Docker 容器內的 Steel 後台主控台，可執行以下指令：
```bash
docker attach <steel-mc|容器名稱>
```
:::

:::note
拉取每夜建置版（Nightly）映像檔的指令為：`docker pull ghcr.io/steel-foundation/steelmc:nightly`
:::

:::tip
同樣的設定也可以寫成 Docker Compose 服務檔案（推薦）：

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

Docker Compose 是將 `docker run` 參數寫入設定檔管理的常用方式。\
完整的 Docker Compose 語法參考請見：https://docs.docker.com/reference/compose-file/
:::

### 如何修改連接埠與掛載目錄

如果你對 Docker 設定不太熟悉，可以參考以下常用參數速查說明：

- **`-p`（`--port`、`ports`）：**冒號前的第一個數字代表主機外部連接埠（可依需求修改）；冒號後的第二個數字是 Docker 容器內部連接埠（僅在修改了 Steel 設定檔中的監聽埠時才需同步修改）。例如，`-p 1111:25565` 會讓外部玩家透過 Linux 伺服器的 `1111` 連接埠連線至 Minecraft 伺服器。
- **`-v`（`--volume`、`volumes`）：**冒號前的路徑是主機上的本機路徑（可使用相對於 `docker-compose.yml` 的相對路徑）；冒號後的路徑是容器內部路徑，請勿修改。

## 面板 Egg（Pelican / Pterodactyl）

針對 Pelican 與 Pterodactyl（翼龍面板），Steel 提供了可直接從面板 Egg 商店匯入的預設設定檔。

對於其他相容 Egg 的面板平台，可以使用我們儲存庫中提供的 JSON 或 YAML Egg 檔案，或在對應商店上架後直接下載匯入。

Pelican：`[即將推出]`

Pterodactyl（翼龍面板）：`[即將推出]`

## 從原始碼自行編譯

### 系統需求

- **Rust Nightly 工具鏈**—— Steel 使用了 Rust 2024 Edition 及 Nightly 特性
- **64 位元作業系統**—— Linux、macOS 或 Windows
- **Git**—— 用於複製（Clone）儲存庫

### 安裝 Rust

如果你尚未安裝 Rust，請使用 [rustup](https://rustup.rs/) 進行安裝：

```bash
# 僅限 Unix 系統（如 macOS、Linux）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel 需要 Nightly 工具鏈。儲存庫根目錄下已包含 `rust-toolchain.toml`，執行 Cargo 時會自動選擇並安裝正確的工具鏈版本。

### 從原始碼建置

```bash
# 複製程式碼儲存庫
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# 以 Release 模式建置（針對本機 CPU 指令集最佳化，推薦用於實際執行）
cargo build-native --release
```

:::note
**編譯完成的執行檔位於 `./target/release/steel`**
:::

:::caution
如果你想針對 32 位元 `armv6` 與 `armv7` 架構建置，還需要複製 `simdnbt` 儲存庫，在 `Cargo.toml` 中指向你的本機版本，並移除 `simdnbt` 中的 64 位元架構限制。
如需協助，歡迎前往我們的 [Discord](/discord) 取得支援。
:::

#### 常用建置指令

| 指令                           | 用途說明                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- |
| `cargo build-native`           | Debug 建置（編譯快、執行慢，啟用目前 CPU 架構專屬指令集最佳化）            |
| `cargo build-native --release` | Release 建置（編譯慢、執行高度最佳化，啟用目前 CPU 架構專屬指令集最佳化）  |
| `cargo build`                  | 通用 Debug 建置（編譯快、執行慢）                                          |
| `cargo build --release`        | 通用 Release 建置（編譯慢、執行高度最佳化）                                |
| `cargo check`                  | 快速語法與型別檢查（不產生二進位檔）                                       |
| `cargo test`                   | 執行測試套件                                                               |
| `cargo clippy`                 | 執行 Clippy 靜態程式碼分析（Linter）                                       |

:::caution
使用 `build-native` 編譯出的原生執行檔針對編譯機 CPU 指令集做了特化，無法直接複製到其他不同架構／型號 CPU 的機器上執行（除非目標機器具有完全相同的 CPU 架構特性）。
:::

#### 建置特性開關（Build Features）

Steel 支援透過 `--features` 參數啟用選用的編譯期特性：

```bash
# 啟用死結偵測（僅建議在除錯時使用）
cargo build-native --features deadlock_detection

# 啟用基於 dhat 的堆積記憶體分析
cargo build-native --features dhat-heap

# 停用預設的 mimalloc 記憶體配置器
cargo build-native --no-default-features
```**可用特性列表：**| 特性名稱             | 說明                                                        |
| -------------------- | ----------------------------------------------------------- |
| `mimalloc`           | 使用 mimalloc 記憶體配置器（預設啟用）                      |
| `deadlock_detection` | 啟用 `parking_lot` 死結偵測，用於排查鎖定競爭與死結問題     |
| `dhat-heap`          | 啟用基於 `dhat` 的堆積記憶體配置分析（Heap Profiling）      |

在開發過程中，如果你遇到伺服器無回應卡死或懷疑有鎖定相關問題，**死結偵測（`deadlock_detection`）** 會非常實用。啟用後，`parking_lot` 會自動偵測潛在死結並觸發 Panic 印出診斷資訊。

### 啟動伺服器

```bash
# 直接透過 Cargo 執行（Debug 模式）
cargo run-native

# 以 Release 最佳化模式執行
cargo run-native --release

# 或者直接執行已建置好的二進位執行檔
./target/release/steel
```

## 下一步

現在你已經成功讓 Steel 伺服器運作起來，接下來請前往[設定概覽](../../configuration/overview)自訂你的伺服器設定。
