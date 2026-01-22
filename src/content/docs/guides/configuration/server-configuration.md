---
title: Server Configuration
description: Complete reference of all server configuration options in SteelMC
sidebar:
  order: 2
---

SteelMC is configured through a JSON5 configuration file located at `config/steel_config.json5`. This page documents all available options.

## Basic Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server_port` | u16 | `25565` | The port the server listens on (1-65535) |
| `seed` | String | `""` | World generation seed (empty = random) |
| `max_players` | u32 | `20` | Maximum players allowed simultaneously |
| `view_distance` | u8 | `10` | Maximum view distance in chunks (1-32) |
| `simulation_distance` | u8 | `10` | Maximum simulation distance in chunks (1-32) |
| `motd` | String | `"A Steel Server"` | Message displayed in server list |

## Security Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `online_mode` | bool | `true` | Use Mojang authentication for player verification |
| `encryption` | bool | `true` | Enable encryption for client-server communication |
| `enforce_secure_chat` | bool | `false` | Enforce secure chat (requires online_mode and encryption) |

:::caution
Disabling `online_mode` allows cracked clients to connect. Only disable if you know what are you doing, or for private networks and development.
:::

## Favicon Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `use_favicon` | bool | `true` | Whether to use a custom favicon |
| `favicon` | String | `"config/favicon.png"` | Path to favicon file (64x64 PNG) |

## Compression Settings

Network compression reduces bandwidth usage at the cost of CPU.

| Option | Type | Default | Valid Range | Description |
|--------|------|---------|-------------|-------------|
| `compression.threshold` | u32 | `256` | ≥256 | Packet size threshold for compression |
| `compression.level` | u8 | `4` | 1-9 | Compression level (1=fast, 9=best) |

## Server Links

Server links are displayed in the multiplayer menu.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server_links.enable` | bool | `true` | Enable server links feature |
| `server_links.links` | Array | See below | List of links to display |

See [Server Links Guide](../server-links) for detailed configuration.

## Example Configuration

```json5
// /config/steel_config.json5
{
  server_port: 25565,
  seed: "my_awesome_seed",
  max_players: 50,
  view_distance: 12,
  simulation_distance: 10,
  online_mode: true,
  encryption: true,
  motd: "Welcome to my Steel server!",
  use_favicon: true,
  favicon: "config/favicon.png",
  enforce_secure_chat: false,
  compression: {
    threshold: 256,
    level: 4
  },
  server_links: {
    enable: true,
    links: [
      {
        label: { text: "Discord" },
        url: "https://discord.gg/example"
      }
    ]
  }
}
```

## Validation Rules

The server validates configuration on startup:

- `view_distance` must be between 1 and 64
- `simulation_distance` must be between 1 and 32
- `compression.threshold` must be at least 256
- `compression.level` must be between 1 and 9
- If `enforce_secure_chat` is true, both `online_mode` and `encryption` must be true
