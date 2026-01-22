---
title: Introduction
description: Learn what Steel is and why you might want to use it.
---

Steel is a Minecraft Java Edition server implementation written in Rust, targeting Minecraft **1.21.1**. It's designed for performance, reliability, and a clean developer experience.

## What is Steel?

Steel is a from-scratch implementation of the Minecraft server protocol. Unlike traditional Java-based servers, Steel leverages Rust's memory safety guarantees and zero-cost abstractions to deliver exceptional performance.

The server uses a dual async runtime architecture:
- **Main runtime** handles ticking, networking, and player updates
- **Chunk runtime** handles chunk generation and loading without blocking the tick loop

**Important**: All game logic (ticking, world state, entities, blocks) is synchronous. Only networking and disk I/O are async. This design keeps the core game deterministic and easy to reason about.

## Who is Steel for?

### Server Administrators

If you're running a Minecraft server and looking for:

- **Better performance** - Lock-free data structures and efficient concurrency
- **Lower memory usage** - Rust's efficient memory management
- **Reliability** - Memory-safe code means fewer crashes and exploits

### Developers

If you're building tools or contributing to server software:

- **Modern codebase** - Rust 2024 edition with 9 focused workspace crates
- **Type safety** - Catch errors at compile time, not runtime
- **Behavior system** - Extensible block and item behaviors

## Current Features

Steel currently supports:

- TCP networking with Java Edition clients
- Mojang authentication and encryption
- Zlib packet compression
- World generation (flat generator)
- Chunk loading, generation, and persistence
- Block placement and breaking
- Player movement with collision validation
- Chat system with signed messages
- Inventory and container management (chests, barrels)
- Block entities
- Custom favicon and server links

## Current Status

Steel is under active development (v0.0.0). Core networking and world systems are functional, with basic gameplay mechanics working. Check the [GitHub repository](https://github.com/Steel-Foundation/SteelMC) for the latest updates.

## Community

- **Discord**: https://discord.gg/MwChEHnAbh
- **GitHub**: https://github.com/Steel-Foundation/SteelMC

## Next Steps

Ready to get started? Head to the [Installation](/SteelDocs/getting-started/installation/) guide.
