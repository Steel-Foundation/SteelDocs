---
title: Server Configuration
description: Complete reference of all server configuration options in SteelMC
sidebar:
  order: 2
---

SteelMC is configured through a TOML configuration file located at `config/config.toml`. This page documents all server options.

World settings are documented in [World Configuration](../world-configuration).

## Basic Settings

| Option                                | Type   | Default            | Description                                                  |
| ------------------------------------- | ------ | ------------------ | ------------------------------------------------------------ |
| `server.server_port`                  | u16    | `25565`            | The port the server listens on                               |
| `server.max_players`                  | u32    | `20`               | Maximum players allowed simultaneously                       |
| `server.allow_extended_view_distance` | bool   | false              | Allow view_distance above vanilla's 32-chunk cap, up to 127. |
| `server.view_distance`                | u8     | `10`               | Maximum view distance in chunks (1-32)                       |
| `server.simulation_distance`          | u8     | `10`               | Maximum simulation distance in chunks                        |
| `server.motd`                         | String | `"A Steel Server"` | Message displayed in server list                             |

:::note
If you go beyond 32 of render distance, client would need mod that allow to go beyond 32 as well like bobby or c2me or any other. But it's not necessary.
:::

## Threads Settings

Optional worker counts for server thread pools. 0 or omitted uses each pool's automatic default.

| Option                            | Type  | Default | Description                                                                                             |
| --------------------------------- | ----- | ------- | ------------------------------------------------------------------------------------------------------- |
| `server.threads.main_runtime`     | usize | 0       | Maximum threads limit for thread pools (Tokio runtimes and Rayon pools). 0 or omitted for default/auto. |
| `server.threads.chunk_runtime`    | usize | 0       | Worker threads for the chunk Tokio runtime.                                                             |
| `server.threads.chunk_generation` | usize | 0       | Worker threads for the Rayon chunk generation pool.                                                     |

Only useful if you want to try to balence manually. (ex: avoid to impact other processus that are running on the same machine)

## Security Settings

| Option                       | Type | Default | Description                                               |
| ---------------------------- | ---- | ------- | --------------------------------------------------------- |
| `server.online_mode`         | bool | `true`  | Use Mojang authentication for player verification         |
| `server.encryption`          | bool | `true`  | Enable encryption for client-server communication         |
| `server.enforce_secure_chat` | bool | `false` | Enforce secure chat (requires online_mode and encryption) |

:::caution
Disabling `online_mode` allows cracked clients to connect. Only disable if you know what are you doing, or for private networks and development.
:::

:::info
For debugging and bots it's recommended to disable encryption (only for testing!)
:::

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

## Server Links

Server links are displayed in the multiplayer menu.

| Option                       | Type  | Default | Description                 |
| ---------------------------- | ----- | ------- | --------------------------- |
| `server.server_links.enable` | bool  | `true`  | Enable server links feature |
| `server.server_links.links`  | Array | 4 links | List of links to display    |

See [Server Links Guide](../server-links) for detailed configuration.

## Logging Settings

| Option            | Type   | Default    | Description                                 |
| ----------------- | ------ | ---------- | ------------------------------------------- |
| `log.time`        | String | `"uptime"` | Time format: `none`, `date`, or `uptime`    |
| `log.module_path` | bool   | `false`    | Whether the module path should be displayed |
| `log.extra`       | bool   | `false`    | Whether extra log data should be displayed  |

## Example Configuration

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
view_distance = 12
simulation_distance = 10
online_mode = true
encryption = true
motd = "Welcome to my Steel server!"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false

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
time = "uptime"
module_path = false
extra = false
```

## Validation Rules

The server validates configuration on startup:

- unknown fields are rejected
- `server.view_distance` must be between 1 and 32, 1 and 127 when allow_extended_view_distance is true
- `server.simulation_distance` must be less than or equal to `server.view_distance`
- `server.compression.threshold` must be at least 256
- `server.compression.level` must be between 1 and 9
- if `server.enforce_secure_chat` is true, both `server.online_mode` and `server.encryption` must be true

If validation fails, the server will exit with an error message.
