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

`seed`, `default_gamemode`, `difficulty` and `storage` are inherited from root to domains and from domains to worlds.

Valid gamemodes are `survival`, `creative`, `adventure` and `spectator`.
Valid difficulties are `peaceful`, `easy`, `normal` and `hard`.

## Terminology
:::caution
Please read this if you are not familiar with steels terminology!
:::
Unfortunatly Mojang is not even accurate to use the same terms in their code base. So World/level/map are descripe the same thing internally! Because we also add some functionality of [multiverse](https://modrinth.com/plugin/multiverse-core) nativly into steel. For describe it the best way, steel introduced a new terminology domains!
Here the definition and description of the terms: Domain, World, Dimension, World generator

### Domain
This is a collection of worlds related to each other. For example Vanillas worlds would be of the minecraft domain. Switching domains is kind of like switching servers since your player data doesn't carry across domains.

### World
This relates to a world like the Overworld, Nether, The End. Unlike Vanilla in steel it will be possible to alter the configuration in a way where you can have more worlds, maybe you want overworld 1 and overworld 2.

### Dimension
You can think of this like the properties of a world. The Overworld dimension has a height of 384 blocks. The nether has nether fog. The end has an end skybox

### World Generator
The world generator generates a world. The generator decides which dimension it targets. Like the overworld generator targets the overworld. Some generators like the void generator can be dimension agnostic and therefore the dimension can be configured

## Domains

A domain groups worlds together. At least one domain is needed and exactly one domain needs to be the default.

```toml
[domains.minecraft]
default = true
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

World names must be valid identifier paths and cannot contain `/`.

## Generators

Steel has these build in world generators:

| Generator | Config |
|-----------|--------|
| `minecraft:overworld` | No config table accepted |
| `minecraft:the_nether` | No config table accepted |
| `minecraft:the_end` | No config table accepted |
| `minecraft:flat` | Optional flat-world config |
| `steel:empty` | Requires `config.dimension_type` |

### Flat world

The flat world generator can be extended with layers

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

`minecraft:flat` needs at least one layer. `features = true` and `lakes = true` are not implemented yet.

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

### Empty world

Important for an empty world gen is the config, which defines the dimension_type which defines the dimension and it's properties (like y height and fog as an example).

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

Steel has these build in world storage backends:

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

### Simple configuration

this is the default config for `worlds.toml`, means like a normal survival world

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

This have many different settings, which are explained before.
Currently the domain minecraft is on disk and the world `the_nether` from the domain `flat`. Domain `empty` and `minecraft` are gamemode survival and domain `flat` is creative.
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
