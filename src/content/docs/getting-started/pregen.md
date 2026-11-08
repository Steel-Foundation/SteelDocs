---
title: preGen
description: How to pregenerate worlds.
---

This guide will help to understnd how to pregenerate worlds of your steel server.
With a specific settings, it is also used for our preGen benchmarks.

Currently pregeneration is not a command, so environment variables will be set and the server will frist pregenerate the world with that specific area afterwards will start the server, so it can be joined on.


## Environemnt variables

| Environment variable | Data type | Explanation |
| --- | --- | --- |
| `PREGEN_SIZE` | `i32` | Must be an odd number. Defines the area in chunks (size × size). |
| `WORLD_IDENTIFIER` | `String` | Fully qualified world identifier in the form `domain:world`, as listed in `worlds.toml`. |
| `PREGEN_WINDOW_SIZE` | `i32` | Overrides the default 32-chunk window side length. |

## Usage

### Benchmarks

For benchmarks to see how performant the cpu is this command can be used:

`PREGEN_SIZE=301 cargo run-native --release`

The saves folder needs to be deleted before!

### Generate the nether

To generate an area in the nether the command will look like this:

`PREGEN_SIZE=101 WORLD_IDENTIFIER="minecraft:the_nether" cargo run-native --release`

this will generate a 101 by 101 chunk area in the domain `minecraft` of the world `the_nether`.

### Other

`PREGEN_WINDOW_SIZE` should be only used for specific use cases to squeze the last cps out of a cpu, which needs manual tuning. It is not recommended to change that.