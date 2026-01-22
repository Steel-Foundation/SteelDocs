---
title: Configuration
description: How to configure your Steel server.
---

Steel uses a JSON5 configuration file, which supports comments and trailing commas.

## Configuration File

On first run, Steel creates `config/steel_config.json5` with default values.

## Configuration Options

### Server Settings

```json5
{
  // Port the server listens on (1-65000)
  server_port: 25565,

  // World seed (empty string for random)
  seed: "",

  // Maximum concurrent players
  max_players: 20,

  // Chunk view distance (1-32)
  view_distance: 10,

  // Chunk simulation distance (1-32, must be ≤ view_distance)
  simulation_distance: 10,

  // Require Mojang authentication
  online_mode: true,

  // Enable client-server encryption
  encryption: true,

  // Server list message
  motd: "A Steel Server",

  // Enforce cryptographic chat signatures
  // Requires online_mode and encryption to be true
  enforce_secure_chat: false,
}
```

### Favicon

```json5
{
  // Enable custom server icon
  use_favicon: true,

  // Path to favicon image (must be 64x64 PNG)
  favicon: "config/favicon.png",
}
```

Place a 64x64 PNG image at `config/favicon.png` to display a custom icon in the server list.

### Compression

```json5
{
  compression: {
    // Minimum packet size to compress (minimum 256 bytes)
    threshold: 256,

    // Zlib compression level (0-9, higher = smaller but slower)
    level: 6,
  },
}
```

### Server Links

Server links appear in the player's pause menu:

```json5
{
  server_links: {
    enable: true,
    links: [
      // Built-in label types
      { label: "bug_report", url: "https://github.com/Steel-Foundation/SteelMC/issues" },
      
      // Custom styled labels
      { 
        label: { text: "Discord", color: "blue", bold: true }, 
        url: "https://discord.gg/MwChEHnAbh" 
      },
    ],
  },
}
```

## Full Example

```json5
{
  server_port: 25565,
  seed: "my_world_seed",
  max_players: 50,
  view_distance: 12,
  simulation_distance: 10,
  online_mode: true,
  encryption: true,
  motd: "Welcome to my Steel server!",
  enforce_secure_chat: false,
  use_favicon: true,
  favicon: "config/favicon.png",
  compression: {
    threshold: 256,
    level: 6,
  },
  server_links: {
    enable: true,
    links: [
      { label: "bug_report", url: "https://github.com/Steel-Foundation/SteelMC/issues" },
    ],
  },
}
```

## Validation Rules

Steel validates your configuration on startup:

| Setting | Constraint |
|---------|------------|
| `server_port` | 1-65000 |
| `view_distance` | 1-32 |
| `simulation_distance` | 1-32, must be ≤ `view_distance` |
| `compression.threshold` | ≥ 256 |
| `compression.level` | 0-9 |
| `enforce_secure_chat` | Requires `online_mode` and `encryption` to be `true` |

If validation fails, the server will exit with an error message.

## Next Steps

With your server configured, you're ready to [run the server](/SteelDocs/getting-started/running/).
