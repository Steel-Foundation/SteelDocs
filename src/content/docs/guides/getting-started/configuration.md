---
title: Configuration
description: How to configure your Steel server.
---

Steel uses a toml configuration file, which supports comments.

## Configuration File

On first run, Steel creates `config/config.toml` with default values. You can find below the minimum config which can be used. This documentation gives you help to start steel if you want to make a deep dive into what is possible more information can be found [here](../configuration/overview).

## Full Example

```toml
[server]
# Server port
server_port = 25565
# Maximum number of players allowed on the server
max_players = 20
# Maximum view distance in chunks
view_distance = 10
# Maximum simulation distance in chunks
simulation_distance = 10
# Whether to use Mojang's authentication service
online_mode = true
# Whether to enable encryption for client-server communication
encryption = true
# Message of the day displayed in server lists
motd = "A Steel Server"
# Whether to use a custom favicon for the server
use_favicon = true
# Path to the favicon file (PNG format, 64x64 pixels)
favicon = "config/favicon.png"
# Whether to enforce secure chat
enforce_secure_chat = false

# Compression settings
[server.compression]
threshold = 256
level = 4
```

## Validation Rules

Steel validates your configuration on startup:

| Setting                 | Constraint                                           |
| ----------------------- | ---------------------------------------------------- |
| `server_port`           | 1-65000                                              |
| `view_distance`         | 1-32                                                 |
| `simulation_distance`   | 1-32, must be ≤ `view_distance`                      |
| `compression.threshold` | ≥ 256                                                |
| `compression.level`     | 0-9                                                  |
| `enforce_secure_chat`   | Requires `online_mode` and `encryption` to be `true` |

If validation fails, the server will exit with an error message.

## Next Steps

With your server configured, you're ready to [run the server](/getting-started/running/).
