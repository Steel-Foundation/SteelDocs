---
title: Running the Server
description: How to run and manage your Steel server.
---

This guide covers running Steel and understanding its behavior.

## Starting the Server

```bash
# From the SteelMC directory
cargo run --release

# Or run a pre-built binary
./steel
```

On startup, Steel will:

1. Load or create `config/steel_config.json5`
2. Validate the configuration
3. Initialize the dual async runtimes
4. Start listening on the configured port (default: 25565)

## Connecting

Use Minecraft Java Edition **1.21.1** to connect:

1. Open Minecraft and go to Multiplayer
2. Add a server with address `localhost` (or your server's IP)
3. Connect and play

## Graceful Shutdown

Press `Ctrl+C` to stop the server. Steel will:

1. Stop accepting new connections
2. Save all modified chunks to disk
3. Exit cleanly

You'll see output like:

```
Saved 42 chunks
```

## World Data

Steel stores world data in the current directory:

- `config/` - Configuration files
- `world/` - World save data (chunks in NBT format)

## Server Status

The tab list displays real-time performance metrics:

- **TPS** - Ticks per second (target: 20)
- **MSPT** - Milliseconds per tick (lower is better)

## Tick Rate Modes

Steel supports different tick rate modes for debugging:

- **Normal** - Standard 20 TPS
- **Frozen** - Paused (no ticks)
- **Sprint** - Maximum speed

## Troubleshooting

### Port Already in Use

If you see a bind error, another process is using port 25565. Either:
- Stop the other process
- Change `server_port` in your config

### Client Can't Connect

Ensure:
- The client is running Minecraft 1.21.1
- `online_mode` matches your setup (set to `false` for offline/cracked clients)
- Firewall allows connections on the configured port

### Configuration Errors

If Steel exits immediately, check the error message. Common issues:
- `simulation_distance` greater than `view_distance`
- `compression.threshold` less than 256
- `enforce_secure_chat` enabled without `online_mode` and `encryption`
