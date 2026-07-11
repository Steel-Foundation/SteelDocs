---
title: Server Configuration
description: Complete reference of all server configuration options in SteelMC
sidebar:
  order: 2
---

SteelMC is configured through a TOML configuration file located at `config/config.toml`. This page documents all server options.

World settings are documented in [World Configuration](../world-configuration).

## Basic Settings

| Option                                | Type   | Default            | Description                                                                     |
| ------------------------------------- | ------ | ------------------ | ------------------------------------------------------------------------------- |
| `server.server_port`                  | u16    | `25565`            | The port the server listens on                                                  |
| `server.max_players`                  | u32    | `20`               | Maximum players allowed simultaneously                                          |
| `server.allow_extended_view_distance` | bool   | `false`            | Allow `view_distance` above vanilla's 32-chunk cap, up to Steel's 127-chunk cap |
| `server.view_distance`                | u8     | `10`               | Maximum view distance in chunks. Normally 1-32, or 1-127 with extended opt-in   |
| `server.simulation_distance`          | u8     | `10`               | Maximum simulation distance in chunks. Must be less than or equal to view range |
| `server.motd`                         | String | `"A Steel Server"` | Message displayed in the server list                                            |

:::note
If you go beyond 32 chunks of view distance, vanilla clients still need a client-side mod that allows larger render distances.
:::

## Threads Settings

Optional worker counts for server thread pools. 0 or omitted uses each pool's automatic default.

| Option                            | Type  | Default | Description                                                                                             |
| --------------------------------- | ----- | ------- | ------------------------------------------------------------------------------------------------------- |
| `server.threads.main_runtime`     | usize | 0       | Worker threads for the primary Tokio runtime. 0 or omitted for default/auto.                            |
| `server.threads.chunk_runtime`    | usize | 0       | Worker threads for the chunk Tokio runtime.                                                             |
| `server.threads.chunk_generation` | usize | 0       | Worker threads for the Rayon chunk generation pool.                                                     |

These settings are only useful when you want to balance CPU use manually, for example to leave capacity for other processes on the same machine.

## Security Settings

| Option                       | Type   | Default | Description                                                             |
| ---------------------------- | ------ | ------- | ----------------------------------------------------------------------- |
| `server.online_mode`         | bool   | `true`  | Use Mojang authentication for player verification                       |
| `server.auth_server`         | String | omitted | Optional `hasJoined` endpoint for online mode. Omit to use Mojang       |
| `server.encryption`          | bool   | `true`  | Enable encryption for client-server communication                       |
| `server.allow_flight`        | bool   | `false` | Allow unauthorized client flight in vanilla movement checks             |
| `server.enforce_secure_chat` | bool   | `false` | Enforce secure chat. Requires `online_mode = true` and `encryption = true` |

:::caution
Disabling `online_mode` allows unauthenticated clients to connect. Only disable it for private networks or development.
:::

:::info
For debugging and bots it's recommended to disable encryption (only for testing!)
:::

## Chat Settings

| Option                                  | Type | Default | Description                                                                  |
| --------------------------------------- | ---- | ------- | ---------------------------------------------------------------------------- |
| `server.chat_spam_threshold_seconds`    | i32  | `10`    | Vanilla chat spam threshold window in seconds. Values <= 0 disable throttling |
| `server.command_spam_threshold_seconds` | i32  | `10`    | Vanilla command spam threshold window in seconds. Values <= 0 disable throttling |

## Favicon Settings

| Option               | Type   | Default                | Description                      |
| -------------------- | ------ | ---------------------- | -------------------------------- |
| `server.use_favicon` | bool   | `true`                 | Whether to use a custom favicon  |
| `server.favicon`     | String | `"config/favicon.png"` | Path to favicon file (64x64 PNG) |

## Compression Settings

Network compression reduces bandwidth usage at the cost of CPU.

| Option                         | Type | Default | Valid Range | Description                           |
| ------------------------------ | ---- | ------- | ----------- | ------------------------------------- |
| `server.compression.threshold` | u32  | `256`   | >=256       | Packet size threshold for compression |
| `server.compression.level`     | i32  | `4`     | 1-9         | Compression level (1=fast, 9=best)    |

The `[server.compression]` table is optional. If it is omitted, compression is disabled.

## Server Links

Server links are displayed in the multiplayer menu.

| Option                       | Type  | Default | Description                 |
| ---------------------------- | ----- | ------- | --------------------------- |
| `server.server_links.enable` | bool  | `true`  | Enable server links feature |
| `server.server_links.links`  | Array | 4 links | List of links to display    |

See [Server Links Guide](../server-links) for detailed configuration.

## Logging Settings

| Option              | Type   | Default     | Description                                                     |
| ------------------- | ------ | ----------- | --------------------------------------------------------------- |
| `log.log_path`      | String | `"./.logs"` | Directory for log files and command history                     |
| `log.log_level`     | String | `"info"`    | Log level: `error`, `warn`, `info`, `debug`, or `trace`         |
| `log.time`          | String | `"uptime"`  | Time format: `none`, `date`, or `uptime`                        |
| `log.module_path`   | bool   | `false`     | Whether the module path should be displayed                     |
| `log.extra`         | bool   | `false`     | Whether extra log data should be displayed                      |
| `log.log_file`      | bool   | `true`      | Whether logs should also be written to files                    |
| `log.rotation_time` | String | `"daily"`   | File rotation: `none`, `hourly`, `daily`, `weekly`, or `monthly` |
| `log.max_history`   | usize  | `50`        | Number of console commands saved in history                     |

## Example Configuration

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
allow_extended_view_distance = false
view_distance = 12
simulation_distance = 10
online_mode = true
# auth_server = "https://sessionserver.mojang.com/session/minecraft/hasJoined"
encryption = true
allow_flight = false
motd = "Welcome to my Steel server!"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false
chat_spam_threshold_seconds = 10
command_spam_threshold_seconds = 10

[server.threads]
main_runtime = 0
chunk_runtime = 0
chunk_generation = 0

[server.compression]
threshold = 256
level = 4

[server.server_links]
enable = true

[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

[log]
log_path = "./.logs"
log_level = "info"
time = "uptime"
module_path = false
extra = false
log_file = true
rotation_time = "daily"
max_history = 50
```

## Validation Rules

The server validates configuration on startup:

- unknown fields are rejected
- `server.view_distance` must be between 1 and 32, or between 1 and 127 when `server.allow_extended_view_distance` is true
- `server.simulation_distance` must be less than or equal to `server.view_distance`
- `server.auth_server`, when set, must be an absolute `http` or `https` URL
- `server.compression.threshold` must be at least 256
- `server.compression.level` must be between 1 and 9
- if `server.enforce_secure_chat` is true, both `server.online_mode` and `server.encryption` must be true
- `log.log_level`, `log.time`, and `log.rotation_time` must use one of their listed values

If validation fails, the server will exit with an error message.
