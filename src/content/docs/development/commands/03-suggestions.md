---
title: Command Suggestions
description: How SteelMC command suggestions work
---

This tutorial will teach you what command suggestions are, and how to provide them for a command argument.

## Suggestions
A suggestion is basically a possible *suggested* value for an argument of a command.

For example, for a game mode argument, there are four possible game modes:
- `survival`
- `creative`
- `adventure`
- `spectator`

It can be tiresome to type them again and again, and there are only a few possible values for a game mode, so it makes sense to provide them as suggestions for
the argument. This makes writing commands easier for the end-user.

In *Minecraft*, suggestion code is usually called by the client, but suggestion code in SteelMC is still used for providing suggestions in the terminal.

## Providing Suggestions for an Argument Type

Some arguments provide suggestions. This is done by overriding the `list_suggestions()` method of the `SteelArgumentParser` trait.
The aforementioned `unit_argument_parser!` macro can also be used to specify it directly.

It takes in a mutable reference to a `SuggestionsBuilder`. We can call the `suggest()` method on the builder to add a single suggestion.
We can also call the `remaining()` or `remaining_lowercase()` methods to query the currently-typed value.
Here is how it is implemented for the game mode argument:

```rust
fn list_suggestions(
    &self,
    _context: &dyn SteelArgumentSuggestionContext,
    builder: &mut SuggestionsBuilder<'_>,
) {
    suggest_game_modes(builder);
}

fn suggest_game_modes(builder: &mut SuggestionsBuilder<'_>) {
    // Get the prefix so that only suggestions that complete the typed argument are shown.
    let prefix = builder.remaining_lowercase().to_owned();
    for game_mode in [
        GameType::Survival,
        GameType::Creative,
        GameType::Adventure,
        GameType::Spectator,
    ] {
        let name = game_mode.name();
        if name.starts_with(&prefix) {
            // Suggest each game mode in the loop.
            builder.suggest(name);
        }
    }
}
```


:::note
Implementing this method in the `unit_argument_parser!` works very similarly; just place the code inside the curly brackets, taking the parameters between
the bars (`|`) as function arguments:

```rust
suggest | _context, builder | {
    suggest_game_modes(builder);
},
```
:::