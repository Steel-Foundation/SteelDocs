---
title: How does registries work
description: Deep dive into learning how to use and write a registry
---

# How does registries work?

So all registries are in the cargo package `steel-registry`. Which holds all the code to build, initialize everything
and saves the data. To directly say that in the beginning, there are different types of registries, simple registries,
tagged registries and complex registries.
This guide here will only cover the easy and tagged registries, because the complex one like blocks and items have many
parts and a lot more functionality, then the majority of the registries. But after reading this guide, you should have
enough general understanding, to work also into them!

The package has 3 subfolders:

- `build`
- `build_assets`
- `src`

## Folder structure

This gives a short overview about all important folders in the steel-registry package.

### build_assets

This folder are only json and nbt data, which are extracted via the extractor or from the minecraft jar.
The `builtin_datapacks` is the folder there the data from the minecraft jar comes into, which is only required for
upgrading minecraft which you find the guide [here](../upgrade-minecraft).
All json files in this directory are extracted from the [SteelExtractor](../tools/steel_extractor).

### build

This directory are the building files, which convert the json files to Rust code to load the registries.
Most registry has it's own build file, for example chicken variants registry has the build file `chicken_variants`.
Because this guide only concentrates how the registries work, it doesn't cover the building scripts.

### src

Here are all registries saved and content of this guide.

## src/generated

This contains all generated rust files from the build scripts, so all rust files should't be edited manually there!

## Workflow

At built time:

1. check if json files changed
2. rebuilding rust file, which adds all data and generate the registration function

At runtime:

1. Create the registry
2. register all data from steel
3. register all data from plugins (TODO)
4. freeze the registry
5. sync specific registries to the client

## Structure of the registries

In the registry file is also the data struct declared which the registry contains and a public ref type of this struct.
It will look like this:
```rust
struct Element;

pub type ElementRef = &'static Element;
```

## Create own registry

## Create own build script for registry

## Sync registries

The Minecraft client, want's to have some registries synced, this will be done in the file
`steel-core/src/server/registry_cache.rs`.
At first the registries entries will be synced in the function `build_registry_packets` via the macro `add_registry`.
This macro requires that the registry needs to implement the trait `ToNbtTag`. The important part here is the registry
needs to be implement the trait as reference, like in the banner pattern registry: `impl ToNbtTag for &BannerPattern`

After syncing the registries, the tags will be send to the client, this will be done in the same file but in the
function `build_tags_packet`.
This is again done via a macro named `add_tags`. For using that macro, the registry needs to have tags correctly
implemented!

So both syncs will be done in the login process. So all synced registries can be modified and the vanilla client,
support these new elements. So server side modding, is possible currently with Steel.