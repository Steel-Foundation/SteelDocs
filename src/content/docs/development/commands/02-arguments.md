---
title: Command Arguments
description: How SteelMC command arguments work
---

This tutorial will teach you how argument types are defined in Steel and how to implement new argument types.

## Argument Types

Argument types are either defined by *Brigadier* or by *Minecraft*.

### From Brigadier

A few simple argument types are defined by *Brigadier*. In Steel, these are accessible via the static methods of `ArgumentType`:
- Booleans: `ArgumentType::bool()`
- Numbers:
    - Java `int`s (or Rust `i32`s): `ArgumentType::int()`
    - Java `long`s (or Rust `i64`s): `ArgumentType::long()`
    - Java `float`s (or Rust `f32`s): `ArgumentType::float()`
    - Java `double`s (or Rust `f64`s): `ArgumentType::double()`
- Strings:
    - A single, continuous string without any whitespace: `ArgumentType::word()`
    - A quoted or unquoted string: `ArgumentType::string()`
    - A greedy string that takes the rest of the command text: `ArgumentType::greedy_string()`

### From Minecraft

Most argument types used in *Minecraft* fall into this category. In Steel, these are accessible via the static methods of `SteelArgumentType`.

Here are a few common ones:
- `SteelArgumentType::players()` for selecting one or more players
- `SteelArgumentType::vec3()` for a 3D position
- `SteelArgumentType::block_pos()` for a block position

## Creating Optional Arguments

Brigadier does not have a way to declare a node as "optional". Instead, making arguments (and any node in general) optional is accomplished by providing
two or more different executors.

Say we had the `/greet` command from earlier, but we want to add an optional `"players"` argument to greet those players instead. It can be achieved in the following way:

```rust ins={4}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("greet")
        .executes(execute)
        .then(argument("players", SteelArgumentType::players()).executes(execute_with_players))
}
```

Now, we can define our new executor:

```rust
fn execute_with_players(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    let players = context.players("players")?;
    let count = i32::try_from(context.source().server().player_count())
        .map_err(|_| CommandSyntaxError::dynamic("There are too many players"))?;

    // Greet the players.
    for player in players {
        player.send_message(&TextComponent::plain("Hello!"));
    }
    context.source().send_success(
        &TextComponent::plain(format!("Sent greets to {} player(s)", count)),
        false,
    );
    // Return the player count as the result
    Ok(count)
}
```

Running `/greet` should still greet the caller just like before, whereas running `/greet <players>` *only* greets players matched by `<players>`.

:::note
Certain commands have many executors, some possibly doing very similar things, so make sure to refactor your code to use helper functions if needed.
:::

## Creating an Argument Type

If you want to implement a command where one or more of its arguments' types have not been implemented, you will need to implement those first.

Suppose we want to create the *game mode* argument type. We'll have to do a few things.

### Registering the Argument's Returned Value

The primary module for Steel arguments is located at `steel-core/src/command/execution/argument.rs`.

The return type of the argument is the type of the value a command's executor will get by getting an argument's value.
For example, for the game mode argument, this is `GameModeValue`, containing the game type we want (`GameType::Survival`, `GameType::Creative`, etc.).

First, we'll have to provide a downcast key for the type returned by our argument. This is done by making it implement the `DowncastType` trait.
The downcast ID for argument return types is in the format `steel:command/value/<id>`.

```rust
#[derive(Debug)]
pub(super) struct GameModeValue(pub(super) GameType);

unsafe impl DowncastType for GameModeValue {
    const TYPE_KEY: DowncastTypeKey = DowncastTypeKey::new("steel:command/value/game_mode");
}
```

Usually, though, this is done by using the `impl_downcast_type!` macro:

```rust
#[derive(Debug)]
pub(super) struct GameModeValue(pub(super) GameType);

impl_downcast_type!(GameModeValue, "steel:command/value/game_mode");
```

In fact, we can go a step further if the return type hasn't been implemented yet (for simple unit/tuple structs). We can use the `argument_value_wrapper!` macro.
This macro also defines the struct of the return type (`GameModeValue` in this case):

```rust
argument_value_wrapper!(GameModeValue(GameType), "steel:command/value/game_mode");
```

:::caution
Some arguments share the same return type. If the argument's returned type **already implements** `DowncastType`, you don't need to do anything.
:::

### Registering the Argument Parser

Next, we'll have to parse our argument.

The argument parser does the work of actually parsing the argument in a command. 
Just like argument return types, parsers also implement `DowncastType`, but with a different ID format: `steel:command/parser/<id>`.
For simple parsers, we can use the `unit_argument_parser!` macro:

```rust
unit_argument_parser!(
    // The parser struct (which will be created).
    GameModeParser,
    // The downcast key of the parser.
    "steel:command/parser/game_mode",
    // The return type of the parser.
    GameModeValue,
    // The parsing function. This tries to get the argument value mentioned earlier.
    parse | reader, _source | { parse_game_mode(reader).map(GameModeValue) },
    // The suggestion function. This provides a list of suggestions for our argument.
    // In our example, this gives the list of possible game modes.
    suggest | _context, builder | {
        suggest_game_modes(builder);
    },
    // The `ProtocolArgumentType` and `ProtocolSuggestionType` (if any) of our argument.
    protocol(ProtocolArgumentType::Gamemode, None)
);
```

:::note
If you need to implement the parser behavior manually, you have to make the parser implement the `SteelArgumentParser` trait.
For implementing `DowncastType`, you can either implement it manually or use the aforementioned `impl_downcast_type!` macro.
:::

### Adding the Factory Method

Finally, once the parser is done, add a factory method in `SteelArgumentType`, utilizing the `SteelArgumentType::new` method.
This function should create a new parser for each argument (if the parser is not zero-size).

```rust
pub(crate) fn game_mode() -> Self {
    Self::new(GameModeParser)
}
```

You should now be able to get the argument to work, and use it in any command you want to implement next! Here is how the game
mode argument is used in Steel's `/gamemode` command tree:

```rust {3}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("gamemode").then(
        argument("gamemode", SteelArgumentType::game_mode())
            .executes(set_own_game_mode)
            .then(argument("target", SteelArgumentType::players()).executes(set_target_game_mode)),
    )
}
```