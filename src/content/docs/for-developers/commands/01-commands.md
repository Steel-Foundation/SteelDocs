---
title: Creating Commands
description: How permissions are defined and created
---

This tutorial will teach you how commands are structured and registered.

## Creating a Simple Command

A command is composed of its registration and a *command tree*. The methods used here will be similar to what *Brigadier*, a Mojang library for *Minecraft* commands, has.

### Registration

The built-in commands are located in `steel-core/src/command/builtins/`.

Let's start creating a command called `/greet` that greets the caller. In our `steel-core/src/command/builtins/greet.rs` module, we create the so-called `registration` function:

```rust
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::new("example", "greet"), |_| command())
}
```

The `new()` method of the `CommandRegistration` struct takes:
- an [identifier](../../../reference/terminology#identifier). It acts as the unique ID of the command.
- a function that will provide the *command tree* (or *command graph*) for the command.

:::note
For implementing a Vanilla command, an identifier with the `minecraft` namespace is used. The `Identifier::vanilla_static()` method can be used for this case.
:::

However, Steel does not know about this command because we didn't register it yet.
To register this new command, the module and its `registration()` function can be added to `steel-core/src/command/builtins/mod.rs`. The registration function is then called in the `create_registered_dispatcher()` function in that module:

```rust
pub(crate) fn create_registered_dispatcher(
    extension_commands: CommandRegistry,
) -> Result<RegisteredCommandDispatcher<CommandSource>, CommandRegistrationError> {
    let mut builder = CommandDispatcherBuilder::new();
    builder.declare_permission(ENTITY_SELECTOR_PERMISSION_KEY)?;
    builder.declare_permission(ENTITY_SELECTOR_ADVANCED_PERMISSION_KEY)?;
    builder.declare_permission(perms::MANAGE_ALL_PERMISSION)?;
    builder.declare_permission(perms::GROUP_ALL_PERMISSION)?;
    builder.declare_permission(perms::METADATA_PERMISSION)?;
    // other commands...
    builder.register(greet::registration())?;
    //
    builder.extend(extension_commands.into_inner())?;
    builder.build_with_permissions()
}
```

### Building the Command Tree

Command trees are built using *nodes*. There are two types of nodes:
- *literal* nodes (for keyword-like syntax), made using `literal()`
- *argument* nodes (for parsed parameters), made using `argument()`

Child nodes can be attached to nodes to provide the next part of the command's syntax.

Let's make the command tree for our command. We start with a literal node with the command's name, like so:

```rust
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("greet")
}
```

That's right! The command itself is actually just a literal node. This node can also be called the command's *root node* because it's the very first node of the command. We can then use the `executes()` method to provide an executor for our node. It also marks *the end* of a parsed command (starting from the root node):

```rust ins={3,5,6,7,8,9,10,11,12,13}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("greet")
        .executes(execute)
}

fn execute(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    // Greet the caller. This can be the server, or a player.
    context.source().send_success(&TextComponent::plain("Hello!"), false);
    // This command is always successful.
    Ok(1)
}
```

The executors are just functions that take in a `&SteelCommandContext<CommandSource>`, which gives us the necessary context to perform the command.
They return a number if successful, or a command error if not.

:::note
For vanilla commands, make sure to check the [Minecraft Wiki](https://minecraft.wiki/)'s specific command outputs to accurately implement the command's success or error outputs.

For example, if you're implementing `/advancement`, check https://minecraft.wiki/w/Commands/advancement#Output.
:::

### Testing

If you start the server, the command should be registered and available in-game! Now, you can run `/greet`, and it should greet you.

## Creating a More Complex Command

Let's create a more complex command, one called `/player`. We want to create the two following subcommands:
- `/player count` to display the number of players in the server.
- `/player find <username>` to display whether a player with the username `<username>` is online in the server.

### Registration

First, we can register our command and add it to `mod.rs`, similar to what we did before:

```rust
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::new("example", "player"), |_| command())
}
```

Let's start with the subcommand `count` (with no arguments). Adding child nodes is accomplished by calling `then()` on the parent node:

```rust ins={3}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("player")
        .then(literal("count"))
}
```

### Building the Command Tree

Now, let's add our executor for the `count` subcommand. The tree says that after the `player` literal node is specified,
the `count` literal node must be specified in order to trigger the `count` executor:

```rust ins={5,8,9,10,11,12,13,14,15,16,17,18,19,20,21}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("player")
        .then(
            literal("count")
                .executes(count)
        )
}

fn count(context: &SteelCommandContext<CommandSource>) -> Result<i32, CommandSyntaxError> {
    // Return the number of players in the server.
    let count = i32::try_from(context.source().server().player_count())
        .map_err(|_| CommandSyntaxError::dynamic("There are too many players"))?;

    context.source().send_success(
        &TextComponent::plain(format!("Players in the server: {count}")),
        false,
    );

    // Return our count as the result.
    Ok(count)
}
```

:::caution
Be careful with the placement of the node functions. While the above correctly allows `/player count`, writing a tree like

```rust
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("player")
        .then(literal("count"))
        .executes(count)
}
```
results in `/player` being valid syntax instead (because `executes()` is called on the `player` literal command node).

:::

If we op ourselves and run `/player count` after running a Steel server alone, we should get this:

![Running `/player count`](../../../../assets/commands/complex_command_1.png)

Running just `/player` should give us an error:

![Running `/player`](../../../../assets/commands/complex_command_2.png)

:::note
To make our command executable by anyone, we could use the `default_access()` method during the command's registration:

```rust ins={3}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::new("example", "player"), |_| command())
        .default_access()
}
```

Permissions are explained in greated detail in [Command Permissions](../04-permissions).
:::

Let's add the other subcommand called `find`, this time adding a string *word* argument. This time, we add an argument node after our subcommand node:

```rust ins={4,5,6,7}
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("player")
        .then(literal("count"))
        .then(
            literal("find")
                .then(argument("username", ArgumentType::word()).executes(find))
        )
}
```

Now, the tree says that after the `player` literal node is specified, one of these two have to be specified after:
- `count`, with no other nodes after; and
- `find`, requiring a `username` argument after it.

:::note
There are many types of arguments, which are covered in [Command Arguments](../02-arguments). Here, we use the `word()` argument type to specify a string argument
that stops at a whitespace character.
::::

Finally, we'll add the executor itself:

```rust
fn find(context: &SteelCommandContext<CommandSource>) -> Result<i32, CommandSyntaxError> {
    let players = context.source().server().get_players();
    // Resolve our username argument.
    let username = context.string("username")?;

    if players
        .into_iter()
        .any(|player| player.plain_text_name() == username)
    {
        // There is a player with the username.
        context.source().send_success(
            &TextComponent::plain(format!("Player {username} is on the server")),
            false,
        );
        Ok(1)
    } else {
        // There is no player with the username.
        Err(CommandSyntaxError::dynamic(format!(
            "Player {username} was not found"
        )))
    }
}
```

### Testing

Now, if you run `/player find <your_username>`, you should get something similar to this:

![Running `/player find <your_username>` while online](../../../../assets/commands/complex_command_3.png)

If you leave the server and make the server run `/player find <your_username>`, it should give us an error:

![Running `/player find <your_username>` while offline](../../../../assets/commands/complex_command_4.png)

## Command Aliases

Steel has a dedicated way to define aliases using the `alias` method during registration:

```rust ins={3}
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::new("example", "player"), |_| command())
        .alias("player_redirect")
}
```

By doing this, `/player count` and `/player_redirect count` should work exactly the same. Note that aliases do not create new permission keys (explained later).

:::note
Command IDs must be unique. For duplicate commands, the earlier-defined registration is used.
Because two commands (of the same path) may have a collision, Steel will also register the identifier version
of the command (for example, `/minecraft:teleport`) for each command as a fallback.
:::