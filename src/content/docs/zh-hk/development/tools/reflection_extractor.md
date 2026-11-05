---
title: 反射提取器 (Reflection Extractor)
description: 了解 Steel 開發中使用的反射提取器工具與用法。
---

反射提取器（Reflection Extractor）係一個專為由 Minecraft 原版內部提取運行時元數據而建構嘅內部工具。

## 工具用途

部分數據無法直接由原版數據包嘅 JSON 靜態檔案入面獲取（例如類別欄位反射、私有屬性、特定常量表等）。反射提取器透過喺 Java 運行時注入並利用反射 API，將呢啲關鍵數據結構導出為結構化 JSON。

## 輸出與使用

導出嘅數據存放喺 `steel-registry/build_assets/` 目錄下，隨後由建置流水線使用。
