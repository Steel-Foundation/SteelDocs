---
title: Feature Flags
description: Complete reference for SteelMC compile-time feature flags.
sidebar:
  order: 1
---

SteelMC uses Rust feature flags to enable or disable functionality at compile time. Use them to tailor a build for production, debugging, profiling, telemetry, or generated-code maintenance.

Most users build the server binary through the `steel` package:

```bash
cargo build -p steel --features "feature_name"
```

## steel

These flags control the main server executable.

| Feature | Default | Description |
|---------|---------|-------------|
| `mimalloc` | Yes | Uses MiMalloc as the global allocator for improved allocation performance. |
| `stand-alone` | No | Embeds the default favicon and writes it when the configured favicon file is missing. |
| `deadlock_detection` | No | Enables `parking_lot` deadlock detection for debugging. |
| `dhat-heap` | No | Enables the DHAT heap profiler for memory analysis. This replaces MiMalloc as the global allocator when both are enabled. |
| `spawn_chunk_display` | No | Shows a colored terminal grid while startup spawn chunks are generated. |
| `slow_chunk_gen` | No | Slows chunk generation during spawn preparation and forwards `steel-core/slow_chunk_gen`; useful for observing the spawn chunk display. |
| `jaeger` | No | Enables OpenTelemetry tracing export through OTLP for Jaeger-compatible tracing setups. |

### Usage Examples

```bash
# Build with deadlock detection
cargo build -p steel --features deadlock_detection

# Build without the default MiMalloc allocator
cargo build -p steel --no-default-features

# Build with the spawn chunk display
cargo build -p steel --features "spawn_chunk_display slow_chunk_gen"

# Build with Jaeger/OpenTelemetry tracing support
cargo build -p steel --features jaeger
```

## steel-core

These flags control core game logic and lower-level debugging helpers.

| Feature | Default | Description |
|---------|---------|-------------|
| `stand-alone` | No | Defined in the crate manifest, but currently has no active `cfg(feature = "stand-alone")` code paths in `steel-core`. The server binary's `stand-alone` feature handles the embedded favicon behavior. |
| `slow_chunk_gen` | No | Adds a short delay after chunk generation stages when the server enables slow spawn generation. |
| `flint` | No | Exposes behavior introspection helpers, including concrete behavior type names and behavior registry slices. |

## steel-registry

These flags control the game registry system and generated registry code.

| Feature | Default | Description |
|---------|---------|-------------|
| `fmt` | No | Runs `rustfmt` over generated registry files during the build script. |
| `minecraft-src` | No | Enables helpers that compare generated registry data against the generated `minecraft-src` reference data. |

## steel-utils

These flags control generated utility data.

| Feature | Default | Description |
|---------|---------|-------------|
| `fmt` | No | Runs `rustfmt` over generated utility files during the build script. |

## steel-worldgen

These flags control generated world-generation data.

| Feature | Default | Description |
|---------|---------|-------------|
| `fmt` | No | Runs `rustfmt` over generated world-generation files during the build script. |

## Combining Features

You can enable multiple features in one build:

```bash
# Build with several server debugging features
cargo build -p steel --features "deadlock_detection spawn_chunk_display slow_chunk_gen"

# Build for a standalone-style server distribution
cargo build -p steel --release --features stand-alone

# Format generated registry output while building that crate
cargo build -p steel-registry --features fmt
```

Feature flags are package-scoped. When enabling features outside the `steel` package, pass the target package explicitly with `-p`.

## Production Recommendations

For production servers, prefer:

- Keep `mimalloc` enabled unless you are profiling with `dhat-heap`.
- Keep `deadlock_detection`, `dhat-heap`, `spawn_chunk_display`, and `slow_chunk_gen` disabled.
- Enable `stand-alone` only when you want the server binary to provide the default favicon file.
- Enable `jaeger` only when you have an OTLP tracing collector configured.
- Use `fmt` and `minecraft-src` for development and generated-code validation, not normal production builds.
