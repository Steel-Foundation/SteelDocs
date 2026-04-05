---
title: How do registries work
description: Deep dive into learning how to use and write a registry
---

# How do registries work?

All registries are in the cargo package `steel-registry`, which holds all the code to build and initialize everything
and save the data. To state it upfront: there are different types of registries — simple registries,
tagged registries, and complex registries.
This guide will only cover the simple and tagged registries, because the complex ones like blocks and items have many
parts and a lot more functionality than the majority of the registries. But after reading this guide, you should have
enough general understanding to work with those as well!

The package has 3 subfolders:

- `build`
- `build_assets`
- `src`

## Folder structure

This gives a short overview of all important folders in the steel-registry package.

### build_assets

This folder contains only JSON and NBT data, which are extracted via the extractor or from the Minecraft jar.
The `builtin_datapacks` folder is where the data from the Minecraft jar goes, which is only required for
upgrading Minecraft — you can find the guide [here](../upgrade-minecraft).
All JSON files in this directory are extracted from the [SteelExtractor](../tools/steel_extractor).

### build

This directory contains the build files, which convert the JSON files to Rust code to load the registries.
Most registries have their own build file — for example, the chicken variants registry has the build file `chicken_variants`.
Because this guide only focuses on how the registries work, it does not cover the build scripts.

### src

Here is where all registries are saved, and it is the main content of this guide.

## src/generated

This contains all generated Rust files from the build scripts, so all Rust files should not be edited manually here!

## Workflow

At build time:

1. Check if JSON files changed
2. Rebuild the Rust file, which defines all data and generates the registration function

At runtime:

1. Create the registry
2. Register all data from Steel
3. Register all data from plugins (TODO)
4. Freeze the registry
5. Sync specific registries to the client

### Define an element for the registry
The registry file also declares the data struct that the registry contains, along with a public ref type of this struct.
It will look like this:
```rust
struct Element;

pub type ElementRef = &'static Element;
```

The defined type is the type for the registry! This already gives a hint about how the data needs to be defined. So an element that needs to be stored in the registry needs to be defined statically at a location in steel/plugin — in Steel that will be in `src/generated`.

It can look like this:
```rust
pub static RHOMBUS: &BannerPattern = &BannerPattern {
    key: Identifier::vanilla_static("rhombus"),
    asset_id: Identifier {
        namespace: Cow::Borrowed("minecraft"),
        path: Cow::Borrowed("rhombus"),
    },
    translation_key: "block.minecraft.banner.rhombus",
};
```
That also means all items in the registry are globally unique, and if two data elements are the same, they point to the same data on the stack. This allows checking with pointer equality — in the project, pointer equality is generally forbidden, but in this case it is allowed. However, please override the `PartialEq` trait so that `==` can be used in the rest of the code!

### Create the registry

In `steel-registry/src/lib.rs`, a struct named `Registry` is defined with all registries that Steel has. That data exists only once and can be accessed via `REGISTRY` in the `steel-registry` crate.

### Register the elements in the registry

#### Steel

In `steel-registry/src/lib.rs`, the `Registry` struct has a function called `new_vanilla` which fills all registries.

#### Extensions (Plugins/Mods)
This is still a TODO and currently a work in progress.

### Freeze the registry

Similar to element registration, `Registry` has a method named `freeze` which calls freeze on all registries, preventing any further modification at that point.

### Sync registries

The Minecraft client wants to have some registries synced; this is done in the file
`steel-core/src/server/registry_cache.rs`.
First, the registry entries are synced in the function `build_registry_packets` via the macro `add_registry`.
This macro requires that the registry implements the trait `ToNbtTag`. The important part is that the registry
needs to implement the trait as a reference, like in the banner pattern registry: `impl ToNbtTag for &BannerPattern`

After syncing the registries, the tags are sent to the client; this is done in the same file in the
function `build_tags_packet`.
This is again done via a macro named `add_tags`. To use that macro, the registry needs to have tags correctly
implemented!

Both syncs happen during the login process, meaning all synced registries can be modified and the vanilla client
supports these new elements. So server-side modding is currently possible with Steel.

## How to use a registry


## Create own registry

## Create own build script for registry

