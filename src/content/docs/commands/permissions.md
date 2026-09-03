---
title: Permission Commands
description: Inspect and manage SteelMC permissions, groups, inheritance, and metadata with /perms.
sidebar:
  order: 2
---

`/perms` manages permissions while the server is running. It has three scopes:

```text
/perms user <targets> <operation>
/perms group <group> <operation>
/perms groups <operation>
```

- `user` manages direct player overrides and group assignments.
- `group` manages one named group's rules, priority, inheritance, and metadata.
- `groups` lists groups and manages which groups every player receives by default.

This reference assumes familiarity with permission keys, wildcards, groups, and contexts. Start with [Permission configuration](../../configuration/permissions) if those concepts are new to you.

:::tip
Inspect a player or group before editing it. Direct rules, inherited rules, contextual rules, and group priority can make the effective result different from a single configuration entry.
:::

## How Authorization Works

Every operation has a granular command permission. For example, player inspection requires `steel.command.perms.user.info`. The root `steel.command.perms` permission grants every `/perms` operation unless a more specific operation is denied.

Changing or displaying managed data may require additional authority:

| Authority | Purpose |
| --- | --- |
| `steel.permission.manage.<permission>` | Inspect, check, or change rules for that permission key |
| `steel.permission.group.<group>` | Inspect, assign, or change that group |
| `steel.permission.metadata` | Display, check, or change permission metadata |

Wildcards can grant a range of authority. For example, `steel.permission.manage.minecraft.command.*` permits management of descendant keys such as `minecraft.command.give`, while `steel.permission.manage.*` permits management of every permission key. Similarly, `steel.permission.group.*` permits management of every group.

Information commands filter their output to the sender's authority. For example, user info omits metadata without `steel.permission.metadata` and omits rules or groups the sender cannot manage.

Console and RCON bypass these player permission checks.

## Inspect Current Settings

These are the best commands to run before making changes.

### Inspect a player

```text
/perms user <targets> info
```

Shows each target's assigned groups, direct permission rules, and direct metadata overrides. This reports stored player settings, not every inherited effective rule.

Command permission: `steel.command.perms.user.info`

The output is filtered by the sender's permission-management, group-management, and metadata authority.

```text
/perms user Steve info
```

### Check a player's effective permission

```text
/perms user <targets> check <permission_expr>
```

Resolves the permission for each target, including default groups, assigned groups, direct overrides, inheritance, priority, and context. The result identifies the winning rule and its source, or reports that the permission is unset.

Command permission: `steel.command.perms.user.check`

Additional authority: `steel.permission.manage.<permission>` for the checked key.

```text
/perms user Steve check minecraft.command.gamemode.creative
/perms user Steve check minecraft.command.gamemode{domain=lobby}
```

### Inspect a group

```text
/perms group <group> info
```

Shows the group's priority, parent groups, allow rules, deny rules, and metadata. Entries outside the sender's management authority are omitted.

Command permission: `steel.command.perms.group.info`

Additional authority: `steel.permission.group.<group>`. Metadata also requires `steel.permission.metadata`; individual permission rules require matching `steel.permission.manage.<permission>` authority.

```text
/perms group moderator info
```

### List groups

```text
/perms groups list
```

Lists the groups the sender has authority to manage and indicates which are default groups.

Command permission: `steel.command.perms.groups.list`

Only groups covered by the sender's `steel.permission.group.<group>` authority are shown.

## Manage Player Permission Rules

A permission expression is a permission key with an optional context selector:

```text
<permission>{<context>=<value>,...}
```

See [Contextual rules](../../configuration/permissions#contextual-rules) for the complete syntax and resolution behavior.

### Allow a permission

```text
/perms user <targets> allow <permission_expr>
```

Adds or replaces the exact direct rule with an allow. Other contexts for the same permission remain unchanged.

Command permission: `steel.command.perms.user.allow`

Additional authority: `steel.permission.manage.<permission>`.

```text
/perms user Steve allow minecraft.command.teleport
/perms user Steve allow minecraft.command.gamemode{domain=lobby}
```

### Deny a permission

```text
/perms user <targets> deny <permission_expr>
```

Adds or replaces the exact direct rule with a deny. A specific deny can override a broader allow.

Command permission: `steel.command.perms.user.deny`

Additional authority: `steel.permission.manage.<permission>`.

```text
/perms user Steve deny minecraft.command.gamemode.creative
```

### Remove a direct rule

```text
/perms user <targets> unset <permission_expr>
```

Removes only the direct rule with the same permission key and exact context. Rules inherited from groups are not removed.

Command permission: `steel.command.perms.user.unset`

Additional authority: `steel.permission.manage.<permission>`.

```text
/perms user Steve unset minecraft.command.gamemode{domain=lobby}
```

## Assign Player Groups

### Add a group

```text
/perms user <targets> group add <group>
```

Assigns the group to each target. Assigning an already present group makes no change.

Command permission: `steel.command.perms.user.group.add`

Additional authority: `steel.permission.group.<group>`.

```text
/perms user Steve group add moderator
```

### Remove a group

```text
/perms user <targets> group remove <group>
```

Removes the assigned group from each target. This does not remove a group received through `default_groups` or inheritance.

Command permission: `steel.command.perms.user.group.remove`

Additional authority: `steel.permission.group.<group>`.

```text
/perms user Steve group remove moderator
```

## Manage Groups

### Create or delete a group

```text
/perms group <group> create
/perms group <group> delete
```

`create` adds an empty group. `delete` removes the group from the group configuration. Steel rejects deletion if the group is `op`, is still a default, or is inherited by another group; remove those references first.

Command permissions: `steel.command.perms.group.create` and `steel.command.perms.group.delete`.

Additional authority: `steel.permission.group.<group>`.

```text
/perms group moderator create
/perms group retired-staff delete
```

### Allow, deny, or unset a group rule

```text
/perms group <group> allow <permission_expr>
/perms group <group> deny <permission_expr>
/perms group <group> unset <permission_expr>
```

`allow` and `deny` add or replace the exact group rule. `unset` removes only the rule with the same permission key and exact context.

Command permissions:

- `steel.command.perms.group.allow`
- `steel.command.perms.group.deny`
- `steel.command.perms.group.unset`

Additional authority: both `steel.permission.group.<group>` and `steel.permission.manage.<permission>`.

```text
/perms group moderator allow minecraft.command.teleport
/perms group moderator deny minecraft.command.stop
/perms group moderator unset minecraft.command.teleport
```

### Change group priority

```text
/perms group <group> priority <priority>
```

Sets the signed 32-bit priority used when equally specific rules from different groups conflict. Higher priority wins; specificity still takes precedence over priority.

Command permission: `steel.command.perms.group.priority`

Additional authority: `steel.permission.group.<group>`.

```text
/perms group moderator priority 10
```

## Manage Group Inheritance

### List parent groups

```text
/perms group <group> inherit list
```

Lists the group's direct parents. Parent entries outside the sender's group-management authority are omitted.

Command permission: `steel.command.perms.group.inherit.list`

Additional authority: `steel.permission.group.<group>`.

```text
/perms group moderator inherit list
```

### Add or remove a parent

```text
/perms group <group> inherit add <parent>
/perms group <group> inherit remove <parent>
```

Adds or removes a direct inheritance relationship. Adding a relationship that would create a cycle is rejected. Inherited rules keep the priority of the group where they were defined.

Command permissions: `steel.command.perms.group.inherit.add` and `steel.command.perms.group.inherit.remove`.

Additional authority: `steel.permission.group.<group>` and `steel.permission.group.<parent>`.

```text
/perms group moderator inherit add helper
/perms group moderator inherit remove helper
```

## Manage Metadata

Metadata expressions use a namespaced key and the same optional context syntax as permission expressions:

```text
<namespace>:<key>{<context>=<value>,...}
```

Values are explicitly typed as `int`, `bool`, or `string`. See [Metadata](../../configuration/permissions#metadata) for resolution rules.

Quote string values that contain spaces:

```text
/perms user Steve metadata set string "Senior Builder" plugin:rank
```

### Set player metadata

```text
/perms user <targets> metadata set int <value> <metadata_expr>
/perms user <targets> metadata set bool <value> <metadata_expr>
/perms user <targets> metadata set string <value> <metadata_expr>
```

Sets a direct metadata override for each target. It replaces only the value with the same metadata key and exact context.

Command permission: `steel.command.perms.user.metadata.set`

Additional authority: `steel.permission.metadata`.

```text
/perms user Steve metadata set int 5 plugin:max_homes
/perms user Steve metadata set string gold plugin:chat/color{domain=lobby}
```

### Check player metadata

```text
/perms user <targets> metadata check <metadata_expr>
```

Resolves the effective value for each target at the requested context and reports the winning source. This includes group metadata and direct overrides.

Command permission: `steel.command.perms.user.metadata.check`

Additional authority: `steel.permission.metadata`.

```text
/perms user Steve metadata check plugin:max_homes{world=survival:overworld}
```

### Remove player metadata

```text
/perms user <targets> metadata unset <metadata_expr>
```

Removes only the direct metadata entry with the same key and exact context. Inherited group metadata remains unchanged.

Command permission: `steel.command.perms.user.metadata.unset`

Additional authority: `steel.permission.metadata`.

```text
/perms user Steve metadata unset plugin:max_homes
```

### Set or remove group metadata

```text
/perms group <group> metadata set int <value> <metadata_expr>
/perms group <group> metadata set bool <value> <metadata_expr>
/perms group <group> metadata set string <value> <metadata_expr>
/perms group <group> metadata unset <metadata_expr>
```

Sets or removes an exact metadata entry on the group. Use `/perms group <group> info` to inspect configured group metadata; there is no separate group metadata `check` operation.

Command permissions: `steel.command.perms.group.metadata.set` and `steel.command.perms.group.metadata.unset`.

Additional authority: `steel.permission.group.<group>` and `steel.permission.metadata`.

```text
/perms group vip metadata set int 10 plugin:max_homes
/perms group vip metadata unset plugin:max_homes
```

## Manage Default Groups

```text
/perms groups default add <group>
/perms groups default remove <group>
```

Adds or removes a group from `default_groups`. Default groups contribute to every player's effective permissions and metadata. Removing a default does not delete the group.

Command permissions: `steel.command.perms.groups.default.add` and `steel.command.perms.groups.default.remove`.

Additional authority: `steel.permission.group.<group>`.

```text
/perms groups default add member
/perms groups default remove member
```

## Persistence and Offline Players

Group operations update `config/groups.toml`. Player operations update `<save_root>/global/player_permissions.toml` and can resolve online players, known offline players, or profile names available through the server's profile lookup.

These operations run without blocking the server tick. Command execution remains suspended until an operation finishes, then the sender receives its result and feedback.
