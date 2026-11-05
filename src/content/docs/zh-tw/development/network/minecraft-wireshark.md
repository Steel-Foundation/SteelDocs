---
title: 使用 Wireshark 除錯網路流量
description: 如何使用 Wireshark 擷取封包分析 Minecraft 網路協定封包。
---

本文件介紹了如何使用 Wireshark 擷取封包分析 Minecraft 用戶端與伺服器之間的原始網路流量。

如果你不想使用 Wireshark，也可以參考社群的另一個專案：[SniffCraft](https://github.com/adepierre/SniffCraft)。

## 準備工作

首先，必須在伺服器中 **停用加密與封包壓縮**：
將壓縮門檻（threshold）設為足夠大或停用，相關設定位於初次啟動後產生的 `config/config.toml` 中。

你需要準備：

- 一個本機執行的**Minecraft 伺服器**- 具備擷取 `localhost`（回環網卡）權限的**Wireshark**擷取到的封包可以對照 Minecraft 官方協定文件進行比對：
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

## 安裝 Minecraft 協定解析外掛 (Dissector)

推薦編譯並使用 Wireshark 的 Minecraft 協定解析外掛：

- **儲存庫位址**：[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)
- **推薦版本**：Wireshark 4.6

依儲存庫說明編譯出 `.so` 或 `.dll` 動態庫後，複製到 Wireshark 外掛目錄中。

## 過濾顯示規則

在 Wireshark 中使用以下過濾器，即可過濾出清楚的 Minecraft 協定資料：

```text
mcje
```

經過外掛解析後，封包將呈現格式化的結構欄位，大幅方便了協定對接與除錯。

![Wireshark 擷取封包輸出檢視](@/assets/wireshark_output.webp "Minecraft 封包解析器輸出範例")
