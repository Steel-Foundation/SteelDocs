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
It's very easy: build it from the command line (`./gradlew runServer`), or simply click the Run button (Minecraft server) in your IDE of choice (e.g., IntelliJ). This will start the minecraft server and the extraction will be started automatically, the extraction of the world hashes can take up to 30min.

This will create a `steel_extractor_output/` folder in the server working directory. There, you'll find all generated JSON and binary files, which Steel needs as a reference to vanilla.
Not all output files are copied to the same directory in Steel. Check the mapping first before you move something.

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

The following table lists all current extractors and what data they produce. Output paths are relative to `steel_extractor_output/`.

| Extractor | Output File | Description |
| --- | --- | --- |
| `Blocks` | `steel-registry/build_assets/blocks.json` | All blocks with behavior properties, block states, default values, collision and outline shapes |
| `BlockEntities` | `steel-registry/build_assets/block_entities.json` | Registry keys of all block entity types |
| `Items` | `steel-registry/build_assets/items.json` | All items with components, block references, and class names |
| `ParticleTypeRegistryExtractor` | `steel-registry/build_assets/particle_types.json` | Particle type registry keys |
| `VillagerTypeRegistryExtractor` | `steel-registry/build_assets/villager_types.json` | Villager type registry keys |
| `VillagerProfessionRegistryExtractor` | `steel-registry/build_assets/villager_professions.json` | Villager profession registry keys |
| `Packets` | `steel-registry/build_assets/packets.json` | All serverbound and clientbound packets grouped by protocol phase |
| `MenuTypes` | `steel-registry/build_assets/menutypes.json` | All menu/GUI types, such as crafting table and furnace |
| `Entities` | `steel-registry/build_assets/entities.json` | Entities with dimensions, synched data, attributes, and behavior flags |
| `EntityEvents` | `steel-utils/build_assets/entity_events.json` | Entity event constants |
| `Fluids` | `steel-registry/build_assets/fluids.json` | All fluids with behavior properties and state data |
| `GameRulesExtractor` | `steel-registry/build_assets/game_rules.json` | All game rules with types, defaults, and bounds |
| `Classes` | `steel-core/build/classes.json` | Java class names for all blocks and items, plus extra per-entry metadata when available |
| `Attributes` | `steel-registry/build_assets/attributes.json` | Entity attributes with defaults, ranges, and sync info |
| `MobEffects` | `steel-registry/build_assets/mob_effects.json` | Status effects with categories and colors |
| `Potions` | `steel-registry/build_assets/potions.json` | Potions with their effects, durations, and amplifiers |
| `SoundTypes` | `steel-registry/build_assets/sound_types.json` | Block sound types with volume, pitch, and sound event references |
| `SoundEvents` | `steel-registry/build_assets/sound_events.json` | Mapping of all sound event paths to registry IDs |
| `MultiNoiseBiomeParameters` | `steel-registry/build_assets/multi_noise_biome_source_parameters.json` | Multi-noise biome source parameter lists |
| `BiomeHashes` | `steel-core/test_assets/biome_hashes.json` | Deterministic biome hash fixtures used by Steel tests |
| `LevelEvents` | `steel-registry/build_assets/level_events.json` | All level event constants, including particles and sounds |
| `Tags` | `steel-registry/build_assets/tags.json` | Block and item tags excluding the `minecraft` namespace |
| `StructureStarts` | `steel-core/test_assets/structure_starts.json` | Structure start fixtures used by Steel tests |
| `Strippables` | `steel-core/build/strippables.json` | Block mappings for axe stripping behavior |
| `Weathering` | `steel-core/build/weathering.json` | Block mappings for copper weathering behavior |
| `CandleCakes` | `steel-core/build/candle_cakes.json` | Candle-to-candle-cake block mappings |
| `Waxables` | `steel-core/build/waxables.json` | Block mappings for waxed variants |
| `PoiTypesExtractor` | `steel-registry/build_assets/poi_types.json` | Point of interest type registry data |
| `GameEvents` | `steel-registry/build_assets/game_events.json` | Game event registry keys |
| `ChunkStageHashes` | `steel-core/test_assets/chunk_stage_hashes.json` and `steel-core/test_assets/chunk_stage_*_blocks.bin.gz` | Chunk generation stage hashes and binary block dumps for sampled chunks |

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

To register your new extractor, add it to the `immediateExtractors` array in `SteelExtractor.kt`:

```kotlin
val immediateExtractors = arrayOf(
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
