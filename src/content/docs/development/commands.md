---
title: Command Registration
description: How SteelMC commands are built, registered, and connected to permissions.
---

SteelMC uses a Brigadier-style graph of literal and argument nodes. A separate `CommandRegistration` gives each graph a stable namespaced identity, aliases, and its permission policy.

## Command Modules

Built-in commands live in `steel-core/src/command/builtins/`. Each module exposes a registration function and builds its command graph separately:

```rust
use steel_utils::Identifier;

use super::super::{
    brigadier::{CommandNodeBuilder, CommandSyntaxError},
    execution::{
        CommandSource, SteelCommandContext, SteelCommandRuntime, literal,
    },
    registration::CommandRegistration,
};

pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::vanilla_static("example"), |_| command())
}

fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("example").executes(run)
}

fn run(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    context.source().send_success(&"Example ran".into());
    Ok(1)
}
```

Add the module and its `registration()` call to `steel-core/src/command/builtins/mod.rs`. Registration is explicit; the build script no longer discovers command modules.

The registration ID is authoritative. Its path must equal the root literal (`minecraft:example` has the root `example`), and its namespace owns the default permission.

## Building a Command Graph

Use `literal(...)` for fixed words and `argument(...)` for parsed values:

```rust
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("example")
        .then(literal("reload").executes(reload))
        .then(
            literal("inspect").then(
                argument("target", SteelArgumentType::players())
                    .executes(inspect),
            ),
        )
}
```

The most common builder methods are:

| Method | Purpose |
| --- | --- |
| `.then(child)` | Adds a child node |
| `.executes(handler)` | Adds a synchronous executor |
| `.executes_suspended(handler)` | Adds an executor that can finish asynchronously |
| `.requires(requirement)` | Replaces the node requirement |
| `.also_requires(requirement)` | Combines another requirement with the existing one |
| `.redirects(target)` | Redirects parsing without changing the source |
| `.redirects_with_modifier(...)` | Redirects with a source transformation or fork |

Executors receive `&SteelCommandContext<CommandSource>` and return `Result<i32, CommandSyntaxError>`. The integer is the command result used by features such as `/execute store` and return-value propagation.

## Arguments

Built-in Minecraft-aware parsers are exposed through `SteelArgumentType`; primitive Brigadier parsers use `ArgumentType`:

```rust
literal("rate").then(
    argument("rate", ArgumentType::float(1.0, 10_000.0))
        .executes(set_rate),
)
```

Read parsed values through typed `SteelCommandContext` helpers:

```rust
fn inspect(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    let targets = context.players("target")?;
    i32::try_from(targets.len())
        .map_err(|_| CommandSyntaxError::dynamic("Too many targets"))
}
```

Use the same argument name in the graph and accessor. Some accessors return `Option`; convert a missing value into `CommandSyntaxError` instead of assuming it exists.

Argument types provide server parsing, client parser metadata, and suggestions. Steel-owned keyed argument payloads keep custom argument values extensible without relying on Rust `TypeId` identity.

## Automatic Root Permissions

Unless overridden, a registration derives this permission from its ID:

```text
<namespace>.command.<path>
```

For example, `minecraft:give` derives `minecraft.command.give`, while `steel:fly` derives `steel.command.fly`. The root requirement controls parsing, the client command tree, and suggestions.

Unset permissions are normally denied. For a generally available command, use `.default_access()`:

```rust
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::vanilla_static("list"), |_| command())
        .default_access()
}
```

Default access allows an unset permission but still respects an explicit deny. This differs from bypassing permission checks.

Use `.permission(expression)` when a command needs a custom or compound root policy:

```rust
let permission = PermissionExpr::key(PermissionKey::parse("plugin.command.inspect")?);
CommandRegistration::new(Identifier::new_static("plugin", "inspect"), |_| command())
    .permission(permission)
```

An explicit permission expression cannot be combined with derived subcommand permissions on the same registration.

## Aliases and Collisions

The ID path is the canonical root. Add unqualified aliases with `.alias(...)`:

```rust
CommandRegistration::new(Identifier::vanilla_static("teleport"), |_| command())
    .alias("tp")
```

Both `/teleport` and `/tp` use `minecraft.command.teleport`; aliases do not create new permission keys.

Command IDs must be unique. Earlier registrations win an unqualified root or alias collision. If a command has a collision, Steel also registers its namespaced ID (for example, `/minecraft:teleport`) as a fallback. Namespaced aliases are reserved for these collision fallbacks and cannot be declared manually.

## Subcommand Permissions

Declare independently grantable literal paths on the registration:

```rust
CommandRegistration::new(Identifier::vanilla_static("tick"), |_| command())
    .subcommand_permission(["rate"])
    .subcommand_permission(["step"])
    .subcommand_permission(["freeze"])
```

This publishes `minecraft.command.tick.rate`, `minecraft.command.tick.step`, and `minecraft.command.tick.freeze`. A user may hold either the root permission or the relevant child permission. A specific child deny can override a broad root allow because each node uses a scoped permission expression.

Paths contain literal names only. Registration walks through argument nodes while matching them, so a declaration such as `["user", "info"]` can match `/perms user <targets> info`. Missing, duplicate, ambiguous, empty, or invalid paths fail dispatcher construction.

Dynamic value permissions are expressed directly when building the registration policy and checked by the executor. `/gamemode` is the built-in example: its visible root policy is an `Any` expression over scoped permissions such as `minecraft.command.gamemode.creative`, and execution checks the selected mode again.

## Permission Expressions

`PermissionExpr` composes command authorization:

| Expression | Meaning |
| --- | --- |
| `PermissionExpr::key(key)` | Checks one key |
| `PermissionExpr::scoped_key(parent, key)` | Lets the parent grant a child while preserving a more-specific child rule |
| `left & right` | Requires every expression |
| `left \| right` | Requires at least one expression |

Configuration and `/perms` rule arguments are not compound command expressions. They contain one permission key and an optional context selector, such as `minecraft.command.gamemode{domain=lobby}`.

## Validation and Discovery

`CommandDispatcherBuilder` validates and constructs the complete dispatcher atomically. It rejects invalid IDs and aliases, duplicate IDs, mismatched or non-literal roots, invalid subcommand paths, and invalid explicit permission keys. A failed build does not expose a partially registered dispatcher.

The builder also collects root and subcommand permission keys for `/perms` suggestions. Register non-command permissions explicitly with `declare_permission(...)` when they should be discoverable.

The filtered graph is used consistently for parsing, the client command tree, and server suggestions. Nodes whose authorization requirements fail are omitted. Permission context comes from the command source, including its world and domain; console and RCON sources bypass player permission rules.
