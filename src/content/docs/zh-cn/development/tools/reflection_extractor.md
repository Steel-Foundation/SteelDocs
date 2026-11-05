---
title: 反射提取器 (Reflection Extractor)
description: 了解 Steel 开发中使用的反射提取器工具与用法。
---

反射提取器（Reflection Extractor）是一个专为从 Minecraft 原版内部提取运行时元数据而构建的内部工具。

## 工具用途

部分数据无法直接从原版数据包的 JSON 静态文件中获得（例如类字段反射、私有属性、特定常量表等）。反射提取器通过在 Java 运行时注入并利用反射 API，将这些关键数据结构导出为结构化 JSON。

## 输出与使用

导出的数据存放在 `steel-registry/build_assets/` 目录下，随后由构建流水线消费。
