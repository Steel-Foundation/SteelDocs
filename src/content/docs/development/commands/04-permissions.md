---
title: Command Permissions
description: How SteelMC commands are built and registered.
---

This tutorial will teach you how permissions are defined and how to create custom permissions.

## Permissions

By default, a registration derives this permission from its ID, which is defined as `<namespace>.command.<path>`.

For example, `minecraft:give` uses `minecraft.command.give`, while `steel:fly` uses `steel.command.fly`.

The permission for a command can be modified in the command registration function.

### Using a Permission Expression

By default, permissions are denied. To allow a command to be used by anyone, use the `default_access()` method:

```rust ins={3}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::new("example", "example"), |_| command())
        .default_access()
}
```

:::note
Although `default_access()` allows unset permissions, it still denies explicitly set ones.
:::

For a custom permission expression, use the `permission` method:

```rust ins={2,3,5}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    // Creates a specific permission expression with a custom permission key.
    let permission = PermissionExpr::key(PermissionKey::parse("example.command.custom")?);
    CommandRegistration::new(Identifier::new("example", "example"), |_| command())
        .permission(permission)
}
```

:::note
You can also use `PermissionExpr::scoped_key(parent, key)` for a permission of `key`. It is automatically granted if `parent` is granted,
but only if no specific permission is set for `key`.
:::

A custom expression will completely override the derived permissions, so they cannot be mixed together.

### Subcommand Permissions

Use the `subcommand_permission` method to define specific subcommand permissions. They must match the literal nodes for the corresponding subcommands:

```rust ins={3,4,5}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
        CommandRegistration::new(Identifier::vanilla_static("tick"), |_| command())
            .subcommand_permission(["rate"])
            .subcommand_permission(["step"])
            .subcommand_permission(["freeze"])
}
```

The above defines the permissions `minecraft.command.tick.rate`, `minecraft.command.tick.step`, and `minecraft.command.tick.freeze`. **A user may either have the root permission or the relevant child permission to be able to use the command.**

:::note
If a child permission is denied, it takes over the parent one. In other words, if a subcommand permission is denied while the main command permission is allowed,
the command will still be denied for the user.
:::

### Compound Permission Expressions

Compound `PermissionExpr`s can also be written.

There are two operators defined for these expressions. These are:
- The `&` (bitwise AND) operator to combine two different permissions, where both are required.
- The `|` (bitwise OR) operator to combine two different permissions, where either is required.

Here's an example:

```rust ins={2,3,4,6}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    // This permission requires both example.command.example.a and example.command.example.b.
    let permission = PermissionExpr::key(PermissionKey::parse("example.command.example.a")?) &
        PermissionExpr::key(PermissionKey::parse("example.command.example.b")?);
    CommandRegistration::new(Identifier::new("example", "example"), |_| command())
        .permission(permission)
}
```

:::note
Permission expressions in rule arguments in the server configuration and in the `/perms` command are not compound expressions. Instead, they contain one permission key and an optional *context selector*, like `minecraft.command.gamemode{domain=lobby}`.
:::