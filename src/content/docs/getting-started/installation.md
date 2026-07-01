---
title: Installation
description: How to install Steel on your system.
sidebar:
  order: 1
---

This guide will show you how to install and run Steel.\
There are multiple ways to do that:

- [Pre-built binary](#pre-built-binaries)
- [Docker](#docker)
- [Egg (Pelican / Pterodactyl)](#egg)
- [Self compiled](#self-compilation)

## What to select

You should choose the installation method that matches where Steel will run.

- If you want to run Steel directly on the host system, use the pre-built binaries.

- If you already use Kubernetes, Docker Swarm, or a standard Docker host, the Docker container is the recommended option.

- If your target platform is Pelican, Pterodactyl, or another egg-based panel, use the provided Steel egg in JSON or YAML format.

- If you want native processor speeds or your platform / architecture is not currently supported, build Steel from source for your target system.

| Method                          | Linux x64 | Linux arm64 | Linux armv7 | Linux armv6 | Windows x64 | Windows arm | Mac arm | Mac x64 |
| ------------------------------- | :-------: | :---------: | :---------: | :---------: | :---------: | :---------: | :-----: | :-----: |
| [Binary](#pre-built-binaries)   |    ✅     |     ❌      |     ❌      |     ❌      |     ✅      |     ❌      |   ✅    |   ❌    |
| [Docker](#docker)               |    ✅     |     ✅      |     ❌      |     ❌      |     ✅      |     ✅      |   ✅    |   ✅    |
| [Egg](#egg)                     |    ✅     |     ❌      |     ❌      |     ❌      |     ❌      |     ❌      |   ❌    |   ❌    |
| [Self-built](#self-compilation) |    ✅     |     ✅      |     ⚠️      |     ⚠️      |     ✅      |     ✅      |   ✅    |   ✅    |

✅: Supported. ❌: Not currently supported. ⚠️: Needs small adjustments.

The sections below describe each option in more detail.

## Pre-built Binaries

Pre-built binaries are available on our [downloads page](../../download) for the following platforms:

- Linux (x86_64)
- Windows (x86_64)
- MacOS (ARM)

Alternatively our [GitHub releases](https://github.com/Steel-Foundation/SteelMC/releases) page has the exact same files available.

Once downloaded, to run the server you just need to open your prefered terminal (e.g. PowerShell, Ghostty, Kitty, etc...) in your downloaded executable directory and run the following command:

```bash
# Windows
./steel.exe

# MacOS / Linux
./steel
```

:::caution
For MacOS users is necessary to enable the Development Mode of the system to be able to execute Steel, since it's not oficially signed.

This can be achieved through running the following command in the terminal and entering your administrator password:

```bash
sudo devtools enable
```

:::

## Docker

Steel does not publish a `latest` Docker tag. Use a specific version tag instead, this way upgrades are always planned and no container updates unexpectedly.

The `nightly` tag is available for plugin testing and early testing of upcoming changes. It follows the latest commit on the `master` branch and may contain bugs that have not been fixed for a release yet. Do not use `nightly` in production.

### Start the image

Run the Steel container with the server port exposed and local folders mounted for configuration and saves:

```bash
docker run -d -p 25565:25565 -v ./config:/config -v ./saves:/saves -v ./logs:/logs ghcr.io/steel-foundation/steelmc:<version>
```

:::note
The docker pull for nightly is: `docker pull ghcr.io/steel-foundation/steelmc:nightly`
:::

:::tip
The same setup can be written as a Docker Compose service (Recommended):

```yaml
# docker-compose.yml
services:
  steel:
    image: ghcr.io/steel-foundation/steelmc:<version>
    ports:
      - 25565:25565
    volumes:
      - ./config:/config
      - ./saves:/saves
      - ./logs:/logs
```

Docker Compose is another way to write the `docker run` command in a file.\
You can find the full Docker Compose reference here: https://docs.docker.com/reference/compose-file/

:::

### How to change ports and folders

For those without any idea of how to configure docker, here's a small cheatsheet of the configurable parameters:

- **`-p` (`--port`, `ports`):** The first number represents the host port, which can be changed. The second one is the port inside the Docker container and should only be changed to match the one in the Steel config. For example, `-p 1111:25565` makes the Minecraft server reachable on port `1111` on the Linux server.
- **`-v` (`--volume`, `volumes`):** The route before the colon is the path on your host system, which can be relative to the compose file. The path after the colon is inside the Docker container and should not be changed.

## Egg

For Pelican and Pterodactyl, Steel provides an egg that can be imported directly from the panel's egg store.

For other egg-based platforms, use the JSON or YAML egg files from our repository, or download the matching egg from one of the supported stores when available.

Pelican: `[Coming Soon]`

Pterodactyl: `[Coming Soon]`

## Self Compilation

### Requirements

- **Rust nightly toolchain** - Steel uses Rust 2024 edition features
- **64-bit operating system** - Linux, MacOS, or Windows
- **Git** - To clone the repository

### Installing Rust

If you don't have Rust installed, use [rustup](https://rustup.rs/).

```bash
# For Unix systems only (e.g. MacOS, Linux)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel requires the nightly toolchain. The repository includes a `rust-toolchain.toml` that automatically selects the correct version.

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# Build in release mode (recommended for running)
cargo build-native --release
```

:::note
**The binary will be at `./target/release/steel`**
:::

:::caution
If you want to build for armv6 and armv7. You also need to clone simdnbt change in the Cargo.toml to use your local version and remove the restriction of 64bit from simdnbt.
For more help we can support at [discord](/discord).
:::

#### Build Commands

| Command                        | Purpose                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `cargo build-native`           | Debug build (faster compile, slower runtime) (with architecture-specific optimizations) |
| `cargo build-native --release` | Release build (slower compile, optimized) (with architecture-specific optimizations)    |
| `cargo build`                  | Debug build (faster compile, slower runtime)                                            |
| `cargo build --release`        | Release build (slower compile, optimized)                                               |
| `cargo check`                  | Fast syntax and type checking                                                           |
| `cargo test`                   | Run the test suite                                                                      |
| `cargo clippy`                 | Run the linter                                                                          |

:::caution
Native builds can't be executed on other machines, only in the same one where they were compiled.
(Or one with the same architecture)
:::

#### Build Features

Steel supports optional build features that can be enabled with `--features`:

```bash
# Enable deadlock detection (debug only)
cargo build-native --features deadlock_detection

# Enable heap profiling with dhat
cargo build-native --features dhat-heap

# Disable the default mimalloc allocator
cargo build-native --no-default-features
```

**Available features:**

| Feature              | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `mimalloc`           | Use mimalloc allocator (enabled by default)                     |
| `deadlock_detection` | Enable parking_lot deadlock detection for debugging lock issues |
| `dhat-heap`          | Enable heap profiling with dhat                                 |

**Deadlock Detection** is particularly useful during development if you're experiencing hangs or suspect lock-related issues. When enabled, parking_lot will detect potential deadlocks and panic with diagnostic information.

### Running the Server

```bash
# Run directly with cargo (debug mode)
cargo run-native

# Run with release optimizations
cargo run-native --release

# Or run the built binary directly
./target/release/steel
```

## Next Steps

Now that you have Steel running, proceed to [Configuration](../../configuration/overview) to customize your server.
