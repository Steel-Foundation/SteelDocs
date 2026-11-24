---
title: Permission Configuration
description: Configure command permissions, groups, collections, player overrides, and permission metadata in SteelMC.
sidebar:
  order: 4
---

SteelMC permissions are configured through `config/permission/groups.toml` and `config/permission/collections.toml`, and can also be edited at runtime with `/perms`.

Permissions control command access, command suggestions, and the command tree sent to each client. The same system also supports contextual rules and typed metadata values for server features and plugins.

## Files

Steel uses three permission files:

| File | Purpose |
| ---- | ------- |
| `config/permission/groups.toml` | Server-wide permission groups and default groups |
| `config/permission/collections.toml` | Optional replacements for code-owned permission collections |
| `<save_root>/global/player_permissions.toml` | Per-player assigned groups, direct overrides, and metadata |

Edit `groups.toml` for normal server policy. `collections.toml` is usually left empty because the vanilla collections are provided by the server; see [Collections](#collections). The player permissions file is under the configured world `save_path`, which defaults to `saves`. It is managed by Steel and `/perms`; manual edits should only be needed for recovery or bulk migration while the server is offline.

## Permission Keys

Permission keys are namespaced identifiers:

```text
minecraft:command.give
steel:command.fly
myplugin:region.build
```

The namespace is separated from the path by a colon. When the namespace is omitted, the key matches every namespace:

| Key | Meaning |
| --- | ------- |
| `*` | Every permission |
| `minecraft:command.*` | Descendants such as `minecraft:command.give` |
| `command.*` | Descendants of `command` in any namespace |
| `minecraft:command.give` | Only that exact permission |

The path is a `.`-separated list of segments. Segments can contain only lowercase ASCII letters, digits, `_`, and `-`. Namespaces follow Minecraft identifier rules: lowercase letters, digits, `_`, `.`, and `-`.

A wildcard is allowed only as the final segment, and it matches descendants only. `minecraft:command.*` matches `minecraft:command.give`, but it does not match `minecraft:command` itself.

:::note
A wildcard matches descendants only. Grant both `minecraft:command` and `minecraft:command.*` if a system defines meaningful permissions at both levels.
:::

## Collections

A **collection** is a named set of permissions owned by code, referenced with `#namespace:name`:

```toml
[groups.gamemasters]
priority = 0
inherits = ["moderators"]
allow = ["#minecraft:gamemasters"]
deny = []
metadata = []
```

A collection holds concrete permissions and may also include other collections. When a group allows a collection, it receives every permission the collection contains, following nested references. When a group denies a collection, it denies every permission the collection contains.

Collections are only meaningful inside a group; reference them explicitly in a group's `allow` or `deny` list. An omitted namespace defaults to `minecraft`, so `#all` means `#minecraft:all`.

The server provides one collection per vanilla permission level:

| Collection | Contents |
| ---------- | -------- |
| `#minecraft:all` | Commands every player may use |
| `#minecraft:moderators` | No commands of its own |
| `#minecraft:gamemasters` | Most gameplay commands |
| `#minecraft:admins` | Administrative commands |
| `#minecraft:owners` | Full server operator |

These collections are kept up to date by the server. The vanilla command permissions are compiled into them from the server's generated data, and each built-in command contributes its derived permission to the collection it declares. Steel commands such as `/fly` declare `#minecraft:gamemasters`; a command that declares no collection contributes to `#minecraft:owners`.

Plugins can contribute members to a collection at runtime, including the built-in collections, without editing `collections.toml`. These code-declared members extend the built-in collection with the same id. Code-declared members are never persisted; they are re-declared at every startup. See [Extending permissions](../../development/commands/04-permissions#permission-collections) for the plugin API.

### Replacing a collection

Declare a collection in `config/permission/collections.toml` to replace the built-in collection with the same id:

```toml
[collections.minecraft]
all = ["minecraft:command.help", "minecraft:command.list"]

[collections.myplugin]
build = ["myplugin:build.place", "#minecraft:gamemasters"]
```

Each `[collections.<namespace>]` table maps a collection name to its members. Members are permission identifiers or other `#namespace:name` references. Collection names must be valid identifier paths, and namespaces follow identifier rules.

:::caution
A collection declared in `collections.toml` replaces the built-in collection entirely and is never updated again, even when the server later adds new vanilla permissions. Use `/perms collection export` to snapshot a collection you intend to customize, or `/perms collection <collection> add|remove` to edit one in place. The first export or edit of a collection that was not already configured prints a warning about this precedence; already-configured collections do not. Prefer extending a vanilla collection with `#minecraft:<level>` and referencing it from a group when you only need to grant its permissions.
:::

A reference to an unknown collection resolves to nothing, so a typo silently grants or denies no permissions.

## Default Groups

A new server ships with this configuration:

```toml
default_groups = ["all"]
op_group = "owners"
command_block_groups = ["gamemasters"]
```

Every player receives `all` because it is listed in `default_groups`. `op_group` is the group assigned by `/op`, and `command_block_groups` lists the groups granted to command blocks. Both can be changed at runtime with `/perms groups op set` and `/perms groups command_block add|remove`.

Add server roles as additional tables named `[groups.<name>]`. Each group can contain permission rules, collection references, metadata, and parent groups to inherit from. A [complete example](#complete-example) later on this page shows how these pieces fit together.

:::caution
Do not put `op_group` in `default_groups` unless every player should receive operator permissions.
:::

## Vanilla Groups

Steel mirrors the five vanilla permission levels as explicit groups. Each level inherits from the level below it and adds the collection of its own commands:

| Group | Inherits | Adds |
| ----- | -------- | ---- |
| `all` | — | `#minecraft:all` |
| `moderators` | `all` | — |
| `gamemasters` | `moderators` | `#minecraft:gamemasters` |
| `admins` | `gamemasters` | `#minecraft:admins` |
| `owners` | `admins` | `#minecraft:owners` |

Because inheritance is transitive, `owners` receives the collections of every level below it. The groups live in `groups.toml` and are read from there; the collections they reference are provided by the server.

A custom group that inherits a vanilla group also receives its collections:

```toml
[groups.builder]
priority = 0
inherits = ["gamemasters"]
allow = ["steel:command.perms"]
deny = []
metadata = []
```

Members of `builder` receive every permission in the `gamemasters` chain plus `/perms`. To remove a permission, add an explicit `deny` for that key in the group.

## Command Permissions

Most built-in commands automatically use this permission shape:

```text
<namespace>:command.<command>
```

Examples:

| Command | Permission |
| ------- | ---------- |
| `/give` | `minecraft:command.give` |
| `/fly` | `steel:command.fly` |
| `/tp` and `/teleport` | `minecraft:command.teleport` |
| `/xp` and `/experience` | `minecraft:command.experience` |
| `/perms` | `steel:command.perms` |

Each built-in command contributes its derived permission to the collection it declares. Vanilla commands are compiled into the collection matching their vanilla permission level. Steel commands such as `/fly` declare `#minecraft:gamemasters`, while a command that declares no collection contributes to `#minecraft:owners`. Because the vanilla groups are cumulative, a command in `#minecraft:gamemasters` is also received by `admins` and `owners`.

Some commands expose narrower subcommand or value permissions. For example, `/tick freeze` can be granted with either `minecraft:command.tick` or `minecraft:command.tick.freeze`.

`/gamemode` has value-specific permissions:

| Action | Permission |
| ------ | ---------- |
| Any gamemode change | `minecraft:command.gamemode` |
| Survival only | `minecraft:command.gamemode.survival` |
| Creative only | `minecraft:command.gamemode.creative` |
| Adventure only | `minecraft:command.gamemode.adventure` |
| Spectator only | `minecraft:command.gamemode.spectator` |

A broader permission grants the child action, but a more specific deny can override it. For example, allow `minecraft:command.gamemode` and deny `minecraft:command.gamemode.creative` to allow all gamemode changes except creative.

### Management authorities

Using `/perms` requires two separate things:

1. Access to the command itself, granted by `steel:command.perms`. This permission is declared in `minecraft:moderators`, so every vanilla level except `all` can reach `/perms`.
2. An authority for the action being performed. These authorities live in the vanilla collections, not in the groups:

   | Authority | Needed for |
   | --------- | ---------- |
   | `steel:permission.manage.<namespace>.<path>` | `user allow`/`deny`/`unset`, `group allow`/`deny`/`unset`, and collection edits |
   | `steel:permission.manage.minecraft.<level>` | Adding or removing a `#minecraft:<level>` collection rule |
   | `steel:permission.group.<name>` | Group assignment, creation, deletion, priority, inheritance, default groups, `op_group`, and `command_block_groups` |
   | `steel:permission.metadata` | Reading and editing metadata |
   | `steel:permission.manage.*` | `/perms reload` |

Each vanilla level above `all` carries the authorities for its own permissions, its collection, its group, and metadata. `minecraft:admins` also carries `steel:permission.group.all`, so `admins` and `owners` can manage the default group. Levels inherit downward, so `admins` can manage `admins`, `gamemasters`, `moderators`, `all`, and their permissions, but not `owners`. `owners` also receives `steel:permission.manage.*` and `steel:permission.group.*` in its `minecraft:owners` collection, so it can administer everything including future plugin keys. `all` receives no management authority.

Permissions declared by code also grant their matching `steel:permission.manage.<namespace>.<path>` authority in the same collection. This covers built-in Steel commands and permissions contributed with `CommandRegistry::declare_permission`, including plugin contributions, so they can be edited with `/perms` without adding authorities by hand.

A management authority authorizes itself: editing `steel:permission.manage.minecraft.command.give` requires that same key, not a nested `steel:permission.manage.steel.permission.manage...` key. This also applies to generated authorities such as `steel:permission.manage.steel.permission.group.admins`.

Having a management authority without `steel:command.perms` is not enough: the command requirement is checked before the action handler runs.

A group created in `groups.toml` receives no management authority by default. To let it administer a level, add that level's collection to its `allow` list, for example `#minecraft:gamemasters`.

## Group Configuration

Groups are tables under `[groups.<name>]`.

```toml
[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft:command.teleport",
  "minecraft:command.gamemode.spectator",
]
deny = [
  "minecraft:command.stop",
]
metadata = []
```

Each `allow` and `deny` entry is either a permission expression or a `#namespace:name` collection reference.

Group names must be valid permission segments: lowercase letters, digits, `_`, and `-`.

### Group Inheritance

Groups can inherit the permissions and metadata of other groups:

```toml
[groups.helper]
priority = 5
inherits = []
allow = ["minecraft:command.teleport"]
deny = []
metadata = []

[groups.moderator]
priority = 10
inherits = ["helper"]
allow = ["minecraft:command.gamemode.spectator"]
deny = []
metadata = []
```

Members of `moderator` receive both permissions. The inherited teleport rule keeps the `helper` priority of `5`; it does not take on the `moderator` priority of `10`. Inherited collection references behave the same way: the permissions they expand to keep the priority of the group that declared the reference.

Inheritance is transitive, and each inherited group contributes at most once. Cycles and references to missing groups make the configuration invalid.

### Contextual Rules

Permission and metadata rules can include context selectors:

```toml
[groups.builder]
priority = 5
inherits = []
allow = [
  "myplugin:region.build{world=lobby:spawn,myplugin:region=market}",
  "minecraft:command.gamemode{domain=lobby}",
]
deny = [
  "minecraft:command.gamemode.creative{world=lobby:spawn}",
]
metadata = []
```

Built-in context keys:

| Context | Example | Meaning |
| ------- | ------- | ------- |
| `domain` | `domain=lobby` | Applies only inside one [domain](../../reference/terminology#domain) |
| `world` | `world=lobby:spawn` | Applies only inside one loaded [world](../../reference/terminology#world) |

Custom contexts can be provided by plugins or server subsystems. Unqualified keys such as `region=spawn` are valid, but namespaced keys such as `myplugin:region=spawn` are preferred for plugin-owned contexts.

Multiple selectors are combined with AND:

```text
myplugin:region.build{world=lobby:spawn,myplugin:region=market}
```

:::caution
Context syntax is strict. Each key can appear only once in an expression.

`world=lobby:spawn` already includes the `lobby` domain and therefore matches rules scoped to `domain=lobby`. Writing both is unnecessary. If both are present, they must agree; `{domain=survival,world=lobby:spawn}` is invalid.

Values cannot be empty and cannot contain whitespace, `{`, `}`, `,`, or `=`. Domain names use Minecraft identifier-namespace syntax, and worlds must be written as `<domain>:<world>`.
:::

Context specificity is additive. Global rules are least specific, a domain or custom selector adds one level, and a world adds two because it identifies both a domain and a loaded world. A rule with several matching selectors is therefore more specific than a rule with only one of them.

## Metadata

Metadata is typed data resolved by the same group and context model as permissions. Values can be booleans, integers, or strings.

```toml
[groups.vip]
priority = 20
inherits = []
allow = []
deny = []
metadata = [
  { key = "myplugin:homes", value = 10 },
  { key = "myplugin:homes{domain=lobby}", value = 3 },
  { key = "myplugin:chat/color", value = "gold" },
  { key = "myplugin:can_fly", value = true },
]
```

Metadata keys must be namespaced identifiers such as `myplugin:homes` or `myplugin:chat/color`. The system that owns a key decides what its value means: for example, a homes plugin could interpret these rules as a limit of 10 homes normally and 3 inside the `lobby` domain. Steel stores and resolves the values but does not implement homes, chat colors, or flight merely because these example keys exist.

Metadata resolution considers only entries with the requested exact metadata key. Among matching entries, Steel chooses:

1. The most specific context.
2. A direct player value over a group value when specificity ties.
3. The higher group priority when group values tie.
4. The last entry in the effective metadata set when everything else ties.

Unlike permissions, metadata has no allow/deny state and metadata keys do not use wildcard matching. Setting a value replaces only the entry with the same metadata key and exact context; unsetting it likewise removes only that exact entry. A global value and a contextual value for the same key can coexist.

## Conflict Resolution

When multiple rules match, Steel chooses the winning rule in this order:

1. More specific permission key wins.
2. More specific context wins.
3. Direct player overrides beat group rules when specificity ties.
4. Higher group priority wins when group rules tie.
5. Deny wins when everything else ties.

A permission that no matching rule sets is denied.

This means a specific deny can override a broad allow:

```toml
[groups.staff]
priority = 10
inherits = []
allow = ["minecraft:command.*"]
deny = ["minecraft:command.stop"]
metadata = []
```

The player can use most Minecraft commands, but not `/stop`.

## Complete Example

This configuration provides a practical starting point for a small server:

```toml
default_groups = ["all"]
op_group = "owners"
command_block_groups = ["gamemasters"]

# Plugin-provided benefits, layered on top of the default `all` group.
[groups.vip]
priority = 5
inherits = []
allow = []
deny = []
metadata = [
  { key = "example_homes:max", value = 5 },
  { key = "example_chat:color", value = "gold" },
]

# Staff role that inherits the vanilla `gamemasters` group and adds `/perms`.
[groups.staff]
priority = 10
inherits = ["gamemasters"]
allow = [
  "steel:command.perms",
]
deny = []
metadata = []
```

- Everyone receives `all`, which grants the basic vanilla commands through `#minecraft:all`.
- Assign `vip` to players who should receive plugin-provided benefits.
- Assign `staff` to staff; it receives the `gamemasters` chain plus `/perms`.
- `/op` assigns `owners`, which grants the full vanilla command set and the built-in Steel commands through its inherited collections.

The `example_homes:max` and `example_chat:color` entries are illustrative. They have an effect only when plugins or server subsystems that own those keys read them. Replace them with metadata supported by the plugins you actually install.

## Runtime Commands

Use `/perms` to inspect and edit permissions while the server is running. Its general shape is:

```text
/perms <user|group|groups|collection> ...
/perms reload
```

Start by inspecting the current configuration:

```text
/perms user <targets> info
/perms group <group> info
/perms groups list
/perms collection <collection> info
```

These commands show direct player settings, group rules and inheritance, the available groups with their `default`/`op`/`command_block` roles, and the effective contents of collections. After editing the files by hand, use `/perms reload` to reread them and refresh online players; a failed reload leaves the previous configuration active. See [Permission commands](../../commands/permissions) for every operation, required permission, and example.

## Operators

`/op <targets>` and `/deop <targets>` are backed by the permission system:

- `/op` adds the group named by `op_group` (`owners` by default).
- `/deop` removes that group.
- The `op_group` is required and cannot be deleted with `/perms`. Change it first with `/perms groups op set <group>` if you need a different one.

By default `owners` grants every vanilla command plus the built-in Steel commands through its inherited collections. It is not a blanket `*`: permissions owned by plugins, and any permission not covered by a collection or an explicit rule, must still be granted explicitly.

Targets can be online players, known offline players, or profile names the server can resolve.

## Client Command Tree

Players only receive command nodes they are allowed to use. This affects:

- visible commands in the client command tree
- tab completion
- server-side command suggestions
- the client gamemode switcher

Console and RCON bypass permission checks.
