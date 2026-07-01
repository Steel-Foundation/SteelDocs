---
title: FAQ
description: Answers to common questions.
---

Here you will find answers to the most common questions!
:::caution[DISCLAIMER]
Steel is in a pre-alpha state, therefore features and the following answers can change frequently!
:::

## How do I install Steel?

You can find the full guide [here](../installation).

## Is there an Egg?

Yes, we provide an egg configuration file, you can find more information in our [installation guide](../installation).

## Where is the jar (\*.jar) file?

Steel is not written in Java, so it doesn't have a jar (\*.jar).\
Don't worry, you can still find Windows, Linux, and Mac executables on our [downloads page](../../download) or [GitHub releases](https://github.com/Steel-Foundation/SteelMC/releases).

## Will Steel have vanilla parity?

Short and simple: **That is our main goal.**

## Does Steel have plugins, and will my Paper/Bukkit plugin work on Steel?

Not currently. Steel is a work in progress, and plugins are planned but not yet possible.\
In the future Steel will have its own API, we are looking forward to give it the best parts of Paper/Bukkit and modding APIs!

## In which language will plugins be written?

The main API will be in Rust, but the community can add support for WASM or other technologies to enable more languages.

## Does Steel have mods, and can I use my current ones?

NeoForge/Forge/Fabric mods will not be supported. As with plugins, Steel will use Rust, and the internal functionality will differ, as does what will ultimately be possible to do with it.

## How can I increase my flight speed

Just use the `/fly speed <velocity multiplier>` command, where the velocity multiplier must be a decimal number between 0 and 30.

## When I'm flying fast the server keeps pushing me back every few seconds

That's due to a vanilla gamerule, you can use `/gamerule player_movement_check false` to disable it.

## I have a problem, what should I do?

You can report it on [GitHub](https://github.com/Steel-Foundation/SteelMC/issues), or join our [Discord](/discord) and post it in the bugs channel.
