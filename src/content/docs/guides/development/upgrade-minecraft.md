---
title: How to upgrade minecraft version
description: Minecraft version upgrade guideline
---

This guide explains everything you need to upgrade the Minecraft version of Steel.
It also gives you points to check if you need deeper understanding.

As you may be able to guess, upgrading the steel project to a new minecraft version is not a simple task, so please take your time!

What knowledge is required?

- Java (no joke) and Rust
- gradle, will help

To upgrade steel, we need all information from minecraft for this new version. That means the upgrading process starts at the SteelExtrator.
If you don't know what that is, you may find all the relevant information [here](../tools/steel_extractor).

In order to ensure a smooth transition and minimize workload, it is recommended to begin the upgrade process while only snapshot versions are yet available.

## 1. Changing the Minecraft Version of SteelExtractor

The Minecraft version and all related dependency versions are configured in `gradle.properties`:

```properties
minecraft_version=26.1-snapshot-11
loader_version=0.18.4
loom_version=1.15-SNAPSHOT
fabric_kotlin_version=1.13.9+kotlin.2.3.10
```

To update to a new Minecraft version:

1. Change `minecraft_version` to the target version
2. Update `fabric_version` to a compatible Fabric API version for that Minecraft version
3. Update `loader_version` and `fabric_kotlin_version` if needed
4. If applicable, update the Parchment mapping version in `build.gradle`

You can find the correct versions on [https://fabricmc.net/develop](https://fabricmc.net/develop).

Then run minecraft and extract the data, as outlined [here](../tools/steel_extractor/).
For the 26.1 snapshots, the gradle system needed to change more and upgrade Java 21 to Java 25.
All files which were touched for this snapshot can be found here: https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. Coping the SteelExtractor jsons

move all json files to their correct location.
The mapping can be found [here](../tools/mappings)

## 3. Extract data from minecraft

get the jar from the newest minecraft version. This can be done with the launcher or the official download from mojang. after downloading the jar this archive needs to be extracted.
This reveals the following folder structure:

```
└── 📁minecraft-26.1-snapshot-11-client
​    └── 📁assets
​    └── 📁com
​    └── 📁data
​    └── 📁META-INF
​    └── 📁net
​    ├── flightrecorder-config.jfc
​    ├── pack.png
​    └── version.json
```

Now copy the data folder to: `steel-registry/build_assets/builtin_datapacks/minecraft/data`
And yes, the second minecraft folder is the same minecraft folder. So the structure is:

```
└── 📁build_assets
    └── 📁builtin_datapacks
        └── 📁minecraft
            └── 📁data
                └── 📁minecraft
                    └── 📁advancement
                    └── 📁equipment
                    └── 📁font
                    └── 📁frog_variant
                    └── 📁instrument
                    └── 📁items
                    ...
                    └── 📁zombie_nautilus_variant
                ├── .mcassetsroot
            ├── pack.mcmeta
    ├── attributes.json
    ├── block_entities.json
    ├── blocks.json
    ├── entities.json
    ├── fluids.json
    ├── game_rules.json
    ├── items.json
    ├── level_events.json
    ├── menutypes.json
    ├── mob_effects.json
    ├── multi_noise_biome_source_parameters.json
    ├── packets.json
    ├── potions.json
    ├── sound_events.json
    ├── sound_types.json
    └── tags.json
```

## 4. Repair registry

The repair process is divided into two steps.
In most cases, the registry is broken, which prevents Steel from building because some structures no longer match. Therefore, we start by fixing the registry.

The Steel registry consists of three folders.
One of them is `build_assets`, which we already worked with.
Another is `build`, which contains Rust files that generate other Rust files based on the contents of the JSON files. This is where the first step takes place.
It is recommended to run a `git diff` after copying the new files to see which files have changed and how the structure has been modified. This helps identify which registries need to be updated.
After that, apply the necessary changes in the `build` directory. Once done, you will likely encounter compilation errors again, but this time in the actual registries, since they have not been updated yet.
Apply the same structural changes there as well. After that, everything should compile correctly.

## 5. Repair the rest

This step involves fixing the remaining code and implementing any new features introduced in the new version. The exact work depends on the specific version, so happy upgrading!
