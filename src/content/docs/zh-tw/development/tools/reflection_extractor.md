---
title: 反射提取器 (Reflection Extractor)
description: 了解 Steel 開發中使用的反射提取器工具與用法。
---

反射提取器（Reflection Extractor）是一個專為從 Minecraft 原版內部提取執行期中繼資料而建構的內部工具。

## 工具用途

部分資料無法直接從原版資料包的 JSON 靜態檔案中取得（例如類別欄位反射、私有屬性、特定常數表等）。反射提取器透過在 Java 執行期注入並利用反射 API，將這些關鍵資料結構匯出為結構化 JSON。

## 輸出與使用

匯出的資料存放在 `steel-registry/build_assets/` 目錄下，隨後由建置流水線使用。
