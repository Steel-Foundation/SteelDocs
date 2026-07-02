---
title: Command Registration
description: How SteelMC commands are built, registered, and connected to permissions.
---

SteelMC commands are built as a graph of literal and argument nodes. The command registration step attaches root permissions, resolves subcommand permissions, registers aliases, validates ambiguity, and publishes command permissions for suggestions.

## Command Modules

Built-in commands live in `steel-core/src/command/commands/*.rs`.

A built-in command module is registered automatically when it exposes both:

```rust
pub(crate) const REGISTRATION: CommandRegistrationSpec = CommandRegistrationSpec::minecraft();

pub(crate) fn command() -> CommandNodeBuilder {
    literal("example")
}
```

The build script scans the command directory and generates the built-in command registration list. Modules without both items are ignored or rejected by the build script.

Use the registration namespace that owns the command:

```rust
pub(crate) const REGISTRATION: CommandRegistrationSpec = CommandRegistrationSpec::minecraft();
pub(crate) const REGISTRATION: CommandRegistrationSpec = CommandRegistrationSpec::steel();
```

## Building a Command Tree

Use `literal(...)` for fixed command words and `argument(...)` for parsed values:

```rust
use crate::command::graph::{
    CommandNodeBuilder, CommandResult, ParsedArguments, argument, literal,
};
use crate::command::parsers::PlayerParser;

pub(crate) fn command() -> CommandNodeBuilder {
    literal("example")
        .then(literal("reload").executes(reload))
        .then(
            literal("inspect")
                .then(argument("target", PlayerParser::one()).executes(inspect)),
        )
}
```

Common builder methods:

| Method | Purpose |
| ------ | ------- |
| `.then(child)` | Add one child node |
| `.then_all(children)` | Add several child nodes |
| `.executes(handler)` | Mark a node executable |
| `.requires(requirement)` | Add a source or permission requirement |
| `.requires_permission(key)` | Require one permission key |
| `.requires_permission_expr(expr)` | Require a composed permission expression |
| `.redirects(...)` | Redirect command execution |
| `.redirects_returning(...)` | Redirect and return the redirected result |
| `.forks(...)` | Fork execution to multiple command contexts |

Executors receive `&mut CommandContext` and `&ParsedArguments`, and return `Result<CommandResult, CommandError>`.

## Parsed Arguments

Argument parsers store typed values in `ParsedArguments`. Read values by the argument name used in the tree:

```rust
fn inspect(
    context: &mut CommandContext,
    arguments: &ParsedArguments,
) -> Result<CommandResult, CommandError> {
    let targets = resolve_required_player_targets(arguments, "target", context)?;

    Ok(CommandResult::from_usize_success_count(targets.len()))
}
```

For simple typed arguments, use `arguments.get::<T>("name")` and convert parser errors with the local command helper:

```rust
let rate = arguments
    .get::<f32>("rate")
    .map_err(super::invalid_parsed_argument)?;
```

Parsers provide server parsing, client parser metadata, examples for ambiguity checks, and suggestions. The server parser can be stricter than the client metadata when the Minecraft client does not have a matching native parser.

## Automatic Root Permissions

Commands receive a root permission unless the registration is public:

```text
<namespace>.command.<root>
```

Examples:

| Registration | Root literal | Permission |
| ------------ | ------------ | ---------- |
| `CommandRegistrationSpec::minecraft()` | `give` | `minecraft.command.give` |
| `CommandRegistrationSpec::steel()` | `fly` | `steel.command.fly` |

The root permission gates parsing, suggestions, and the command tree sent to players. Console and RCON pass permission requirements automatically.

Use `.public()` for commands that should not require a permission:

```rust
pub(crate) const REGISTRATION: CommandRegistrationSpec =
    CommandRegistrationSpec::minecraft().public();
```

## Aliases and Permission Bases

Aliases register extra root literals for the same command graph:

```rust
pub(crate) const REGISTRATION: CommandRegistrationSpec =
    CommandRegistrationSpec::minecraft()
        .permission_base("teleport")
        .aliases(&["teleport"]);

pub(crate) fn command() -> CommandNodeBuilder {
    literal("tp")
}
```

This makes `/tp` and `/teleport` use `minecraft.command.teleport`.

Use `.permission_base("name")` when the root literal should not become the permission segment. This is required for aliases like `/tp` where the canonical permission should be `teleport`.

Alias names are validated as command literals. The permission base is validated as a permission segment.

## Subcommand Permissions

Use `.requires_subcommand_permission()` on a non-root literal when a subcommand can be granted independently from the root command:

```rust
pub(crate) fn command() -> CommandNodeBuilder {
    literal("tick")
        .then(literal("query").executes(query_tick))
        .then(
            literal("freeze")
                .requires_subcommand_permission()
                .executes(freeze_tick),
        )
}
```

For a Minecraft command rooted at `/tick`, this derives:

```text
minecraft.command.tick.freeze
```

The user may hold either `minecraft.command.tick` or `minecraft.command.tick.freeze`. Holding only the child permission exposes the root command enough to reach that child.

Use `.requires_additional_subcommand_permission()` when the user must hold both the root command permission and the derived child permission:

```rust
literal("delete")
    .requires_additional_subcommand_permission()
    .executes(delete_group)
```

This is useful for sensitive actions inside a broader command family.

Use `.permission_path_passthrough()` for syntax-only literals that should not appear in derived permission keys.

## Dynamic Argument Permissions

Some commands derive a permission segment from a parsed argument value. `/gamemode` is the current built-in example:

```rust
pub(crate) fn command() -> CommandNodeBuilder {
    literal("gamemode").then(
        argument("gamemode", GameModeParser)
            .requires_argument_permission::<GameType>("gamemode")
            .executes(set_own_game_mode),
    )
}
```

`GameType` implements `CommandPermissionArgument`, so these value permissions are available:

```text
minecraft.command.gamemode.survival
minecraft.command.gamemode.creative
minecraft.command.gamemode.adventure
minecraft.command.gamemode.spectator
```

The root permission `minecraft.command.gamemode` grants all values, but a more specific value rule can override it. Suggestions are filtered the same way, so a player with only `minecraft.command.gamemode.survival` only sees `survival`.

When adding a dynamic permission argument:

1. Implement `CommandPermissionArgument` for the parsed value type.
2. Convert the parsed value into one `PermissionSegment`.
3. Return all possible segments from `catalog_permission_segments()`.
4. Use `.requires_argument_permission::<T>("argument_name")` after the matching argument node.

The catalog must be finite so Steel can publish child permissions for suggestions and management tools.

## Permission Expressions

Command requirements can use `PermissionExpr` directly for compound checks:

```rust
let root = PermissionKey::parse("minecraft.command.gamemode")?;
let creative = PermissionKey::parse("minecraft.command.gamemode.creative")?;

let permission = PermissionExpr::scoped_key(root, creative);
```

`PermissionExpr` supports:

| Expression | Meaning |
| ---------- | ------- |
| `PermissionExpr::key(key)` | Require one key |
| `PermissionExpr::scoped_key(parent, key)` | Parent grants the child unless a more specific child rule overrides it |
| `left & right` | Require all child expressions |
| `left | right` | Require at least one child expression |

This expression model is for command requirements. Group config and `/steelperms` rule strings use a single key plus optional context selector, such as `minecraft.command.gamemode{domain=lobby}`.

## Registration Validation

Normal command registration resolves derived and dynamic permission markers. Calling `.build()` directly on a tree that still contains those markers fails.

Registration also validates the command graph before committing it:

- root commands must be literal nodes
- aliases must be valid command literal names
- permission bases must be valid permission segments
- terminal arguments cannot have children or redirects
- ambiguous child parsers are rejected
- failed alias registration does not leave the primary root registered

## Client Command Tree and Suggestions

`CommandDispatcher` builds a filtered command tree for each player. Nodes whose requirements fail are omitted, and permission-backed nodes are marked with the protocol restricted flag.

The same graph and requirements are used for parsing and suggestions. This means command permissions affect:

- whether a player can run the command
- which command nodes the client sees
- tab completion
- server-side suggestions
- value suggestions for dynamic permissions

The permission context is captured from the command source at command start. Later `/execute` changes to world, entity, or position do not change the permission authority for that command.
