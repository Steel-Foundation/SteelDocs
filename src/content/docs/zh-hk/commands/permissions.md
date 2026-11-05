---
title: 權限管理指令 (/perms)
description: 使用 /perms 指令喺線上查看與管理 SteelMC 嘅權限規則、權限群組、繼承關係與元數據。
sidebar:
  order: 2
---

`/perms` 指令用於喺伺服器運行期間動態管理權限系統。佢分為三個子作用範圍：

```text
/perms user <targets> <operation>
/perms group <group> <operation>
/perms groups <operation>
```

- `user`：管理玩家個人嘅直接權限覆寫規則與所屬權限群組指派。
- `group`：管理單一指定權限群組嘅權限規則、優先級（Priority）、繼承關係與元數據（Metadata）。
- `groups`：列出所有權限群組，以及管理所有玩家預設獲得嘅權限群組（`default_groups`）。

本參考文檔假設你已熟悉權限鍵、萬用字元、權限群組與上下文選擇器等概念。如果你對呢啲概念仲未熟，建議先閱讀[權限設定](../../configuration/permissions)。

:::tip
喺修改某個玩家或權限群組之前，建議先執行查看指令。直接覆寫規則、群組繼承規則、上下文規則以及權限群組優先級會共同決定最終生效結果，單睇某一條設定可能同最終結果唔同。
:::

## 授權驗證機制

`/perms` 嘅每一項子操作都有對應嘅細粒度指令權限。例如，查看玩家權限資訊需要 `steel.command.perms.user.info`。除非某項子操作被更具體嘅拒絕規則（`deny`）停用，否則授予根權限 `steel.command.perms` 即可解鎖 `/perms` 嘅所有子操作。

此外，查看或修改受管數據仲需要執行者具備對應嘅管理授權（Authority）：

| 管理授權鍵 | 作用說明 |
| --- | --- |
| `steel.permission.manage.<permission>` | 允許查看、檢查（check）或修改指定權限鍵嘅規則 |
| `steel.permission.group.<group>` | 允許查看、指派或修改指定權限群組 |
| `steel.permission.metadata` | 允許顯示、檢查或修改權限元數據（Metadata） |

管理授權同樣支援萬用字元。例如，`steel.permission.manage.minecraft.command.*` 允許管理所有下屬指令權限（如 `minecraft.command.give`），而 `steel.permission.manage.*` 則允許管理任意權限鍵；同理，`steel.permission.group.*` 允許管理所有權限群組。

資訊查看類指令會根據執行者擁有嘅管理授權自動過濾輸出內容。例如，若執行者冇 `steel.permission.metadata` 權限，`user info` 輸出入面會自動隱藏元數據部分，並過濾掉執行者無權管理嘅規則與權限群組。

後台控制台（Console）與 RCON 自動跳過上述所有玩家權限與管理授權檢查。

## 查看目前權限設定

喺落手修改之前，建議先運行以下查看指令。

### 查看玩家權限資訊

```text
/perms user <targets> info
```

顯示目標玩家已指派嘅權限群組、直接權限規則與直接元數據覆寫項。注意：呢條指令顯示嘅係玩家檔案上直接儲存嘅設定，而非展開所有繼承關係後嘅完整規則列表。

所需指令權限：`steel.command.perms.user.info`

輸出內容會根據執行者嘅權限管理、群組管理與元數據管理授權進行過濾。

```text
/perms user Steve info
```

### 檢查玩家嘅最終生效權限

```text
/perms user <targets> check <permission_expr>
```

完整解析目標玩家喺指定權限表達式下嘅最終生效結果（綜合計算預設群組、已指派群組、個人直接覆寫、繼承關係、群組優先級與上下文），並回報最終勝出嘅規則及其來源，或者提示該權限未設定（Unset）。

所需指令權限：`steel.command.perms.user.check`

附加管理授權：針對所檢查權限鍵嘅 `steel.permission.manage.<permission>`。

```text
/perms user Steve check minecraft.command.gamemode.creative
/perms user Steve check minecraft.command.gamemode{domain=lobby}
```

### 查看權限群組詳情

```text
/perms group <group> info
```

顯示指定權限群組嘅優先級、父權限群組、允許規則（`allow`）、拒絕規則（`deny`）以及元數據。超出執行者管理授權範圍嘅項目會被自動隱藏。

所需指令權限：`steel.command.perms.group.info`

附加管理授權：`steel.permission.group.<group>`。顯示元數據仲需要 `steel.permission.metadata`，顯示各條權限規則仲需要對應嘅 `steel.permission.manage.<permission>`。

```text
/perms group moderator info
```

### 列出所有權限群組

```text
/perms groups list
```

列出執行者有權管理嘅所有權限群組，並標示邊啲群組屬於預設權限群組（`default_groups`）。

所需指令權限：`steel.command.perms.groups.list`

僅顯示喺執行者 `steel.permission.group.<group>` 授權範圍內嘅權限群組。

## 管理玩家個人權限規則

權限表達式（`<permission_expr>`）由權限鍵加上可選嘅上下文選擇器組成：

```text
<permission>{<context>=<value>,...}
```

完整語法與裁決行為請參閱[上下文規則](../../configuration/permissions#contextual-rules)。

### 允許某項權限（Allow）

```text
/perms user <targets> allow <permission_expr>
```

為目標玩家新增或替換一條完全匹配該鍵與上下文嘅直接允許規則。同一權限鍵喺其他上下文下嘅規則維持不變。

所需指令權限：`steel.command.perms.user.allow`

附加管理授權：`steel.permission.manage.<permission>`。

```text
/perms user Steve allow minecraft.command.teleport
/perms user Steve allow minecraft.command.gamemode{domain=lobby}
```

### 拒絕某項權限（Deny）

```text
/perms user <targets> deny <permission_expr>
```

為目標玩家新增或替換一條完全匹配該鍵與上下文嘅直接拒絕規則。具體嘅拒絕規則可以覆寫寬泛嘅允許規則。

所需指令權限：`steel.command.perms.user.deny`

附加管理授權：`steel.permission.manage.<permission>`。

```text
/perms user Steve deny minecraft.command.gamemode.creative
```

### 移除個人直接規則（Unset）

```text
/perms user <targets> unset <permission_expr>
```

僅移除目標玩家身上具有相同權限鍵且上下文完全一致嘅直接規則。由權限群組繼承而嚟嘅規則唔會被移除。

所需指令權限：`steel.command.perms.user.unset`

附加管理授權：`steel.permission.manage.<permission>`。

```text
/perms user Steve unset minecraft.command.gamemode{domain=lobby}
```

## 指派玩家所屬權限群組

### 為玩家加入權限群組

```text
/perms user <targets> group add <group>
```

將指定權限群組指派俾目標玩家。如果玩家已經擁有該群組，則唔會產生任何變更。

所需指令權限：`steel.command.perms.user.group.add`

附加管理授權：`steel.permission.group.<group>`。

```text
/perms user Steve group add moderator
```

### 移除玩家嘅權限群組

```text
/perms user <targets> group remove <group>
```

由目標玩家身上移除已指派嘅指定權限群組。注意：呢個操作唔會移除玩家透過 `default_groups` 預設群組或群組繼承關係獲得嘅權限群組。

所需指令權限：`steel.command.perms.user.group.remove`

附加管理授權：`steel.permission.group.<group>`。

```text
/perms user Steve group remove moderator
```

## 管理權限群組

### 建立或刪除權限群組

```text
/perms group <group> create
/perms group <group> delete
```

`create` 會建立一個空嘅權限群組；`delete` 會由權限群組設定中刪除該群組。如果目標群組係系統必需嘅 `op` 群組、仍處於 `default_groups` 預設群組列表入面，或者仍被其他權限群組繼承，Steel 會拒絕刪除——請先移除呢啲引用關係。

所需指令權限：`steel.command.perms.group.create` 與 `steel.command.perms.group.delete`。

附加管理授權：`steel.permission.group.<group>`。

```text
/perms group moderator create
/perms group retired-staff delete
```

### 允許、拒絕或移除權限群組規則

```text
/perms group <group> allow <permission_expr>
/perms group <group> deny <permission_expr>
/perms group <group> unset <permission_expr>
```

`allow` 與 `deny` 用於喺權限群組上新增或替換指定規則；`unset` 僅移除該群組上具有相同權限鍵與完全一致上下文嘅規則。

所需指令權限：

- `steel.command.perms.group.allow`
- `steel.command.perms.group.deny`
- `steel.command.perms.group.unset`

附加管理授權：同時需要 `steel.permission.group.<group>` 與 `steel.permission.manage.<permission>`。

```text
/perms group moderator allow minecraft.command.teleport
/perms group moderator deny minecraft.command.stop
/perms group moderator unset minecraft.command.teleport
```

### 修改權限群組優先級

```text
/perms group <group> priority <priority>
```

設定該權限群組嘅 32 位元有號整數優先級（當唔同權限群組中具有相同具體度嘅規則發生衝突時，優先級數值較大者勝出；具體度始終優先於群組優先級）。

所需指令權限：`steel.command.perms.group.priority`

附加管理授權：`steel.permission.group.<group>`。

```text
/perms group moderator priority 10
```

## 管理權限群組繼承關係

### 列出父權限群組

```text
/perms group <group> inherit list
```

列出該權限群組嘅直接父權限群組（超出執行者群組管理授權嘅父群組會被隱藏）。

所需指令權限：`steel.command.perms.group.inherit.list`

附加管理授權：`steel.permission.group.<group>`。

```text
/perms group moderator inherit list
```

### 新增或移除父權限群組

```text
/perms group <group> inherit add <parent>
/perms group <group> inherit remove <parent>
```

新增或移除一條直接繼承關係。如果新增繼承會導致循環依賴，操作將被拒絕。繼承而嚟嘅規則保留其原定義所在權限群組嘅優先級。

所需指令權限：`steel.command.perms.group.inherit.add` 與 `steel.command.perms.group.inherit.remove`。

附加管理授權：同時需要 `steel.permission.group.<group>` 與 `steel.permission.group.<parent>`。

```text
/perms group moderator inherit add helper
/perms group moderator inherit remove helper
```

## 管理元數據（Metadata）

元數據表達式使用帶命名空間嘅鍵名，並支援與權限表達式相同嘅可選上下文語法：

```text
<namespace>:<key>{<context>=<value>,...}
```

設定元數據值時須明確指定類型：`int`（整數）、`bool`（布林值）或 `string`（字串）。解析優先級規則請參閱[元數據設定說明](../../configuration/permissions#metadata)。

如果字串值入面包含空格，請使用英文雙引號包住：

```text
/perms user Steve metadata set string "Senior Builder" plugin:rank
```

### 設定玩家元數據

```text
/perms user <targets> metadata set int <value> <metadata_expr>
/perms user <targets> metadata set bool <value> <metadata_expr>
/perms user <targets> metadata set string <value> <metadata_expr>
```

為目標玩家設定直接元數據覆寫值（僅替換具有相同元數據鍵且上下文完全一致嘅項目）。

所需指令權限：`steel.command.perms.user.metadata.set`

附加管理授權：`steel.permission.metadata`。

```text
/perms user Steve metadata set int 5 plugin:max_homes
/perms user Steve metadata set string gold plugin:chat/color{domain=lobby}
```

### 檢查玩家生效元數據

```text
/perms user <targets> metadata check <metadata_expr>
```

解析目標玩家喺指定上下文下嘅最終生效元數據值（綜合權限群組元數據與個人覆寫項），並回報最終生效值嘅來源。

所需指令權限：`steel.command.perms.user.metadata.check`

附加管理授權：`steel.permission.metadata`。

```text
/perms user Steve metadata check plugin:max_homes{world=survival:overworld}
```

### 移除玩家元數據

```text
/perms user <targets> metadata unset <metadata_expr>
```

僅移除玩家個人身上具有相同鍵與完全一致上下文嘅直接元數據項目（由權限群組繼承嘅元數據唔受影響）。

所需指令權限：`steel.command.perms.user.metadata.unset`

附加管理授權：`steel.permission.metadata`。

```text
/perms user Steve metadata unset plugin:max_homes
```

### 設定或移除權限群組元數據

```text
/perms group <group> metadata set int <value> <metadata_expr>
/perms group <group> metadata set bool <value> <metadata_expr>
/perms group <group> metadata set string <value> <metadata_expr>
/perms group <group> metadata unset <metadata_expr>
```

喺權限群組上設定或移除精確匹配嘅元數據項目。如需查看權限群組上已設定嘅元數據，請使用 `/perms group <group> info`（權限群組冇單獨嘅 `metadata check` 子指令）。

所需指令權限：`steel.command.perms.group.metadata.set` 與 `steel.command.perms.group.metadata.unset`。

附加管理授權：同時需要 `steel.permission.group.<group>` 與 `steel.permission.metadata`。

```text
/perms group vip metadata set int 10 plugin:max_homes
/perms group vip metadata unset plugin:max_homes
```

## 管理預設權限群組（Default Groups）

```text
/perms groups default add <group>
/perms groups default remove <group>
```

向 `default_groups` 列表入面新增或移除一個權限群組。預設權限群組會自動套用喺每一位玩家身上。由預設群組列表中移除某個群組唔會刪除該權限群組本身。

所需指令權限：`steel.command.perms.groups.default.add` 與 `steel.command.perms.groups.default.remove`。

附加管理授權：`steel.permission.group.<group>`。

```text
/perms groups default add member
/perms groups default remove member
```

## 持久化與離線玩家支援

對權限群組嘅修改會自動寫回 `config/groups.toml`；對玩家個人嘅修改會自動更新至 `<save_root>/global/player_permissions.toml`，並支援直接指定在線玩家、已知離線玩家或可透過伺服器個人檔案查詢解析嘅玩家名稱。

所有檔案讀寫與檔案解析均喺後台非同步完成，絕唔會阻塞伺服器主遊戲刻（Game Tick）。指令執行會非同步掛起直至持久化完成，隨後向指令發送者回傳操作結果與反饋訊息。
