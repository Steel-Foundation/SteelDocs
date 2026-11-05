---
title: 如何反編譯 Minecraft
description: 如何反編譯 Minecraft Java 版遊戲本體以作為開發參考。
---

在 Minecraft 1.21.11 之前，原版程式碼經過模糊化，必須借助對應表（Mapping）才能閱讀；而本伺服器的支援目標版本為 >= 1.21.11，原版已停止模糊化，因此本文件針對這些免模糊化的現代版本進行說明。

## 準備工作

你可以透過 Minecraft 官方啟動器或第三方啟動器（如 Prism Launcher 等）建立一個目標版本的用戶端執行個體並啟動一次，啟動器會自動將對應的 `*.jar` 檔案下載到本機。下載完成後找到該 jar 檔案，即可使用下列幾種方式之一進行反編譯檢視。

## 幾種反編譯與檢視方式

- **使用官方儲存庫腳本**：直接執行 Steel 儲存庫中內建的 `update-minecraft-src.sh` 反編譯腳本（該腳本底層使用 `gitcraft` 實作）。
- **線上檢視反編譯原始碼**：直接造訪 [mcsrc.dev](https://mcsrc.dev)（例如直接開啟 [https://mcsrc.dev/1/26.1](https://mcsrc.dev/1/26.1)），不僅免去本機設定，還方便將具體程式碼行的連結分享給其他協作者。
- **使用 GitCraft 產生本機 Git 儲存庫**：複製 [gitcraft](https://github.com/WinPlay02/GitCraft) 儲存庫，並執行以下指令：
  ```bash
  ./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"
  ```
  執行完成後會在 `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` 目錄下產生完整的反編譯原始碼儲存庫。
- **使用 Vineflower 反編譯** ：下載最新的 [vineflower.jar](https://github.com/Vineflower/vineflower/releases)，然後執行：
  ```bash
  java -jar vineflower-1.11.2.jar ./minecraft-26.1-client.jar --folder minecraft_26.1
  ```
  這會將原始碼完整解壓縮到 `minecraft_26.1` 資料夾中。

## 其他實用參考資源

- 影音平台上的各類 Minecraft 模組開發與反編譯教學影片。
