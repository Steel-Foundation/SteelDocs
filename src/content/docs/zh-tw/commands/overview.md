---
title: 指令參考
description: SteelMC 指令語法慣例與詳細參考文件。
sidebar:
  order: 1
---

本章節記錄了需要詳細說明的 SteelMC 指令體系。每篇參考文件都詳細說明了各項操作的具體作用、所需的權限節點以及安全使用方式。

## 指令索引

- [`/perms`](../permissions) —— 檢視與管理玩家權限規則、權限群組、繼承關係、預設群組及中繼資料（Metadata）
- [伺服器主控台](../console) —— 後台終端機快捷鍵、指令歷史紀錄、反向搜尋、Tab 自動補全與優雅關閉伺服器

原版指令遵循標準的 Minecraft 指令語法。對於未附加 Steel 專屬擴充行為的原版指令，可直接參閱 [Minecraft Wiki 指令列表](https://zh.minecraft.wiki/w/%E5%91%BD%E4%BB%A4)。

## 指令語法慣例

在指令參考文件中，角括號 `<...>` 代表必須由你提供的必填參數：

```text
/command <必填參數>
```

實際輸入指令時請不要輸入角括號本身。例如，`/perms group <group> info` 在實際執行時應輸入：

```text
/perms group moderator info
```

目標玩家參數（`<targets>`）支援輸入玩家名稱或相容的 Minecraft 目標選擇器（如 `@s`、`@a`）。使用玩家個人檔案（Profile）作為目標的指令還可以解析曾經進過伺服器的已知離線玩家。

## 指令權限

大多數指令的權限鍵直接由其帶命名空間的指令 ID 衍生而來：

```text
<命名空間>.command.<指令名稱>
```

部分指令集還會為各個子操作發佈更細緻的權限節點。除非被更具體的拒絕規則（`deny`）覆寫，否則授予根層級指令權限即可解鎖其下屬的所有子操作。後台主控台（Console）與 RCON 始終略過玩家權限檢查。

關於權限鍵、權限群組、情境選擇器與衝突裁決規則的詳細說明，請參閱[權限設定](../../configuration/permissions)。
