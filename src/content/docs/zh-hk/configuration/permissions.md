---
title: 權限設定
description: 喺 SteelMC 入面設定指令權限、權限群組、玩家獨立覆寫規則與權限元數據（Metadata）。
sidebar:
  order: 4
---

SteelMC 嘅權限系統透過 `config/groups.toml` 進行設定，同時亦支援喺伺服器運行期間使用 `/perms` 指令即時修改。

權限系統負責控制指令嘅執行權限、指令參數建議（Suggestions），以及發送俾每個客戶端嘅指令語法樹。同一套系統仲支援上下文感知規則（Contextual Rules）以及供伺服器功能與插件使用嘅強類型元數據（Metadata）。

## 權限檔案說明

Steel 使用兩個權限設定檔：

| 檔案路徑 | 用途說明 |
| ---- | ------- |
| `config/groups.toml` | 伺服器全局權限群組與預設權限群組定義 |
| `<save_root>/global/player_permissions.toml` | 玩家個人嘅所屬權限群組、直接權限覆寫規則與元數據 |

日常設定伺服器權限策略時請編輯 `groups.toml`。玩家個人權限檔案位於世界設定中 `save_path`（預設為 `saves`）下嘅 `global` 目錄，由 Steel 同 `/perms` 指令自動管理；通常只有喺伺服器離線狀態下進行數據恢復或批量遷移時先需要手動編輯該檔案。

## 預設權限群組

新建立嘅伺服器預設包含兩個權限群組：`default` 與 `op`。由於 `default` 列喺 `default_groups` 入面，所有入服玩家都會自動獲得 `default` 群組權限；而必需嘅 `op` 群組預設授予所有權限（`*`），並透過 `/op` 指令指派俾管理員。

你可以透過 `[groups.<群組名稱>]` 表新增自訂伺服器角色群組。每個權限群組都可以包含允許／拒絕權限規則、元數據以及繼承嘅父權限群組。後文嘅[完整設定範例](#完整設定範例)展示咗呢啲部分嘅組合方式。

:::caution
除非你希望伺服器入面嘅所有玩家都擁有全部管理員權限，否則切勿將 `op` 加入 `default_groups`。
:::

## 權限鍵（Permission Keys）

權限鍵係由點號（`.`）分隔嘅細寫字串：

```text
minecraft.command.give
steel.command.fly
plugin.region.build
```

:::caution
權限鍵語法有嚴格驗證：每個分段只能包含細寫 ASCII 字母、數字、`_` 同 `-`。唔允許出現空分段或大寫字母。
:::

萬用字元（`*`）僅允許作為最後一個分段出現：

| 權限鍵 | 匹配含義 |
| --- | ------- |
| `*` | 匹配所有權限 |
| `minecraft.command.*` | 匹配所有子節點權限（例如 `minecraft.command.give`） |
| `minecraft.command.give` | 僅精確匹配該權限鍵本身 |

注意：`minecraft.command.*` 會匹配 `minecraft.command.give`，但 **唔會** 匹配 `minecraft.command` 本身。

:::note
萬用字元僅匹配下層子節點。如果某個系統喺父節點與子節點兩個層級都定義咗有意義嘅權限，請同時授予 `minecraft.command` 同 `minecraft.command.*`。
:::

## 指令權限

絕大多數內置指令會自動遵循以下權限鍵格式：

```text
<命名空間>.command.<指令名稱>
```

常見範例：

| 指令 | 對應權限鍵 |
| ------- | ---------- |
| `/give` | `minecraft.command.give` |
| `/fly` | `steel.command.fly` |
| `/tp` 與 `/teleport` | `minecraft.command.teleport` |
| `/xp` 與 `/experience` | `minecraft.command.experience` |
| `/perms` | `steel.command.perms` |

預設向全員開放嘅指令（例如 `/list`）喺未明確設定權限時即可直接使用，但你依然可以透過明確加入 `deny`（拒絕）規則嚟停用佢。

部分指令仲提供咗更細粒度嘅子指令或參數值權限。例如，`/tick freeze` 既可以透過授予頂層嘅 `minecraft.command.tick` 解鎖，亦可以只授予細粒度嘅 `minecraft.command.tick.freeze`。

`/gamemode` 支援按目標遊戲模式細分權限：

| 允許嘅操作 | 對應權限鍵 |
| ------ | ---------- |
| 切換為任意遊戲模式 | `minecraft.command.gamemode` |
| 僅限切換為生存模式 | `minecraft.command.gamemode.survival` |
| 僅限切換為創造模式 | `minecraft.command.gamemode.creative` |
| 僅限切換為冒險模式 | `minecraft.command.gamemode.adventure` |
| 僅限切換為旁觀模式 | `minecraft.command.gamemode.spectator` |

寬泛嘅父層允許規則會授予所有子動作權限，但更具體嘅子層拒絕規則（`deny`）可以覆寫佢。例如，喺 `allow` 入面加入 `minecraft.command.gamemode` 並喺 `deny` 入面加入 `minecraft.command.gamemode.creative`，即可允許切換除創造模式以外嘅所有遊戲模式。

## 權限群組設定

權限群組定義喺 `[groups.<群組名稱>]` 表下：

```toml
[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
]
deny = [
  "minecraft.command.stop",
]
metadata = []
```

權限群組名稱必須符合合法嘅權限分段規則：僅限細寫字母、數字、`_` 同 `-`。

### 權限群組繼承（Group Inheritance）

權限群組可以繼承其他權限群組嘅權限規則與元數據：

```toml
[groups.helper]
priority = 5
inherits = []
allow = ["minecraft.command.teleport"]
deny = []
metadata = []

[groups.moderator]
priority = 10
inherits = ["helper"]
allow = ["minecraft.command.gamemode.spectator"]
deny = []
metadata = []
```

`moderator` 群組嘅成員會同時獲得呢兩項權限。注意：繼承自 `helper` 嘅傳送權限規則依然保留 `helper` 群組自身嘅優先級 `5`，而唔會變成 `moderator` 群組嘅優先級 `10`。

繼承關係具有傳遞性，而且每個被繼承嘅權限群組最多生效一次。如果存在循環繼承或者引用咗唔存在嘅權限群組，設定驗證會直接報錯。

<a id="contextual-rules"></a>

### 上下文規則（Contextual Rules）

權限規則與元數據規則均可附帶上下文選擇器（Context Selectors）：

```toml
[groups.builder]
priority = 5
inherits = []
allow = [
  "plugin.region.build{world=lobby:spawn,plugin:region=market}",
  "minecraft.command.gamemode{domain=lobby}",
]
deny = [
  "minecraft.command.gamemode.creative{world=lobby:spawn}",
]
metadata = []
```

內置上下文鍵：

| 上下文鍵 | 範例 | 生效範圍 |
| ------- | ------- | ------- |
| `domain` | `domain=lobby` | 僅喺指定嘅[域（Domain）](../../reference/terminology#domain)內生效 |
| `world` | `world=lobby:spawn` | 僅喺指定嘅已載入[世界（World）](../../reference/terminology#world)內生效 |

插件或伺服器子系統仲可以提供自訂上下文鍵。雖然唔帶命名空間嘅鍵（如 `region=spawn`）亦係合法嘅，但對於插件自訂嘅上下文，推薦使用帶命名空間嘅鍵（如 `plugin:region=spawn`）。

多個上下文選擇器之間為邏輯與（AND）關係：

```text
plugin.region.build{world=lobby:spawn,plugin:region=market}
```

:::caution
上下文語法有嚴格驗證，同一個上下文鍵喺一個表達式入面只能出現一次。

`world=lobby:spawn` 本身就已經包含咗 `lobby` 域資訊，因此會自動匹配限定喺 `domain=lobby` 嘅上下文，無需重複書寫。如果同時寫出兩者，域名必須一致，否則好似 `{domain=survival,world=lobby:spawn}` 咁樣衝突嘅表達式會被判定為無效。

上下文值唔可以為空，而且唔可以包含空白字元、`{`、`}`、`,` 或 `=`。域名遵循 Minecraft 命名空間語法，世界則必須寫為 `<域名>:<世界名稱>` 格式。
:::

上下文嘅具體度（Specificity）按累加計算：全局規則嘅具體度最低；每個 `domain` 或自訂選擇器增加 `1` 級具體度；而 `world` 選擇器因為同時確定咗域同已載入嘅世界，會增加 `2` 級具體度。因此，同時匹配多個選擇器嘅規則比只匹配單一選擇器嘅規則具有更高嘅優先級。

<a id="metadata"></a>

## 元數據（Metadata）

元數據（Metadata）係採用與權限相同嘅群組繼承與上下文模型進行解析嘅強類型鍵值對，支援布林值（Boolean）、整數（Integer）或字串（String）：

```toml
[groups.vip]
priority = 20
inherits = []
allow = []
deny = []
metadata = [
  { key = "plugin:homes", value = 10 },
  { key = "plugin:homes{domain=lobby}", value = 3 },
  { key = "plugin:chat/color", value = "gold" },
  { key = "plugin:can_fly", value = true },
]
```

元數據鍵必須係帶命名空間嘅標識符（例如 `plugin:homes` 或 `plugin:chat/color`）。某個鍵嘅值具體代表咩含義，由定義該鍵嘅插件或子系統決定：例如，家園插件可以將上述規則解讀為「一般情況下最多可設定 10 個家，但喺 `lobby` 域內最多只能設定 3 個家」。Steel 負責儲存並按上下文解析呢啲元數據值，但唔會僅僅因為寫咗呢啲範例鍵就自動內置家園、聊天顏色或飛行功能。

元數據解析僅考慮鍵名完全一致嘅項目。當存在多條匹配目前上下文嘅項目時，Steel 按以下先後順序決定最終生效嘅值：

1. 上下文最具體嘅項目優先。
2. 當上下文具體度相同時，直接設定喺玩家個人身上嘅值優先於權限群組嘅值。
3. 當同為權限群組嘅值且具體度相同時，所屬權限群組優先級（`priority`）較高嘅值優先。
4. 若以上全部相同，則取有效元數據集合中嘅最後一條記錄。

與權限唔同，元數據冇允許／拒絕（Allow/Deny）狀態，而且元數據鍵唔支援萬用字元匹配。設定元數據值只會替換具有相同元數據鍵且上下文完全一致嘅項目；移除時亦只會刪除該精確匹配嘅項目。同一個元數據鍵嘅全局值與帶上下文嘅值可以並存。

## 權限衝突裁決順序

未設定嘅權限預設視為拒絕（Deny）。當多條權限規則同時匹配時，Steel 按以下優先級順序選出最終生效嘅規則：

1. **權限鍵更具體者優先** （例如精確權限鍵優先於 `*` 萬用字元）。
2. **上下文更具體者優先**（例如指定咗 `world` 嘅規則優先於全局規則）。
3.**當具體度相同時，玩家個人直接覆寫規則優先於權限群組規則**。
4.**當同為權限群組規則且具體度相同時，權限群組 `priority` 較高者優先**。
5.**若以上全部相同，拒絕（`deny`）優先於允許（`allow`）** 。

呢個意味住一條具體嘅拒絕規則可以輕鬆覆寫一條寬泛嘅允許規則：

```toml
[groups.staff]
priority = 10
inherits = []
allow = ["minecraft.command.*"]
deny = ["minecraft.command.stop"]
metadata = []
```

該群組內嘅管理人員可以使用絕大多數 Minecraft 原版指令，但無法執行 `/stop` 熄服。

## 完整設定範例

以下設定為小型伺服器提供咗一個實用嘅權限起點：

```toml
default_groups = ["default"]

[groups.default]
priority = 0
inherits = []
allow = []
deny = []
metadata = []

[groups.vip]
priority = 5
inherits = []
allow = []
deny = []
metadata = [
  { key = "example_homes:max", value = 5 },
  { key = "example_chat:color", value = "gold" },
]

[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
  "minecraft.command.tick.freeze",
]
deny = []
metadata = []

[groups.op]
priority = 0
inherits = []
allow = ["*"]
deny = []
metadata = []
```

- 所有玩家預設獲得 `default` 群組。
- 將 `vip` 群組指派俾需要享有插件權益嘅玩家。
- 將 `moderator` 群組指派俾需要執行日常管理指令嘅協管員。
- `/op` 指令會為目標玩家指派必需嘅 `op` 群組，預設授予全部權限。

註：上例中嘅 `example_homes:max` 與 `example_chat:color` 僅為格式演示，只有當你安裝咗讀取呢啲鍵嘅插件或子系統時先會實際生效。請將佢哋替換為你實際安裝嘅插件所支援嘅元數據鍵。

## 運行時權限管理指令

喺伺服器運行期間，可以使用 `/perms` 指令隨時查詢與修改權限設定，其基本語法為：

```text
/perms <user|group|groups> ...
```

喺進行修改前，可以先用以下指令查看目前嘅權限狀態：

```text
/perms user <目標玩家> info
/perms group <權限群組名稱> info
/perms groups list
```

呢啲指令會顯示玩家嘅個人權限設定、權限群組嘅規則與繼承關係，以及目前所有可用嘅權限群組。關於每個子指令嘅詳細用法、所需權限與範例，請參閱[權限管理指令](../../commands/permissions)。

## OP 管理員（Operators）

`/op <目標玩家>` 與 `/deop <目標玩家>` 底層直接由呢套權限系統驅動：

- `/op` 會為玩家加入 `op` 權限群組。
- `/deop` 會移除玩家嘅 `op` 權限群組。
- 預設嘅 `op` 權限群組授予咗 `*`（全部權限）。
- `op` 權限群組係系統必需群組，無法透過 `/perms` 刪除。

目標玩家既可以係目前在線玩家、曾經入過服嘅離線玩家，亦可以係伺服器能夠解析出個人檔案嘅任意玩家名稱。

## 客戶端指令語法樹同步

玩家客戶端只會收到佢有權限使用嘅指令節點，呢個會直接影響：

- 客戶端指令語法樹入面可見嘅指令
- 客戶端 Tab 鍵自動補全
- 伺服器端動態指令參數建議（Suggestions）
- 客戶端 `F3 + F4` 遊戲模式切換器可用性

後台控制台（Console）與 RCON 始終跳過權限檢查，擁有最高執行權限。
