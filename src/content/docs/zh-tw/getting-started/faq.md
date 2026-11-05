---
title: 常見問題 (FAQ)
description: 關於 SteelMC 的常見問題解答。
---

這裡彙整了大家最常問到的問題與解答！
:::caution[免責聲明]
Steel 目前仍處於 Pre-Alpha 早期開發階段，因此各項功能特性與以下回答可能會隨版本迭代頻繁變動！
:::

## 我該如何安裝 Steel？

你可以在[安裝指南](../installation)中查看完整的安裝與部署教學。

## 有提供面板 Egg 嗎？

有的，我們提供了適用於翼龍面板（Pterodactyl）與 Pelican 的 Egg 設定檔，詳情請參閱[安裝指南](../installation)。

## 為什麼找不到伺服器 `*.jar` 檔案？

Steel 不是用 Java 撰寫的，因此不會有 `*.jar` 檔案。\
別擔心，你依然可以在我們的[下載頁面](../../download)或 [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) 中直接下載適用於 Windows、Linux 與 macOS 的原生可執行檔。

## Steel 會實現原版特性相容（Vanilla Parity）嗎？

簡明扼要地說： **這正是我們的核心目標。**

## Steel 支援外掛（Plugins）嗎？我現有的 Paper / Bukkit 外掛能在 Steel 上用嗎？

目前還不支援。Steel 仍在積極開發中，外掛系統已在規劃內但尚未開放。\
未來 Steel 將推出專屬的原生 API，我們非常期待能融合 Paper / Bukkit 與主流模組 API 的優點！由於底層語言與架構不同，現有的 Paper / Bukkit Java 外掛無法直接執行。

## 未來外掛會用什麼語言撰寫？

主要的外掛 API 將使用 Rust 撰寫，同時社群也可以透過擴充支援 WebAssembly（WASM）或其他技術來支援更多程式語言。

## Steel 支援模組（Mods）嗎？我能裝現有的模組嗎？

不支援 NeoForge / Forge / Fabric 模組。與外掛類似，Steel 基於 Rust 建構，內部運作機制與 Java 版截然不同，未來擴充功能的實作方式與可能性也會有所差異。

## 如何提高飛行速度？

只需在遊戲內執行 `/fly speed <速度倍率>` 指令即可，其中速度倍率支援 0 到 30 之間的小數。

## 我可以把 `steel-worldgen`（世界生成模組）整合到 Paper 或 Fabric 中嗎？

目前已經有一些概念驗證（PoC）嘗試，我們也很樂意提供協助，但本專案的核心目標是打造一個完整的獨立 Minecraft 伺服器。若要在 Java 伺服器中呼叫 Rust 模組，通常需要透過 JNI 或 Project Panama。

## 為什麼我快速飛行時每隔幾秒就會被伺服器拉回（回彈）？

這是由於觸發了原版的玩家移動檢查遊戲規則（Gamerule），你可以執行 `/gamerule player_movement_check false` 來停用該檢查。

## 為什麼不和其他 Rust Minecraft 伺服器重寫專案合併開發？

每個重寫專案都有各自的技術願景、架構取捨與管理方式。現有的其他專案未能完全契合我們的設計理念，因此我們決定從零開始打造 Steel。

## 我該如何參與並向 Steel 貢獻程式碼？

請參閱我們的[貢獻指南](../../development/start-contributing/)。

## 我遇到了問題或 Bug，該怎麼辦？

歡迎在 [GitHub Issues](https://github.com/Steel-Foundation/SteelMC/issues) 上提交回報，或加入我們的 [Discord 社群](/discord) 並在 `bugs` 頻道中回報。
