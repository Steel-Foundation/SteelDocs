---
title: 如何升級 Minecraft 目標版本
description: SteelMC 升級支援 Minecraft 新版本的完整操作指南。
---

本指南詳細說明了將 Steel 升級支援至 Minecraft 新版本所需的完整步驟與關鍵檢查點。

正如你所預料的那樣，將 Steel 這樣一個高效能伺服器升級到全新的 Minecraft 版本絕非輕而易舉的小任務，請務必保持耐心！

**需要掌握的先備知識：**- Java 與 Rust 開發經驗
- Gradle 建置工具基礎

要升級 Steel，我們首先需要從新版 Minecraft 中提取出所有最新的結構與註冊表資訊。這意味著升級流程始於**SteelExtractor** 資料提取器。如果你還不了解它，可以在[此處閱讀詳細說明](../tools/steel_extractor)。

為了確保版本平穩過渡並降低工作負擔，建議在 Mojang 剛發佈新版本快照（Snapshot）階段就著手開始跟進升級。

## 1. 修改 SteelExtractor 的目標版本

在 SteelExtractor 的 `gradle.properties` 中設定了目標 Minecraft 版本及其相依版本：

```properties
minecraft_version=26.1-snapshot-11
loader_version=0.18.4
loom_version=1.15-SNAPSHOT
fabric_kotlin_version=1.13.9+kotlin.2.3.10
```

升級至新版本的修改步驟如下：

1. 將 `minecraft_version` 修改為目標版本號
2. 更新 `fabric_version`，使其支援該 Minecraft 版本的最新 Fabric API
3. 如有需要，更新 `loader_version` 與 `fabric_kotlin_version`
4. 如適用，更新 `build.gradle` 中的 Parchment 對應表版本

你可以在 [https://fabricmc.net/develop](https://fabricmc.net/develop) 查詢對應的各組件版本號。

設定完成後，依[資料提取指南](../tools/steel_extractor/)執行 Minecraft 並提取資料。\
例如在 26.1 快照階段，Gradle 建置系統經歷了重大變更，並將執行環境從 Java 21 升級到了 Java 25。該快照涉及的所有修改細節可參閱此提交：https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. 複製 SteelExtractor 產生的 JSON 檔案

將產生的全部 JSON 檔案移動並覆寫到 Steel 儲存庫中的對應位置。在最新版本中，Extractor 執行輸出目錄下的子資料夾結構已經與 Steel 保持一對一完全一致。

## 3. 從新版 Minecraft 原版用戶端提取內建資料

取得新版 Minecraft 的 client.jar。這可以透過官方啟動器下載，也可以從 Mojang 官方分發連結取得。下載後將其解壓縮，解壓縮後會呈現如下目錄結構：

```text
└── 📁minecraft-26.1-snapshot-11-client
    └── 📁assets
    └── 📁com
    └── 📁data
    └── 📁META-INF
    └── 📁net
    ├── flightrecorder-config.jfc
    ├── pack.png
    └── version.json
```

將解壓縮出的 `data` 目錄完整複製到：`steel-registry/build_assets/builtin_datapacks/minecraft/data`。\
複製完成後整體目錄結構如下：

```text
└── 📁build_assets
    └── 📁builtin_datapacks
        └── 📁minecraft
            └── 📁data
                └── 📁minecraft
                    └── 📁advancement
                    └── 📁equipment
                    └── 📁font
                    └── 📁frog_variant
                    └── 📁instrument
                    └── 📁items
                    ...
                    └── 📁zombie_nautilus_variant
                ├── .mcassetsroot
            ├── pack.mcmeta
    ├── attributes.json
    ├── block_entities.json
    ├── blocks.json
    ├── entities.json
    ├── fluids.json
    ├── game_rules.json
    ├── items.json
    ├── level_events.json
    ├── menutypes.json
    ├── mob_effects.json
    ├── multi_noise_biome_source_parameters.json
    ├── packets.json
    ├── potions.json
    ├── sound_events.json
    ├── sound_types.json
    └── tags.json
```

## 4. 修復註冊表編譯錯誤

註冊表修復流程分為兩個階段。\
在絕大多數情況下，引入新資料後註冊表會立即報錯並導致 Steel 無法建置，因為某些原版資料結構發生了變更。因此我們首先修復註冊表模組。

Steel 的註冊表模組由三個主要資料夾構成：
- `build_assets`：存放上一步提取出的原始 JSON 與內建資料包。
- `build`：包含在編譯期根據 JSON 資料自動產生 Rust 程式碼的建置腳本原始碼。這就是第一階段的修改所在。\
建議在複製完新檔案後執行 `git diff`，查看哪些 JSON 檔案的欄位和資料結構發生了改變，進而確定需要同步修改哪些註冊表產生邏輯。\
隨後在 `build` 目錄中調整對應的產生程式碼。修改完畢後，程式碼產生出的註冊表本身通常會暴露第二階段的編譯報錯（因為執行期的註冊表使用端結構尚未同步更新）。在實際的註冊表原始碼中對應同步這些結構變更後，整個模組即可順利通過編譯。

## 5. 修復與適配其餘模組

這一步包括修復因版本更新帶來的通訊協定封包（Packets）變更、世界生成管線變動，並逐步實作新版本引進的全新遊戲機制與特性。具體工作量取決於該版本變更的廣度。祝升級順利！
