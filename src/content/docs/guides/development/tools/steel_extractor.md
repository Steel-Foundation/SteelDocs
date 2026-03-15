---
title: Steel Extractor
description: A Fabric mod used to extract game data from Minecraft into JSON files.
sidebar:
  order: 0
---

The **Steel Extractor** is a [Fabric](https://fabricmc.net/) mod written in Kotlin that runs on a Minecraft server and extracts comprehensive game data into JSON files. It is the primary tool used to generate the data files that Steel relies on.

The mod hooks into the server startup lifecycle and automatically runs all extractors once the server is fully loaded. The output is written to the `steel_extractor_output/` directory as pretty-printed JSON.

---

## How to use

At first you need to create the run directory.
It's very easy: build it from the command line, or simply click the Run button in your IDE of choice (e.g., IntelliJ).
Minecraft will start, create a new world, and you can join it.

This will create a folder called `steel-extractor`. There, you'll find all the generated json files, which steel needs as a reference to vanilla.
Not all json files are located in the same directory in steel. So please check the mapping first before you move something!

## How It Works

The extractor registers a `SERVER_STARTED` event. When the server finishes loading, it iterates through all registered extractors, calls their `extract()` method, and writes the result to a JSON file.

Every extractor implements the `Extractor` interface:

```kotlin
interface Extractor {
    fun fileName(): String

    @Throws(Exception::class)
    fun extract(server: MinecraftServer): JsonElement
}
```

---

## Extracted Data

The following table lists all extractors and what data they produce:

| Extractor            | Output File           | Description                                                                                     |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `Blocks`             | `blocks.json`         | All blocks with behavior properties, block states, default values, collision and outline shapes |
| `BlockEntities`      | `block_entities.json` | Registry keys of all block entity types                                                         |
| `Items`              | `items.json`          | All items with components, block references, and class names                                    |
| `Packets`            | `packets.json`        | All serverbound and clientbound packets grouped by protocol phase                               |
| `MenuTypes`          | `menutypes.json`      | All menu/GUI types (e.g. crafting table, furnace)                                               |
| `Entities`           | `entities.json`       | Entities with dimensions, synched data, attributes, and behavior flags                          |
| `Fluids`             | `fluids.json`         | All fluids with behavior properties and state data                                              |
| `GameRulesExtractor` | `game_rules.json`     | All game rules with types, defaults, and bounds                                                 |
| `Classes`            | `classes.json`        | Java class names for all blocks and items                                                       |
| `Attributes`         | `attributes.json`     | Entity attributes with defaults, ranges, and sync info                                          |
| `MobEffects`         | `mob_effects.json`    | Status effects with categories and colors                                                       |
| `Potions`            | `potions.json`        | Potions with their effects, durations, and amplifiers                                           |
| `SoundTypes`         | `sound_types.json`    | Block sound types with volume, pitch, and sound event references                                |
| `SoundEvents`        | `sound_events.json`   | Mapping of all sound event paths to registry IDs                                                |
| `LevelEvents`        | `level_events.json`   | All level event constants (particles, sounds)                                                   |
| `Tags`               | `tags.json`           | Block and item tags (excluding the `minecraft` namespace)                                       |

---

## Writing a Simple Extractor

Here is a minimal example of how to create a new extractor. This extractor outputs all entity attributes with their default values:

```kotlin
package com.steelextractor.extractors

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.steelextractor.SteelExtractor
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.server.MinecraftServer

class Attributes : SteelExtractor.Extractor {

    override fun fileName(): String {
        return "attributes.json"
    }

    override fun extract(server: MinecraftServer): JsonElement {
        val attributesArray = JsonArray()

        for (attribute in BuiltInRegistries.ATTRIBUTE) {
            val key = BuiltInRegistries.ATTRIBUTE.getKey(attribute)
            val name = key?.path ?: "unknown"

            val attributeJson = JsonObject()
            attributeJson.addProperty("id", BuiltInRegistries.ATTRIBUTE.getId(attribute))
            attributeJson.addProperty("name", name)
            attributeJson.addProperty("default_value", attribute.defaultValue)

            attributesArray.add(attributeJson)
        }

        return attributesArray
    }
}
```

To register your new extractor, add it to the `extractors` array in `SteelExtractor.kt`:

```kotlin
val extractors = arrayOf(
    Blocks(),
    // ... other extractors ...
    Attributes(),
    MyNewExtractor()  // Add your extractor here
)
```

After starting the server, the output will appear in `steel_extractor_output/attributes.json`.

---

## Other useful resources

- [Reflection in Extractors](../tools/reflection_extractor) - How to use Java reflection to access private Minecraft internals
