---
title: 權限設定
description: 在 SteelMC 中設定指令權限、權限群組、玩家個別覆寫規則與權限中繼資料（Metadata）。
sidebar:
  order: 4
---

SteelMC 的權限系統透過 `config/groups.toml` 進行設定，同時也支援在伺服器執行期間使用 `/perms` 指令即時修改。

權限系統負責控制指令的執行權限、指令參數建議（Suggestions），以及傳送給每個用戶端的指令語法樹。同一套系統還支援情境感知規則（Contextual Rules）以及供伺服器功能與外掛使用的強型別中繼資料（Metadata）。

## 權限檔案說明

Steel 使用兩個權限設定檔：

| 檔案路徑 | 用途說明 |
| ---- | ------- |
| `config/groups.toml` | 伺服器全域權限群組與預設權限群組定義 |
| `<save_root>/global/player_permissions.toml` | 玩家個人的所屬權限群組、直接權限覆寫規則與中繼資料 |

日常設定伺服器權限策略時請編輯 `groups.toml`。玩家個人權限檔案位於世界設定中 `save_path`（預設為 `saves`）下的 `global` 目錄，由 Steel 和 `/perms` 指令自動管理；通常只有在伺服器離線狀態下進行資料復原或批次遷移時才需要手動編輯該檔案。

## 預設權限群組

新建立的伺服器預設包含兩個權限群組：`default` 與 `op`。由於 `default` 列在 `default_groups` 中，所有進入伺服器的玩家都會自動獲得 `default` 群組權限；而必需的 `op` 群組預設授予所有權限（`*`），並透過 `/op` 指令指派給管理員。

你可以透過 `[groups.<群組名稱>]` 表新增自訂伺服器角色群組。每個權限群組都可以包含允許／拒絕權限規則、中繼資料以及繼承的父權限群組。後文的[完整設定範例](#完整設定範例)展示了這些部分的組合方式。

:::caution
除非你希望伺服器裡的所有玩家都擁有全部管理員權限，否則切勿將 `op` 加入 `default_groups`。
:::

## 權限鍵（Permission Keys）

權限鍵是由點號（`.`）分隔的小寫字串：

```text
minecraft.command.give
steel.command.fly
plugin.region.build
```

:::caution
權限鍵語法有嚴格驗證：每個區段只能包含小寫 ASCII 字母、數字、`_` 和 `-`。不允許出現空區段或大寫字母。
:::

萬用字元（`*`）僅允許作為最後一個區段出現：

| 權限鍵 | 比對含義 |
| --- | ------- |
| `*` | 比對所有權限 |
| `minecraft.command.*` | 比對所有子節點權限（例如 `minecraft.command.give`） |
| `minecraft.command.give` | 僅精確比對該權限鍵本身 |

注意：`minecraft.command.*` 會比對 `minecraft.command.give`，但 **不會** 比對 `minecraft.command` 本身。

:::note
萬用字元僅比對下層子節點。若某個系統在父節點與子節點兩個層級都定義了有意義的權限，請同時授予 `minecraft.command` 和 `minecraft.command.*`。
:::

## 指令權限

絕大多數內建指令會自動遵循以下權限鍵格式：

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

預設向全員開放的指令（例如 `/list`）在未明確設定權限時即可直接使用，但你依然可以透過明確加入 `deny`（拒絕）規則來停用它。

部分指令還提供了更細緻的子指令或參數值權限。例如，`/tick freeze` 既可以透過授予頂層的 `minecraft.command.tick` 解鎖，也可以只授予細緻的 `minecraft.command.tick.freeze`。

`/gamemode` 支援依目標遊戲模式細分權限：

| 允許的操作 | 對應權限鍵 |
| ------ | ---------- |
| 切換為任意遊戲模式 | `minecraft.command.gamemode` |
| 僅限切換為生存模式 | `minecraft.command.gamemode.survival` |
| 僅限切換為創造模式 | `minecraft.command.gamemode.creative` |
| 僅限切換為冒險模式 | `minecraft.command.gamemode.adventure` |
| 僅限切換為旁觀模式 | `minecraft.command.gamemode.spectator` |

廣泛的父層允許規則會授予所有子動作權限，但更具體的子層拒絕規則（`deny`）可以覆寫它。例如，在 `allow` 中加入 `minecraft.command.gamemode` 並在 `deny` 中加入 `minecraft.command.gamemode.creative`，即可允許切換除創造模式以外的所有遊戲模式。

## 權限群組設定

權限群組定義在 `[groups.<群組名稱>]` 表下：

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

權限群組名稱必須符合合法的權限區段規則：僅限小寫字母、數字、`_` 和 `-`。

### 權限群組繼承（Group Inheritance）

權限群組可以繼承其他權限群組的權限規則與中繼資料：

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

`moderator` 群組的成員會同時獲得這兩項權限。注意：繼承自 `helper` 的傳送權限規則依然保留 `helper` 群組自身的優先順序 `5`，而不會變成 `moderator` 群組的優先順序 `10`。

繼承關係具有遞移性，且每個被繼承的權限群組最多生效一次。若存在循環繼承或參照了不存在的權限群組，設定驗證將直接報錯。

<a id="contextual-rules"></a>

### 情境規則（Contextual Rules）

權限規則與中繼資料規則均可附帶情境選擇器（Context Selectors）：

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

內建情境鍵：

| 情境鍵 | 範例 | 生效範圍 |
| ------- | ------- | ------- |
| `domain` | `domain=lobby` | 僅在指定的[域（Domain）](../../reference/terminology#domain)內生效 |
| `world` | `world=lobby:spawn` | 僅在指定的已載入[世界（World）](../../reference/terminology#world)內生效 |

外掛或伺服器子系統還可以提供自訂情境鍵。雖然不帶命名空間的鍵（如 `region=spawn`）也是合法的，但對於外掛自訂的情境，推薦使用帶命名空間的鍵（如 `plugin:region=spawn`）。

多個情境選擇器之間為邏輯且（AND）關係：

```text
plugin.region.build{world=lobby:spawn,plugin:region=market}
```

:::caution
情境語法有嚴格驗證，同一個情境鍵在一個運算式中只能出現一次。

`world=lobby:spawn` 本身就已經包含了 `lobby` 域資訊，因此會自動符合限定在 `domain=lobby` 的情境，無需重複撰寫。若同時寫出了兩者，域名必須一致，否則像 `{domain=survival,world=lobby:spawn}` 這樣衝突的運算式會被判定為無效。

情境值不能為空，且不能包含空白字元、`{`、`}`、`,` 或 `=`。域名遵循 Minecraft 命名空間語法，世界則必須寫為 `<域名>:<世界名稱>` 格式。
:::

情境的具體度（Specificity）採累加計算：全域規則的具體度最低；每個 `domain` 或自訂選擇器增加 `1` 級具體度；而 `world` 選擇器因為同時確定了域和已載入的世界，會增加 `2` 級具體度。因此，同時符合多個選擇器的規則比只符合單一選擇器的規則具有更高的優先順序。

<a id="metadata"></a>

## 中繼資料（Metadata）

中繼資料（Metadata）是採用與權限相同的群組繼承與情境模型進行解析的強型別鍵值對，支援布林值（Boolean）、整數（Integer）或字串（String）：

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

中繼資料鍵必須是帶命名空間的識別碼（例如 `plugin:homes` 或 `plugin:chat/color`）。某個鍵的值具體代表什麼含義，由定義該鍵的外掛或子系統決定：例如，家園外掛可以將上述規則解讀為「一般情況下最多可設定 10 個家，但在 `lobby` 域內最多只能設定 3 個家」。Steel 負責儲存並依情境解析這些中繼資料值，但不會僅僅因為寫了這些範例鍵就自動內建家園、聊天顏色或飛行功能。

中繼資料解析僅考慮鍵名完全一致的項目。當存在多筆符合目前情境的項目時，Steel 依以下先後順序決定最終生效的值：

1. 情境最具體的項目優先。
2. 當情境具體度相同時，直接設定在玩家個人身上的值優先於權限群組的值。
3. 當同為權限群組的值且具體度相同時，所屬權限群組優先順序（`priority`）較高的值優先。
4. 若以上全部相同，則取有效中繼資料集合中的最後一筆紀錄。

與權限不同，中繼資料沒有允許／拒絕（Allow/Deny）狀態，且中繼資料鍵不支援萬用字元比對。設定中繼資料值只會替換具有相同中繼資料鍵且情境完全一致的項目；移除時也只會刪除該精確符合的項目。同一個中繼資料鍵的全域值與帶情境的值可以並存。

## 權限衝突裁決順序

未設定的權限預設視為拒絕（Deny）。當多條權限規則同時符合時，Steel 依以下優先順序選出最終生效的規則：

1. **權限鍵更具體者優先** （例如精確權限鍵優先於 `*` 萬用字元）。
2. **情境更具體者優先**（例如指定了 `world` 的規則優先於全域規則）。
3.**當具體度相同時，玩家個人直接覆寫規則優先於權限群組規則**。
4.**當同為權限群組規則且具體度相同時，權限群組 `priority` 較高者優先**。
5.**若以上全部相同，拒絕（`deny`）優先於允許（`allow`）** 。

這意味著一條具體的拒絕規則可以輕鬆覆寫一條廣泛的允許規則：

```toml
[groups.staff]
priority = 10
inherits = []
allow = ["minecraft.command.*"]
deny = ["minecraft.command.stop"]
metadata = []
```

該群組內的管理人員可以使用絕大多數 Minecraft 原版指令，但無法執行 `/stop` 關閉伺服器。

## 完整設定範例

以下設定為小型伺服器提供了一個實用的權限起點：

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
- 將 `vip` 群組指派給需要享有外掛權益的玩家。
- 將 `moderator` 群組指派給需要執行日常管理指令的協管員。
- `/op` 指令會為目標玩家指派必需的 `op` 群組，預設授予全部權限。

註：上例中的 `example_homes:max` 與 `example_chat:color` 僅為格式展示，只有當你安裝了讀取這些鍵的外掛或子系統時才會實際生效。請將它們替換為你實際安裝的外掛所支援的中繼資料鍵。

## 執行期權限管理指令

在伺服器執行期間，可以使用 `/perms` 指令隨時查詢與修改權限設定，其基本語法為：

```text
/perms <user|group|groups> ...
```

在進行修改前，可以先用以下指令查看目前的權限狀態：

```text
/perms user <目標玩家> info
/perms group <權限群組名稱> info
/perms groups list
```

這些指令會顯示玩家的個人權限設定、權限群組的規則與繼承關係，以及目前所有可用的權限群組。關於每個子指令的詳細用法、所需權限與範例，請參閱[權限管理指令](../../commands/permissions)。

## OP 管理員（Operators）

`/op <目標玩家>` 與 `/deop <目標玩家>` 底層直接由這套權限系統驅動：

- `/op` 會為玩家加入 `op` 權限群組。
- `/deop` 會移除玩家的 `op` 權限群組。
- 預設的 `op` 權限群組授予了 `*`（全部權限）。
- `op` 權限群組是系統必需群組，無法透過 `/perms` 刪除。

目標玩家可以是目前在線玩家、曾經進過伺服器的離線玩家，或是伺服器能夠解析出個人檔案的任意玩家名稱。

## 用戶端指令語法樹同步

玩家用戶端只會收到其有權限使用的指令節點，這會直接影響：

- 用戶端指令語法樹中可見的指令
- 用戶端 Tab 鍵自動補全
- 伺服器端動態指令參數建議（Suggestions）
- 用戶端 `F3 + F4` 遊戲模式切換器可用性

後台主控台（Console）與 RCON 始終略過權限檢查，擁有最高執行權限。
