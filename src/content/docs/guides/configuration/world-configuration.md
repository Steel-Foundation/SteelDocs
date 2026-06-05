---
title: Server World Configuration
description: Complete reference of all server world configuration options in SteelMC
sidebar:
  order: 3
---

SteelMC world configuration is done through a TOML file located at `config/worlds.toml`. This page documents all world,
domain, generator and storage options.

## Basic Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `save_path` | String | `"saves"` | Root directory for saved worlds |
| `seed` | String | `""` | World generation seed (empty = random) |
| `default_gamemode` | String | `"survival"` | Default gamemode for new player data |
| `difficulty` | String | `"normal"` | Difficulty for new level data |
| `storage.type` | Identifier | `"steel:disk"` | Default world storage backend |
| `player_storage.type` | Identifier | `"steel:file"` | Player data storage backend |

`seed`, `default_gamemode`, `difficulty` and `storage` are inherited from root to domains and from domains to worlds. They can also be overridden in each place, which gives the server flexible configuration.

Valid gamemodes are `survival`, `creative`, `adventure` and `spectator`.
Valid difficulties are `peaceful`, `easy`, `normal` and `hard`.

## Terminology
:::caution
Read this section if Steel's terminology is unfamiliar.
:::
Unfortunately, Mojang is not consistent about using the same terms in their codebase. `World`, `level` and `map` can describe the same thing internally. Steel also adds some [Multiverse](https://modrinth.com/plugin/multiverse-core) functionality natively. To describe this clearly, Steel introduced a new term: domains.
Here are the definitions and descriptions of the terms: Domain, World, Dimension and World generator.

### Domain
This is a collection of worlds related to each other. For example, vanilla worlds would be part of the `minecraft` domain. Switching domains is similar to switching servers, since player data does not carry across domains.

### World
This refers to a world like the Overworld, Nether or The End. Unlike vanilla, Steel can be configured to have more worlds. For example, a setup might use Overworld 1 and Overworld 2.

### Dimension
A dimension can be understood as the properties of a world. The Overworld dimension has a height of 384 blocks. The Nether has Nether fog. The End has an End skybox.

### World Generator
The world generator generates a world. The generator decides which dimension it targets. For example, the Overworld generator targets the Overworld. Some generators, like the void generator, can be dimension-agnostic, so the dimension can be configured.

## Domains

At least one domain is needed, and exactly one domain needs to be the default.

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domains.<domain>.default` | bool | `false` | Whether this is the default domain |
| `domains.<domain>.seed` | String | inherited | Domain seed override |
| `domains.<domain>.default_gamemode` | String | inherited | Domain gamemode override |
| `domains.<domain>.difficulty` | String | inherited | Domain difficulty override |
| `domains.<domain>.storage` | Table | inherited | Domain storage override |
| `domains.<domain>.worlds` | Array | required | Worlds inside this domain |

The domain name must be a valid identifier namespace. `global` is reserved and cannot be used.

## Worlds

Each domain needs at least one world and exactly one default world.

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | String | required | Name of the world inside the domain |
| `generator` | Identifier | required | World generator to use |
| `default` | bool | `false` | Whether this is the default world of the domain |
| `seed` | String | inherited | World seed override |
| `default_gamemode` | String | inherited | World gamemode override |
| `difficulty` | String | inherited | World difficulty override |
| `storage` | Table | inherited | World storage override |
| `config` | Table | `{}` | Generator-specific config |

World names must be valid identifier paths, cannot contain `/` and must be unique within the domain. The names `overworld`, `the_nether` and `the_end` are special cases used to connect portals (Nether portals and End portals). This allows a single-player playstyle to be created for each player with all three dimensions, so it feels like vanilla single-player.

## Generators

Steel has these built-in world generators:

| Generator | Config |
|-----------|--------|
| `minecraft:overworld` | No config table accepted |
| `minecraft:the_nether` | No config table accepted |
| `minecraft:the_end` | No config table accepted |
| `minecraft:flat` | Optional flat-world config |
| `steel:empty` | Requires `config.dimension_type` |

### Minecraft world generator

The generators `minecraft:overworld`, `minecraft:the_nether` and `minecraft:the_end` have no config. They produce vanilla-parity worlds for their dimensions.

### Flat world generator

The flat world generator can be extended with world layers. TOML supports two equivalent forms for this.
`minecraft:flat` needs at least one layer for a custom config. `features = true` and `lakes = true` are not implemented yet.

#### First version

```toml
[domains.dev]
default = true

[[domains.dev.worlds]]
name = "flat"
generator = "minecraft:flat"
default = true

[domains.dev.worlds.config]
features = false
lakes = false
structure_overrides = ["minecraft:villages"]

[[domains.dev.worlds.config.layers]]
block = "minecraft:bedrock"
height = 1

[[domains.dev.worlds.config.layers]]
block = "minecraft:grass_block"
height = 3
```

#### Second version

```toml
save_path = "saves"
seed = ""
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:file"

[domains.flat]
default = true

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:blackstone", height = 2 },
  { block = "minecraft:netherrack", height = 1 }
]

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:end_stone", height = 3 }
]
```

### Empty world generator

The important part of an empty world generator is the config, which defines `dimension_type`. The dimension type defines the dimension and its properties, such as Y height and fog.

```toml
[domains.empty]
default = true

[[domains.empty.worlds]]
name = "void"
generator = "steel:empty"
default = true

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## Storage

Steel has these built-in world storage backends. Storage can be set for the full server, per domain and per world. For example, the full server can use RAM storage, one domain can still use disk storage and be saved to disk, and a world in that domain can still use RAM storage. This gives maximum flexibility to configure storage as needed.

| Storage | Config |
|---------|--------|
| `steel:disk` | Optional `config.path`, relative to `save_path` |
| `steel:ram` | No config, chunks are not saved |

Player storage currently only supports `steel:file`.

Example disk path override:

```toml
[[domains.minecraft.worlds]]
name = "testing"
generator = "minecraft:overworld"

[domains.minecraft.worlds.storage]
type = "steel:disk"

[domains.minecraft.worlds.storage.config]
path = "custom/testing"
```

## Example Configuration

This section first shows the default config generated on first start. The second config uses the concepts above to construct a three-domain setup with different gamemodes, storage and generator config.

### Simple configuration

This is the default config for `worlds.toml`, which creates a normal survival world.

```toml
# /config/worlds.toml

# Root defaults inherited by domains and worlds unless overridden.
save_path = "saves"
seed = "my_awesome_seed"
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:file"

[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"
```

### Extended Multidomain configuration

This has many different settings, which are explained above.
Currently, the `minecraft` domain is on disk, as is the world `the_nether` from the `flat` domain. The `empty` and `minecraft` domains use survival gamemode, while the `flat` domain uses creative gamemode.
```toml
save_path = "saves"
seed = ""
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:file"

[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"

[domains.flat]
default_gamemode = "creative"
storage.type = "steel:ram"

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:blackstone", height = 2 },
    { block = "minecraft:netherrack", height = 1 }
]
storage.type = "steel:disk"

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:end_stone", height = 3 }
]

[domains.empty]
default = false
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "empty"
default = true
generator = "steel:empty"

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```


## Validation Rules

The server validates world configuration on startup:

- unknown fields are rejected
- at least one domain must be declared
- exactly one domain must set `default = true`
- each domain must declare at least one world
- each domain must have exactly one default world
- domain names must be valid identifier namespaces
- the domain name `global` is reserved
- world names must be valid identifier paths and cannot contain `/`
- `save_path` and storage paths must be clean relative paths
- generators and storage backends must be known to Steel

If validation fails, the server will exit with an error message.
