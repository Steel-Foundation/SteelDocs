---
title: Steel Extractor
description: Un mod Fabric utilisé pour extraire les données de jeu de Minecraft vers des fichiers JSON.
sidebar:
  order: 0
---

Le **Steel Extractor** est un mod [Fabric](https://fabricmc.net/) écrit en Kotlin qui tourne sur un serveur Minecraft et extrait un large ensemble de données de jeu vers des fichiers JSON. C'est l'outil principal servant à générer les fichiers de données dont Steel dépend.

Le mod s'accroche au cycle de démarrage du serveur et lance automatiquement tous les extracteurs une fois le serveur entièrement chargé. La sortie est écrite dans le dossier `steel_extractor_output/`, en JSON formaté.

---

## Comment l'utiliser

Il faut d'abord créer le répertoire d'exécution.
C'est très simple : compile depuis la ligne de commande (`./gradlew runServer`), ou clique simplement sur le bouton Run (serveur Minecraft) dans l'IDE de ton choix (IntelliJ par exemple). Cela démarre le serveur Minecraft et lance l'extraction automatiquement. L'extraction des hachages de monde peut prendre jusqu'à 30 minutes.

Un dossier `steel_extractor_output/` est créé dans le répertoire de travail du serveur. Tu y trouveras tous les fichiers JSON et binaires générés, dont Steel a besoin comme référence vis-à-vis de vanilla.
Tous les fichiers de sortie ne se copient pas au même endroit dans Steel. Vérifie la correspondance avant de déplacer quoi que ce soit.

Pour désactiver un extracteur donné, place la variable d'environnement correspondante à `true` avant de démarrer le serveur. Par exemple, pour désactiver l'extracteur `Blocks` :

```bash
export STEEL_EXTRACTOR_DISABLE_BLOCKS=true
```

Pour désactiver la longue extraction des chunks, utilise la variable d'environnement suivante :

```bash
export STEEL_EXTRACTOR_ENABLE_CHUNK_EXTRACTION=false
```

Tu peux aussi demander au serveur de s'arrêter une fois l'extracteur arrivé au bout, avec la variable d'environnement suivante :

```bash
export STEEL_EXTRACTOR_EXIT_ON_COMPLETE=true
```

## Comment ça marche

L'extracteur s'abonne à l'événement `SERVER_STARTED`. Quand le serveur a fini de charger, il parcourt tous les extracteurs enregistrés, appelle leur méthode `extract()` et écrit le résultat dans un fichier JSON.

Chaque extracteur implémente l'interface `Extractor` :

```kotlin
interface Extractor {
    fun fileName(): String

    @Throws(Exception::class)
    fun extract(server: MinecraftServer): JsonElement
}
```

---

## Données extraites

Le tableau suivant liste tous les extracteurs actuels, les données qu'ils produisent et la variable d'environnement qui permet de les désactiver. Les chemins de sortie sont relatifs à `steel_extractor_output/`.

| Extracteur | Fichier de sortie | Description | Variable d'environnement |
| --- | --- | --- | --- |
| `Blocks` | `steel-registry/build_assets/blocks.json` | Tous les blocs avec leurs propriétés de comportement, états de bloc, valeurs par défaut, formes de collision et de contour | `STEEL_EXTRACTOR_DISABLE_BLOCKS` |
| `BlockEntities` | `steel-registry/build_assets/block_entities.json` | Clés de registre de tous les types de block entity | `STEEL_EXTRACTOR_DISABLE_BLOCK_ENTITIES` |
| `Items` | `steel-registry/build_assets/items.json` | Tous les items avec leurs composants, références de blocs et noms de classes | `STEEL_EXTRACTOR_DISABLE_ITEMS` |
| `ParticleTypeRegistryExtractor` | `steel-registry/build_assets/particle_types.json` | Clés de registre des types de particules | `STEEL_EXTRACTOR_DISABLE_PARTICLE_TYPES` |
| `VillagerTypeRegistryExtractor` | `steel-registry/build_assets/villager_types.json` | Clés de registre des types de villageois | `STEEL_EXTRACTOR_DISABLE_VILLAGER_TYPES` |
| `VillagerProfessionRegistryExtractor` | `steel-registry/build_assets/villager_professions.json` | Clés de registre des métiers de villageois | `STEEL_EXTRACTOR_DISABLE_VILLAGER_PROFESSIONS` |
| `Packets` | `steel-registry/build_assets/packets.json` | Tous les paquets serverbound et clientbound, groupés par phase de protocole | `STEEL_EXTRACTOR_DISABLE_PACKETS` |
| `MenuTypes` | `steel-registry/build_assets/menutypes.json` | Tous les types de menu/GUI, comme la table de craft et le four | `STEEL_EXTRACTOR_DISABLE_MENU_TYPES` |
| `Entities` | `steel-registry/build_assets/entities.json` | Entités avec leurs dimensions, données synchronisées, attributs et drapeaux de comportement | `STEEL_EXTRACTOR_DISABLE_ENTITIES` |
| `EntityEvents` | `steel-utils/build_assets/entity_events.json` | Constantes d'événements d'entité | `STEEL_EXTRACTOR_DISABLE_ENTITY_EVENTS` |
| `Fluids` | `steel-registry/build_assets/fluids.json` | Tous les fluides avec leurs propriétés de comportement et leurs données d'état | `STEEL_EXTRACTOR_DISABLE_FLUIDS` |
| `GameRulesExtractor` | `steel-registry/build_assets/game_rules.json` | Toutes les gamerules avec leurs types, valeurs par défaut et bornes | `STEEL_EXTRACTOR_DISABLE_GAME_RULES` |
| `Classes` | `steel-core/build/classes.json` | Noms de classes Java de tous les blocs et items, plus des métadonnées supplémentaires par entrée lorsqu'elles existent | `STEEL_EXTRACTOR_DISABLE_CLASSES` |
| `Attributes` | `steel-registry/build_assets/attributes.json` | Attributs d'entité avec leurs valeurs par défaut, plages et informations de synchronisation | `STEEL_EXTRACTOR_DISABLE_ATTRIBUTES` |
| `MobEffects` | `steel-registry/build_assets/mob_effects.json` | Effets de statut avec leurs catégories et couleurs | `STEEL_EXTRACTOR_DISABLE_MOB_EFFECTS` |
| `Potions` | `steel-registry/build_assets/potions.json` | Potions avec leurs effets, durées et amplificateurs | `STEEL_EXTRACTOR_DISABLE_POTIONS` |
| `SoundTypes` | `steel-registry/build_assets/sound_types.json` | Types de sons de blocs avec volume, hauteur et références d'événements sonores | `STEEL_EXTRACTOR_DISABLE_SOUND_TYPES` |
| `SoundEvents` | `steel-registry/build_assets/sound_events.json` | Correspondance entre tous les chemins d'événements sonores et les identifiants de registre | `STEEL_EXTRACTOR_DISABLE_SOUND_EVENTS` |
| `MultiNoiseBiomeParameters` | `steel-registry/build_assets/multi_noise_biome_source_parameters.json` | Listes de paramètres des sources de biomes multi-bruit | `STEEL_EXTRACTOR_DISABLE_MULTI_NOISE_BIOME_PARAMETERS` |
| `BiomeHashes` | `steel-core/test_assets/biome_hashes.json` | Fixtures déterministes de hachages de biomes utilisées par les tests de Steel | `STEEL_EXTRACTOR_DISABLE_BIOME_HASHES` |
| `LevelEvents` | `steel-registry/build_assets/level_events.json` | Toutes les constantes d'événements de niveau, particules et sons compris | `STEEL_EXTRACTOR_DISABLE_LEVEL_EVENTS` |
| `Tags` | `steel-registry/build_assets/tags.json` | Tags de blocs et d'items, hors namespace `minecraft` | `STEEL_EXTRACTOR_DISABLE_TAGS` |
| `StructureStarts` | `steel-core/test_assets/structure_starts.json` | Fixtures de départs de structures utilisées par les tests de Steel | `STEEL_EXTRACTOR_DISABLE_STRUCTURE_STARTS` |
| `Strippables` | `steel-core/build/strippables.json` | Correspondances de blocs pour le comportement d'écorçage à la hache | `STEEL_EXTRACTOR_DISABLE_STRIPPABLES` |
| `Weathering` | `steel-core/build/weathering.json` | Correspondances de blocs pour le comportement d'oxydation du cuivre | `STEEL_EXTRACTOR_DISABLE_WEATHERING` |
| `CandleCakes` | `steel-core/build/candle_cakes.json` | Correspondances entre bougies et gâteaux à la bougie | `STEEL_EXTRACTOR_DISABLE_CANDLE_CAKES` |
| `Waxables` | `steel-core/build/waxables.json` | Correspondances de blocs pour les variantes cirées | `STEEL_EXTRACTOR_DISABLE_WAXABLES` |
| `PoiTypesExtractor` | `steel-registry/build_assets/poi_types.json` | Données de registre des types de points d'intérêt | `STEEL_EXTRACTOR_DISABLE_POI_TYPES` |
| `GameEvents` | `steel-registry/build_assets/game_events.json` | Clés de registre des événements de jeu | `STEEL_EXTRACTOR_DISABLE_GAME_EVENTS` |
| `ChunkStageHashes` | `steel-core/test_assets/chunk_stage_hashes.json` et `steel-core/test_assets/chunk_stage_*_blocks.bin.gz` | Hachages des étapes de génération de chunks et dumps binaires de blocs pour un échantillon de chunks | `STEEL_EXTRACTOR_DISABLE_CHUNK_STAGE_HASHES` |

---

## Écrire un extracteur simple

Voici un exemple minimal de création d'un nouvel extracteur. Celui-ci produit tous les attributs d'entité avec leurs valeurs par défaut :

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

Pour enregistrer ton nouvel extracteur, ajoute-le au tableau `immediateExtractors` dans `SteelExtractor.kt` :

```kotlin
val immediateExtractors = arrayOf(
    Blocks(),
    // ... autres extracteurs ...
    Attributes(),
    MyNewExtractor()  // Ajoute ton extracteur ici
)
```

Après le démarrage du serveur, la sortie apparaîtra dans `steel_extractor_output/attributes.json`.

---

## Autres ressources utiles

- [La réflexion dans les extracteurs](../reflection_extractor/) - Comment utiliser la réflexion Java pour accéder aux internes privés de Minecraft
