---
title: 使用 Wireshark 除錯網絡流量
description: 點樣使用 Wireshark 截取封包分析 Minecraft 網絡協議封包。
---

本文檔介紹咗點樣使用 Wireshark 截取封包分析 Minecraft 客戶端與伺服器之間嘅原始網絡流量。

如果你唔想使用 Wireshark，亦可以參考社群嘅另一個項目：[SniffCraft](https://github.com/adepierre/SniffCraft)。

## 準備工作

首先，必須喺伺服器中 **停用加密與封包壓縮**：
將壓縮門檻（threshold）設為足夠大或停用，相關設定位於初次啟動後生成嘅 `config/config.toml` 入面。

你需要準備：

- 一個本地運行嘅**Minecraft 伺服器**- 具備截取 `localhost`（回環網卡）權限嘅**Wireshark**截取到嘅封包可以對照 Minecraft 官方協議文檔進行對比：
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

## 安裝 Minecraft 協議解析插件 (Dissector)

推薦編譯並使用 Wireshark 嘅 Minecraft 協議解析插件：

- **倉庫地址**：[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)
- **推薦版本**：Wireshark 4.6

按倉庫說明編譯出 `.so` 或 `.dll` 動態庫後，複製去 Wireshark 插件目錄入面。

## 過濾顯示規則

喺 Wireshark 入面使用以下過濾器，即可過濾出清晰嘅 Minecraft 協議數據：

```text
mcje
```

經過插件解析後，封包將呈現格式化嘅結構欄位，極大方便咗協議對接與除錯。

![Wireshark 截取封包輸出視圖](@/assets/wireshark_output.webp "Minecraft 封包解析器輸出範例")
