---
title: 常見問題 (FAQ)
description: 關於 SteelMC 嘅常見問題解答。
---

呢度整理咗大家最常問到嘅問題與解答！
:::caution[免責聲明]
Steel 目前仍處於 Pre-Alpha 早期開發階段，因此各項功能特性與以下回答可能會隨版本迭代頻繁變動！
:::

## 我應該點樣安裝 Steel？

你可以喺[安裝指南](../installation)入面查看完整嘅安裝與部署教學。

## 有冇提供面板 Egg？

有嘅，我哋提供咗適用於翼龍面板（Pterodactyl）與 Pelican 嘅 Egg 設定檔，詳情請參閱[安裝指南](../installation)。

## 點解搵唔到伺服器 `*.jar` 檔案？

Steel 唔係用 Java 編寫嘅，因此唔會有 `*.jar` 檔案。\
唔使擔心，你依然可以喺我哋嘅[下載頁面](../../download)或 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 入面直接下載適用於 Windows、Linux 與 macOS 嘅原生執行檔。

## Steel 會唔會實現原版特性相容（Vanilla Parity）？

簡明扼要咁講： **呢個正正係我哋嘅核心目標。**

## Steel 支唔支援插件（Plugins）？我現有嘅 Paper / Bukkit 插件喺 Steel 用唔用到？

目前仲未支援。Steel 仍喺度積極開發緊，插件系統已喺規劃之內但尚未開放。\
未來 Steel 將會推出專屬嘅原生 API，我哋非常期待能集齊 Paper / Bukkit 與主流模組 API 嘅優點！由於底層語言同架構唔同，現有嘅 Paper / Bukkit Java 插件無法直接運行。

## 未來嘅插件會用咩語言編寫？

主要嘅插件 API 將會用 Rust 編寫，同時社群亦可以透過擴展支援 WebAssembly（WASM）或其他技術嚟支援更多程式語言。

## Steel 支唔支援模組（Mods）？我裝唔裝到現有嘅模組？

唔支援 NeoForge / Forge / Fabric 模組。同插件類似，Steel 基於 Rust 建構，內部運作機制同 Java 版截然不同，未來擴展功能嘅實現方式同可能性亦會有所分別。

## 點樣提高飛行速度？

只需要喺遊戲內執行 `/fly speed <速度倍率>` 指令即可，其中速度倍率支援 0 到 30 之間嘅小數。

## 我可唔可以將 `steel-worldgen`（世界生成模組）整合到 Paper 或 Fabric 入面？

目前已經有一啲概念驗證（PoC）嘗試，我哋亦好樂意提供協助，但本項目嘅核心目標係打造一個完整嘅獨立 Minecraft 伺服器。若要喺 Java 伺服器入面調用 Rust 模組，通常需要借助 JNI 或 Project Panama。

## 點解我快速飛行時每隔幾秒就會俾伺服器拉返轉頭（回彈）？

呢個係因為觸發咗原版嘅玩家移動檢查遊戲規則（Gamerule），你可以執行 `/gamerule player_movement_check false` 嚟停用該檢查。

## 點解唔同其他 Rust Minecraft 伺服器重寫項目合併開發？

每個重寫項目都有各自嘅技術願景、架構取捨與管理方式。現有嘅其他項目未能完全契合我哋嘅設計理念，因此我哋決定由零開始打造 Steel。

## 我應該點樣參與並向 Steel 貢獻程式碼？

請參閱我哋嘅[貢獻指南](../../development/start-contributing/)。

## 我遇到問題或者 Bug，應該點算？

歡迎喺 [GitHub Issues](https://github.com/Steel-Foundation/SteelMC/issues) 上提交報告，或者加入我哋嘅 [Discord 社群](/discord) 並喺 `bugs` 頻道入面回報。
