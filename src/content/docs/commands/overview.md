---
title: Command Reference
description: Conventions and detailed references for SteelMC commands.
sidebar:
  order: 1
---

This section documents SteelMC command families that need more than a short syntax list. Each reference explains what an operation changes, which permissions it requires, and how to use it safely.

## Reading Command Syntax

Command references use angle brackets for values you must provide:

```text
/command <required_value>
```

Do not type the brackets. For example, `/perms group <group> info` becomes:

```text
/perms group moderator info
```

Player target arguments can accept a player name or a compatible Minecraft target selector. Commands that use profile targets can also resolve known offline players.

## Permissions

Most commands derive a permission from their namespaced command ID:

```text
<namespace>.command.<command>
```

Some command families publish more specific permissions for individual operations. The root permission grants those operations unless a more specific rule denies one. Console and RCON bypass player permission checks.

For details about permission keys, groups, contexts, and conflict resolution, see [Permission configuration](../../configuration/permissions).

## Available References

- [Permission commands](../permissions) — inspect and manage player rules, groups, inheritance, defaults, and metadata with `/perms`
