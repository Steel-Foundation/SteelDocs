---
title: Permission Configuration
description: Configure command permissions, groups, player overrides, and permission metadata in SteelMC.
sidebar:
  order: 4
---

SteelMC permissions are configured through `config/groups.toml` and can also be edited at runtime with `/steelperms` or its alias `/sp`.

Permissions control command access, command suggestions, and the command tree sent to each client. The same system also supports contextual rules and typed metadata values for server features and plugins.

## Files

Steel uses two permission files:

| File | Purpose |
| ---- | ------- |
| `config/groups.toml` | Server-wide permission groups and default groups |
| `<save_root>/global/player_permissions.toml` | Per-player assigned groups, direct overrides, and metadata |

Edit `groups.toml` for normal server policy. The player permissions file is under the configured world `save_path`, which defaults to `saves`. It is managed by Steel and `/steelperms`; manual edits should only be needed for recovery or bulk migration while the server is offline.

## Default Groups

A new server creates this basic group configuration:

```toml
default_groups = ["default"]

[groups.default]
priority = 0
allow = []
deny = []
metadata = []

[groups.op]
priority = 0
allow = ["*"]
deny = []
metadata = []
```

Every player receives all groups listed in `default_groups`. The `op` group is required, grants `*` by default, and is what `/op` assigns.

:::caution
Do not put `op` in `default_groups` unless every player should have every permission.
:::

## Permission Keys

Permission keys are dotted lowercase strings:

```text
minecraft.command.give
steel.command.fly
plugin.region.build
```

Segments can contain lowercase ASCII letters, digits, `_`, and `-`. Empty segments and uppercase letters are invalid.

Wildcards are allowed only as the final segment:

| Key | Meaning |
| --- | ------- |
| `*` | Matches every permission |
| `minecraft.command.*` | Matches descendants such as `minecraft.command.give` |
| `minecraft.command.give` | Matches only that exact key |

`minecraft.command.*` matches `minecraft.command.give`, but it does not match `minecraft.command` itself.

## Command Permissions

Most built-in commands automatically use this permission shape:

```text
<namespace>.command.<command>
```

Examples:

| Command | Permission |
| ------- | ---------- |
| `/give` | `minecraft.command.give` |
| `/fly` | `steel.command.fly` |
| `/tp` and `/teleport` | `minecraft.command.teleport` |
| `/xp` and `/experience` | `minecraft.command.experience` |
| `/steelperms` and `/sp` | `steel.command.steelperms` |

Public commands, such as `/list`, do not require a permission.

Some commands expose narrower subcommand or value permissions. For example, `/tick freeze` can be granted with either `minecraft.command.tick` or `minecraft.command.tick.freeze`.

`/gamemode` has value-specific permissions:

| Action | Permission |
| ------ | ---------- |
| Any gamemode change | `minecraft.command.gamemode` |
| Survival only | `minecraft.command.gamemode.survival` |
| Creative only | `minecraft.command.gamemode.creative` |
| Adventure only | `minecraft.command.gamemode.adventure` |
| Spectator only | `minecraft.command.gamemode.spectator` |

A broader permission grants the child action, but a more specific deny can override it. For example, allow `minecraft.command.gamemode` and deny `minecraft.command.gamemode.creative` to allow all gamemode changes except creative.

## Group Configuration

Groups are tables under `[groups.<name>]`.

```toml
[groups.moderator]
priority = 10
allow = [
  "minecraft.command.kick",
  "minecraft.command.ban",
  "minecraft.command.gamemode.spectator",
]
deny = [
  "minecraft.command.stop",
]
metadata = []
```

Group names must be valid permission segments: lowercase letters, digits, `_`, and `-`.

### Contextual Rules

Permission and metadata rules can include context selectors:

```toml
[groups.builder]
priority = 5
allow = [
  "plugin.region.build{world=lobby:spawn,plugin:region=market}",
  "minecraft.command.gamemode{domain=lobby}",
]
deny = [
  "minecraft.command.gamemode.creative{world=lobby:spawn}",
]
metadata = [
  { key = "plugin:homes{domain=lobby}", value = 3 },
]
```

Built-in context keys:

| Context | Example | Meaning |
| ------- | ------- | ------- |
| `domain` | `domain=lobby` | Applies only inside one [domain](../../reference/terminology#domain) |
| `world` | `world=lobby:spawn` | Applies only inside one loaded [world](../../reference/terminology#world) |

Custom contexts can be provided by plugins or server subsystems. Unqualified keys such as `region=spawn` are valid, but namespaced keys such as `plugin:region=spawn` are preferred for plugin-owned contexts.

Multiple selectors are combined with AND:

```text
plugin.region.build{world=lobby:spawn,plugin:region=market}
```

Context values cannot be empty and cannot contain whitespace, `{`, `}`, `,`, or `=`.

## Metadata

Metadata is typed data resolved by the same group and context model as permissions. Values can be booleans, integers, or strings.

```toml
[groups.vip]
priority = 20
allow = []
deny = []
metadata = [
  { key = "plugin:homes", value = 10 },
  { key = "plugin:chat/color", value = "gold" },
  { key = "plugin:can_fly", value = true },
]
```

Metadata keys must be namespaced identifiers such as `plugin:homes` or `plugin:chat/color`.

## Conflict Resolution

Unset permissions are denied. When multiple rules match, Steel chooses the winning rule in this order:

1. More specific permission key wins.
2. More specific context wins.
3. Direct player overrides beat group rules when specificity ties.
4. Higher group priority wins when group rules tie.
5. Deny wins when everything else ties.

This means a specific deny can override a broad allow:

```toml
[groups.staff]
priority = 10
allow = ["minecraft.command.*"]
deny = ["minecraft.command.stop"]
metadata = []
```

The player can use most Minecraft commands, but not `/stop`.

## Runtime Commands

Use `/steelperms` or `/sp` to inspect and edit permissions while the server is running. The root permission is `steel.command.steelperms`.

Useful commands:

```text
/steelperms user <targets> info
/steelperms user <targets> check <permission_expr>
/steelperms user <targets> allow <permission_expr>
/steelperms user <targets> deny <permission_expr>
/steelperms user <targets> unset <permission_expr>

/steelperms user <targets> group add <group>
/steelperms user <targets> group remove <group>

/steelperms group <group> create
/steelperms group <group> info
/steelperms group <group> allow <permission_expr>
/steelperms group <group> deny <permission_expr>
/steelperms group <group> unset <permission_expr>
/steelperms group <group> priority <priority>

/steelperms groups list
/steelperms groups default add <group>
/steelperms groups default remove <group>
```

Metadata can also be edited:

```text
/steelperms user <targets> metadata set int <value> <metadata_expr>
/steelperms user <targets> metadata set bool <value> <metadata_expr>
/steelperms user <targets> metadata set string <value> <metadata_expr>
/steelperms user <targets> metadata check <metadata_expr>
/steelperms user <targets> metadata unset <metadata_expr>

/steelperms group <group> metadata set int <value> <metadata_expr>
/steelperms group <group> metadata set bool <value> <metadata_expr>
/steelperms group <group> metadata set string <value> <metadata_expr>
/steelperms group <group> metadata unset <metadata_expr>
```

`<permission_expr>` is a permission key plus an optional context selector, such as:

```text
minecraft.command.gamemode{domain=lobby}
```

`<metadata_expr>` uses the same context selector syntax:

```text
plugin:homes{world=survival:overworld}
```

Some operations that touch offline players or persist group file changes run in the background. The command sender receives the immediate result first, then a later message when background work completes.

## Operators

`/op <targets>` and `/deop <targets>` are backed by the permission system:

- `/op` adds the `op` group.
- `/deop` removes the `op` group.
- The default `op` group grants `*`.
- The `op` group is required and cannot be deleted with `/steelperms`.

Targets can be online players, known offline players, or profile names the server can resolve.

## Client Command Tree

Players only receive command nodes they are allowed to use. This affects:

- visible commands in the client command tree
- tab completion
- server-side command suggestions
- the client gamemode switcher

Console and RCON bypass permission checks.
