---
title: preGen
description: How to pregenerate worlds.
---

This guide will help to understand how to pregenerate worlds in a Steel server.
With specific settings, it is used for our preGen benchmarks.

Currently, pregeneration is not managed with a command, so environment variables will be set and the preset area will be generated before the server starts, allowing players to join.


## Environment variables

| Environment variable | Data type | Explanation |
| --- | --- | --- |
| `PREGEN_SIZE` | `i32` | Must be an odd number. When provided with number *n*, a square area with side lengths *n* is pregenerated. |
| `WORLD_IDENTIFIER` | `String` | Fully qualified world identifier in the form `domain:world`, as listed in `worlds.toml`, used so the program can target the correct world. |
| `PREGEN_WINDOW_SIZE` | `i32` | Overrides the default 32-chunk window side length, or the size of the area that each thread individually generates. Useful for tuning preGen performance, but is highly dependant on thread count, RAM volume, and RAM speed.. |

## Usage

### Benchmarks

For benchmarks to see how efficient the CPU is, this command can be used:

`PREGEN_SIZE=301 cargo run-native --release`

**Warning: The saves folder needs to be deleted before.**

### Generate the nether

To generate an area in the nether, the command must be modified to change the world:

`PREGEN_SIZE=101 WORLD_IDENTIFIER="minecraft:the_nether" cargo run-native --release`

This will generate a 101 by 101 chunk area in the domain `minecraft`, in the world `the_nether`.

### Other

`PREGEN_WINDOW_SIZE` should be only used for specific use cases to squeeze the last CPS (chunks per second) out of a cpu, which needs manual tuning. It is not recommended to change this. If you feel comfortable to do so, this value should be increased if your CPU remains underutilized, and should be decreased if your disk I/O reaches 100% (indicating a bottleneck in sequential write speed) or if your RAM usage climbs quickly without lowering. Keep in mind that you should only increase this value if your storage drive has fast sequential write speeds, as your drive needs to be able to write the to itself before the next one arrives, and you need to have enough RAM for the program to be able to store all the chunk areas that are waiting to generate.