---
title: 編譯期特性開關 (Feature Flags)
description: SteelMC 編譯期 Cargo Feature Flags 嘅完整參考。
---

SteelMC 使用 Rust 嘅 Cargo 特性開關（Feature Flags）喺編譯期啟用或停用特定功能。你可以利用佢哋按需自訂適用於生產環境部署、死鎖除錯、記憶體效能分析、遙測追蹤或生成程式碼維護嘅建置版本。

大多數用戶透過頂層嘅 `steel` 套件建置伺服器執行檔：

```bash
cargo build -p steel --features "feature_name"
```

## steel

以下特性開關用於控制伺服器主執行檔：

| 特性名稱              | 預設啟用 | 說明                                                                                                     |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `mimalloc`            | 係       | 使用 MiMalloc 作為全局記憶體分配器，以提升多線程高頻率記憶體分配效能。                                   |
| `stand-alone`         | 否       | 將預設伺服器圖標內嵌至執行檔入面，並喺設定嘅圖標檔案缺失時自動寫出。                                     |
| `deadlock_detection`  | 否       | 啟用 `parking_lot` 嘅死鎖檢測功能，用於並行鎖問題除錯。                                                  |
| `dhat-heap`           | 否       | 啟用 DHAT 堆記憶體分析器（Heap Profiler）。當與 `mimalloc` 同時開啟時，DHAT 會接管並替換全局分配器。     |
| `spawn_chunk_display` | 否       | 喺啟動階段生成出生點區塊時，喺終端機顯示彩色嘅區塊階段進度網格。                                         |
| `slow_chunk_gen`      | 否       | 喺出生點準備階段人為減慢區塊生成速度，並向下傳遞俾 `steel-core/slow_chunk_gen`；便於觀察終端機區塊生成網格。 |
| `jaeger`              | 否       | 啟用基於 OTLP 協議嘅 OpenTelemetry 追蹤匯出，適用於 Jaeger 兼容嘅追蹤環境。                              |

### 使用範例

```bash
# 啟用死鎖檢測進行建置
cargo build -p steel --features deadlock_detection

# 停用預設嘅 MiMalloc 分配器進行建置
cargo build -p steel --no-default-features

# 啟用出生點區塊終端機網格顯示與慢速生成演示
cargo build -p steel --features "spawn_chunk_display slow_chunk_gen"

# 啟用 Jaeger / OpenTelemetry 追蹤支援
cargo build -p steel --features jaeger
```

## steel-core

以下特性開關控制核心遊戲邏輯與底層除錯輔助功能：

| 特性名稱         | 預設啟用 | 說明                                                                                                                               |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `stand-alone`    | 否       | 喺 `steel-core` 嘅 `Cargo.toml` 入面有聲明，但目前 `steel-core` 內部尚無活動嘅 `cfg(feature = "stand-alone")` 程式碼路徑（內嵌圖標邏輯由 `steel` 執行檔套件處理）。 |
| `slow_chunk_gen` | 否       | 當伺服器開啟慢速出生點生成時，喺每個區塊生成階段之後加入短暫延遲。                                                                 |
| `flint`          | 否       | 公開行為系統（Behavior）自省輔助介面，包括具體行為類型名稱及行為註冊表切片（供實現狀態同步腳本等工具使用）。                       |

## steel-registry

以下特性開關控制遊戲註冊表系統與自動生成嘅註冊表程式碼：

| 特性名稱        | 預設啟用 | 說明                                                                                     |
| --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `fmt`           | 否       | 喺建置腳本（`build.rs`）生成註冊表程式碼後自動對其運行 `rustfmt` 格式化。                |
| `minecraft-src` | 否       | 啟用將生成出嘅註冊表數據與反編譯參考數據 `minecraft-src` 進行比對驗證嘅輔助功能。        |

## steel-utils

以下特性開關控制自動生成嘅通用工具數據程式碼：

| 特性名稱 | 預設啟用 | 說明                                                                    |
| -------- | -------- | ----------------------------------------------------------------------- |
| `fmt`    | 否       | 喺建置腳本（`build.rs`）生成工具程式碼檔案後自動對其運行 `rustfmt` 格式化。 |

## steel-worldgen

以下特性開關控制自動生成嘅世界生成數據程式碼：

| 特性名稱 | 預設啟用 | 說明                                                                        |
| -------- | -------- | --------------------------------------------------------------------------- |
| `fmt`    | 否       | 喺建置腳本（`build.rs`）生成世界生成程式碼檔案後自動對其運行 `rustfmt` 格式化。 |

## 組合使用多個特性

你可以喺單次建置中同時啟用多個特性（以空格或逗號分隔）：

```bash
# 同時啟用多項伺服器除錯特性
cargo build -p steel --features "deadlock_detection spawn_chunk_display slow_chunk_gen"

# 建置內嵌預設圖標嘅獨立發佈版伺服器
cargo build -p steel --release --features stand-alone

# 喺建置 steel-registry 時格式化生成嘅程式碼
cargo build -p steel-registry --features fmt
```

Cargo 嘅特性開關係按套件（Package）隔離嘅。當需要啟用非 `steel` 主套件嘅子套件特性時，請透過 `-p <套件名稱>` 明確指定目標套件。

## 生產環境建議

對於正式嘅生產環境伺服器，建議遵循以下原則：

- 保持啟用預設嘅 `mimalloc`（除非你正使用 `dhat-heap` 進行記憶體分析）。
- 保持停用 `deadlock_detection`、`dhat-heap`、`spawn_chunk_display` 同 `slow_chunk_gen`。
- 僅喺希望執行檔自動提供預設伺服器圖標檔案時按需開啟 `stand-alone`。
- 僅喺已部署好 OTLP 追蹤收集器（Collector）時開啟 `jaeger`。
- `fmt` 與 `minecraft-src` 僅用於開發階段與生成程式碼驗證，無需喺一般生產建置中開啟。
