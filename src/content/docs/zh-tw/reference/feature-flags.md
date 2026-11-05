---
title: 編譯期特性旗標 (Feature Flags)
description: SteelMC 編譯期 Cargo Feature Flags 的完整參考。
---

SteelMC 使用 Rust 的 Cargo 特性旗標（Feature Flags）在編譯期啟用或停用特定功能。你可以利用它們依需求量身打造適用於正式環境部署、死結除錯、記憶體效能分析、遙測追蹤或自動生成程式碼維護的建置版本。

大多數使用者透過頂層的 `steel` 套件建置伺服器可執行檔：

```bash
cargo build -p steel --features "feature_name"
```

## steel

以下特性旗標用於控制伺服器主執行檔：

| 特性名稱              | 預設啟用 | 說明                                                                                                     |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `mimalloc`            | 是       | 使用 MiMalloc 作為全域記憶體配置器，以提升多執行緒高頻率記憶體配置效能。                                 |
| `stand-alone`         | 否       | 將預設伺服器圖示內嵌至執行檔中，並在設定的圖示檔案缺失時自動寫出。                                       |
| `deadlock_detection`  | 否       | 啟用 `parking_lot` 的死結偵測功能，用於並行鎖定問題除錯。                                                |
| `dhat-heap`           | 否       | 啟用 DHAT 堆積記憶體分析器（Heap Profiler）。當與 `mimalloc` 同時開啟時，DHAT 會接管並替換全域配置器。   |
| `spawn_chunk_display` | 否       | 在啟動階段生成出生點區塊時，在終端機中顯示彩色的區塊階段進度網格。                                       |
| `slow_chunk_gen`      | 否       | 在出生點準備階段人為放慢區塊生成速度，並向下傳遞給 `steel-core/slow_chunk_gen`；便於觀察終端機區塊生成網格。 |
| `jaeger`              | 否       | 啟用基於 OTLP 協定的 OpenTelemetry 追蹤匯出，適用於 Jaeger 相容的追蹤環境。                              |

### 使用範例

```bash
# 啟用死結偵測進行建置
cargo build -p steel --features deadlock_detection

# 停用預設的 MiMalloc 配置器進行建置
cargo build -p steel --no-default-features

# 啟用出生點區塊終端機網格顯示與慢速生成展示
cargo build -p steel --features "spawn_chunk_display slow_chunk_gen"

# 啟用 Jaeger / OpenTelemetry 追蹤支援
cargo build -p steel --features jaeger
```

## steel-core

以下特性旗標控制核心遊戲邏輯與底層除錯輔助功能：

| 特性名稱         | 預設啟用 | 說明                                                                                                                               |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `stand-alone`    | 否       | 在 `steel-core` 的 `Cargo.toml` 中有宣告，但目前 `steel-core` 內部尚無活動的 `cfg(feature = "stand-alone")` 程式碼路徑（內嵌圖示邏輯由 `steel` 執行檔套件處理）。 |
| `slow_chunk_gen` | 否       | 當伺服器開啟慢速出生點生成時，在每個區塊生成階段之後加入短暫延遲。                                                                 |
| `flint`          | 否       | 公開行為系統（Behavior）自省輔助介面，包括具體行為型別名稱及行為註冊表切片（供實作狀態同步腳本等工具使用）。                       |

## steel-registry

以下特性旗標控制遊戲註冊表系統與自動產生的註冊表程式碼：

| 特性名稱        | 預設啟用 | 說明                                                                                     |
| --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `fmt`           | 否       | 在建置腳本（`build.rs`）產生註冊表程式碼後自動對其執行 `rustfmt` 格式化。                |
| `minecraft-src` | 否       | 啟用將產生出的註冊表資料與反編譯參考資料 `minecraft-src` 進行比對驗證的輔助功能。        |

## steel-utils

以下特性旗標控制自動產生的公用程式資料程式碼：

| 特性名稱 | 預設啟用 | 說明                                                                        |
| -------- | -------- | --------------------------------------------------------------------------- |
| `fmt`    | 否       | 在建置腳本（`build.rs`）產生公用程式檔案後自動對其執行 `rustfmt` 格式化。   |

## steel-worldgen

以下特性旗標控制自動產生的世界生成資料程式碼：

| 特性名稱 | 預設啟用 | 說明                                                                        |
| -------- | -------- | --------------------------------------------------------------------------- |
| `fmt`    | 否       | 在建置腳本（`build.rs`）產生世界生成程式碼檔案後自動對其執行 `rustfmt` 格式化。 |

## 組合使用多個特性

你可以在單次建置中同時啟用多個特性（以空白或逗號分隔）：

```bash
# 同時啟用多項伺服器除錯特性
cargo build -p steel --features "deadlock_detection spawn_chunk_display slow_chunk_gen"

# 建置內嵌預設圖示的獨立發佈版伺服器
cargo build -p steel --release --features stand-alone

# 在建置 steel-registry 時格式化產生的程式碼
cargo build -p steel-registry --features fmt
```

Cargo 的特性旗標是以套件（Package）為範圍的。當需要啟用非 `steel` 主套件的子套件特性時，請透過 `-p <套件名稱>` 明確指定目標套件。

## 正式環境建議

對於正式環境伺服器，建議遵循以下原則：

- 保持啟用預設的 `mimalloc`（除非你正在使用 `dhat-heap` 進行記憶體分析）。
- 保持停用 `deadlock_detection`、`dhat-heap`、`spawn_chunk_display` 和 `slow_chunk_gen`。
- 僅在希望執行檔自動提供預設伺服器圖示檔案時才啟用 `stand-alone`。
- 僅在已設定好 OTLP 追蹤收集器（Collector）時才啟用 `jaeger`。
- `fmt` 與 `minecraft-src` 僅用於開發階段與產生程式碼驗證，無需在一般正式建置中啟用。
