---
title: 指令參考
description: SteelMC 指令語法約定與詳細參考文檔。
sidebar:
  order: 1
---

本章節記錄咗需要詳細說明嘅 SteelMC 指令體系。每篇參考文檔都詳細介紹咗各項操作嘅具體作用、所需嘅權限節點以及安全使用方式。

## 指令索引

- [`/perms`](../permissions) —— 查看與管理玩家權限規則、權限群組、繼承關係、預設群組及元數據（Metadata）
- [伺服器控制台](../console) —— 後台終端機快捷鍵、指令歷史記錄、反向搜尋、Tab 自動補全與優雅熄服

原版指令遵循標準嘅 Minecraft 指令語法。對於未附加 Steel 專屬擴展行為嘅原版指令，可以直接參閱 [Minecraft Wiki 指令列表](https://zh.minecraft.wiki/w/%E5%91%BD%E4%BB%A4)。

## 指令語法約定

喺指令參考文檔入面，尖括號 `<...>` 代表必須由你提供嘅必填參數：

```text
/command <必填參數>
```

實際輸入指令時請唔好輸入尖括號本身。例如，`/perms group <group> info` 喺實際執行時應輸入：

```text
/perms group moderator info
```

目標玩家參數（`<targets>`）支援輸入玩家名稱或兼容嘅 Minecraft 目標選擇器（如 `@s`、`@a`）。使用玩家個人檔案（Profile）作為目標嘅指令仲可以解析曾經入過服嘅已知離線玩家。

## 指令權限

大多數指令嘅權限鍵直接由其帶命名空間嘅指令 ID 衍生而嚟：

```text
<命名空間>.command.<指令名稱>
```

部分指令族仲會為各個子操作發佈更細粒度嘅權限節點。除非被更具體嘅拒絕規則（`deny`）覆寫，否則授予根層級指令權限即可解鎖其下屬嘅所有子操作。後台控制台（Console）與 RCON 始終跳過玩家權限檢查。

關於權限鍵、權限群組、上下文選擇器與衝突裁決規則嘅詳細說明，請參閱[權限設定](../../configuration/permissions)。
