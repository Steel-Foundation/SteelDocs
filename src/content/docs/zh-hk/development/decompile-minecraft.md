---
title: 點樣反編譯 Minecraft
description: 點樣反編譯 Minecraft Java 版遊戲本體以作為開發參考。
---

喺 Minecraft 1.21.11 之前，原版程式碼經過混淆，必須借助對應表（Mapping）先可以閱讀；而本伺服器嘅適配目標版本為 >= 1.21.11，原版已停止混淆，因此本文檔針對呢啲免混淆嘅現代版本進行說明。

## 準備工作

你可以透過 Minecraft 官方啟動器或第三方啟動器（如 Prism Launcher 等）建立一個目標版本嘅客戶端實例並啟動一次，啟動器會自動將對應嘅 `*.jar` 檔案下載到本地。下載完成後搵到該 jar 檔案，即可使用下列幾種方式之一進行反編譯查看。

## 幾種反編譯與查看方式

- **使用官方倉庫腳本**：直接運行 Steel 倉庫自帶嘅 `update-minecraft-src.sh` 反編譯腳本（該腳本底層使用 `gitcraft` 實現）。
- **線上查看反編譯源碼**：直接瀏覽 [mcsrc.dev](https://mcsrc.dev)（例如直接打開 [https://mcsrc.dev/1/26.1](https://mcsrc.dev/1/26.1)），唔單止免去本地配置，仲方便將具體程式碼行嘅連結分享俾其他協作者。
- **使用 GitCraft 生成本地 Git 倉庫**：Clone [gitcraft](https://github.com/WinPlay02/GitCraft) 倉庫，並運行以下指令：
  ```bash
  ./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"
  ```
  運行完成後會喺 `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` 目錄下生成完整嘅反編譯源碼倉庫。
- **使用 Vineflower 反編譯** ：下載最新嘅 [vineflower.jar](https://github.com/Vineflower/vineflower/releases)，然後執行：
  ```bash
  java -jar vineflower-1.11.2.jar ./minecraft-26.1-client.jar --folder minecraft_26.1
  ```
  呢個指令會將源碼完整解壓到 `minecraft_26.1` 資料夾入面。

## 其他實用參考資源

- 影片平台上面嘅各類 Minecraft 模組開發與反編譯教學影片。
