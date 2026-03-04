---
title: How to upgrade minecraft version
description: A guide which gives a guideline of how to upgrade the minecraft version for steel
---

In this guide you will learn everthing which is needed to upgrade the minecraft version of steel!
It also gives you points to check if you need deeper understanding.

As you maybe already thing, upgrading a minecraft version is not a simple task which is done in 5min, so please take yourself some time!

What knowledge is required?
- Java (no joke) and Rust
- gradle, will help

To upgrade steel, we need all information from minecraft for this new version. That means the upgrading process starts at the SteelExtrator.
If you don't know what that does, [here](./tools/steel_extractor.md) are some information about it.

To make it not that intense, it is recommended to start already in the snapshots!

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

Then run minecraft and extract the data.
For the 26.1 snapshots, the gradle system needed to change more and upgrade Java 21 to Java 25.
All files which were touched for this snapshot can be found here: https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. Coping the SteelExtractor jsons
move all json files to their correct location.
The mapping can be found [here](./tools/mappings.md)

## 3. Extract data from minecraft

