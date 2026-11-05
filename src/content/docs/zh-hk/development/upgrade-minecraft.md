---
title: 點樣升級 Minecraft 目標版本
description: SteelMC 升級適配 Minecraft 新版本嘅完整操作指南。
---

本指南詳細介紹咗將 Steel 升級適配至 Minecraft 新版本所需嘅完整步驟與關鍵檢查點。

正如你所預料嗰樣，將 Steel 咁樣一個高效能伺服器升級到全新嘅 Minecraft 版本絕非輕而易舉嘅小任務，請務必保持耐心！

**需要掌握嘅前置知識：**- Java 與 Rust 開發經驗
- Gradle 建置工具基礎

要升級 Steel，我哋首先需要由新版 Minecraft 入面提取出所有最新嘅結構與註冊表資訊。呢個意味住升級流程始於**SteelExtractor** 數據提取器。如果你仲未了解佢，可以喺[呢度閱讀詳細說明](../tools/steel_extractor)。

為咗確保版本平穩過渡並減少工作負擔，建議喺 Mojang 剛發佈新版本快照（Snapshot）階段就著手開始跟進升級。

## 1. 修改 SteelExtractor 嘅目標版本

喺 SteelExtractor 嘅 `gradle.properties` 入面設定咗目標 Minecraft 版本及其依賴版本：

```properties
minecraft_version=26.1-snapshot-11
loader_version=0.18.4
loom_version=1.15-SNAPSHOT
fabric_kotlin_version=1.13.9+kotlin.2.3.10
```

升級至新版本嘅修改步驟如下：

1. 將 `minecraft_version` 修改為目標版本號
2. 更新 `fabric_version`，令其適配該 Minecraft 版本嘅最新 Fabric API
3. 如有需要，更新 `loader_version` 與 `fabric_kotlin_version`
4. 如適用，更新 `build.gradle` 入面嘅 Parchment 對應表版本

你可以喺 [https://fabricmc.net/develop](https://fabricmc.net/develop) 查詢對應嘅各組件版本號。

設定完成後，按[數據提取指南](../tools/steel_extractor/)運行 Minecraft 並提取數據。\
例如喺 26.1 快照階段，Gradle 建置系統經歷咗重大變更，並將運行環境由 Java 21 升級到 Java 25。該快照涉及嘅所有修改細節可參閱此提交：https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. 複製 SteelExtractor 生成嘅 JSON 檔案

將生成嘅全部 JSON 檔案移動並覆蓋到 Steel 倉庫入面嘅對應位置。喺最新版本入面，Extractor 運行輸出目錄下嘅子資料夾結構已經同 Steel 保持一對一完全一致。

## 3. 由新版 Minecraft 原版客戶端提取內置數據

獲取新版 Minecraft 嘅 client.jar。呢個可以透過官方啟動器下載，亦可以由 Mojang 官方分發連結獲取。下載後將其解壓，解壓後會呈現如下目錄結構：

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

將解壓出嘅 `data` 目錄完整複製到：`steel-registry/build_assets/builtin_datapacks/minecraft/data`。\
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

## 4. 修復註冊表編譯報錯

註冊表修復流程分為兩個階段。\
喺絕大多數情況下，引入新數據後註冊表會即刻報錯並導致 Steel 無法建置，因為某啲原版數據結構發生咗變更。因此我哋首先修復註冊表模組。

Steel 嘅註冊表模組由三個主要資料夾構成：
- `build_assets`：存放上一步提取出嘅原始 JSON 與內置數據包。
- `build`：包含喺編譯期根據 JSON 數據自動生成 Rust 程式碼嘅建置腳本源碼。呢個就係第一階段嘅修改所在。\
建議喺複製完新檔案後執行 `git diff`，查看邊啲 JSON 檔案嘅欄位和數據結構發生咗改變，從而確定需要同步修改邊啲註冊表生成邏輯。\
隨後喺 `build` 目錄入面調整對應嘅生成程式碼。修改完畢後，程式碼生成出嘅註冊表本身通常會暴露第二階段嘅編譯報錯（因為運行時嘅註冊表消費端結構尚未同步更新）。喺實際嘅註冊表源碼中對應同步呢啲結構變更後，成個模組即可順利通過編譯。

## 5. 修復與適配其餘模組

呢一步包括修復因版本更新帶嚟嘅協議封包（Packets）變更、世界生成管線變動，並逐步實現新版本引入嘅全新遊戲機制與特性。具體工作量取決於該版本變更嘅廣度。祝升級順利！
