---
title: Installation
description: How to install Steel on your system.
---

This guide covers how to build and run Steel.

## Requirements

- **Rust nightly toolchain** - Steel uses Rust 2024 edition features
- **64-bit operating system** - Linux, macOS, or Windows
- **Git** - To clone the repository

## Installing Rust

If you don't have Rust installed, use [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel requires the nightly toolchain. The repository includes a `rust-toolchain.toml` that automatically selects the correct version.

## Building from Source

```bash
# Clone the repository
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# Build in release mode (recommended for running)
cargo build --release

# The binary will be at target/release/steel
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `cargo build` | Debug build (faster compile, slower runtime) |
| `cargo build --release` | Release build (slower compile, optimized) |
| `cargo check` | Fast syntax and type checking |
| `cargo test` | Run the test suite |
| `cargo clippy` | Run the linter |

### Build Features

Steel supports optional build features that can be enabled with `--features`:

```bash
# Enable deadlock detection (debug only)
cargo build --features deadlock_detection

# Enable heap profiling with dhat
cargo build --features dhat-heap

# Disable the default mimalloc allocator
cargo build --no-default-features
```

**Available features:**

| Feature | Description |
|---------|-------------|
| `mimalloc` | Use mimalloc allocator (enabled by default) |
| `deadlock_detection` | Enable parking_lot deadlock detection for debugging lock issues |
| `dhat-heap` | Enable heap profiling with dhat |

**Deadlock Detection** is particularly useful during development if you're experiencing hangs or suspect lock-related issues. When enabled, parking_lot will detect potential deadlocks and panic with diagnostic information.

## Running the Server

```bash
# Run directly with cargo (debug mode)
cargo run

# Run with release optimizations
cargo run --release

# Or run the built binary directly
./target/release/steel
```

The server will:
1. Create a `config/steel_config.json5` file if it doesn't exist
2. Bind to `0.0.0.0:25565` by default
3. Start accepting Minecraft 1.21.1 clients

## Pre-built Binaries

Pre-built binaries are available on the [GitHub Releases](https://github.com/Steel-Foundation/SteelMC/releases) page for:

- Linux (x86_64)
- Windows (x86_64)
- macOS (x86_64 and ARM)

## Next Steps

Now that you have Steel running, proceed to [Configuration](/SteelDocs/getting-started/configuration/) to customize your server.
