---
title: Comment monter de version Minecraft
description: Marche à suivre pour la montée de version Minecraft
---

Ce guide explique tout ce qu'il faut pour faire monter Steel vers une nouvelle version de Minecraft.
Il te donne aussi des points à consulter si tu as besoin d'aller plus loin.

Comme tu peux t'en douter, faire monter le projet Steel vers une nouvelle version de Minecraft n'est pas une mince affaire, alors prends ton temps !

Quelles connaissances sont nécessaires ?

- Java (sans blague) et Rust
- Gradle, ça aide

Pour faire monter Steel, il nous faut toutes les informations de Minecraft pour cette nouvelle version. Le processus commence donc par le SteelExtractor.
Si tu ne sais pas ce que c'est, tu trouveras toutes les informations utiles [ici](../tools/steel_extractor).

Pour que la transition se passe bien et pour limiter la charge de travail, il est recommandé de démarrer la montée de version dès que seules des snapshots sont disponibles.

## 1. Changer la version de Minecraft du SteelExtractor

La version de Minecraft et toutes les versions de dépendances associées se configurent dans `gradle.properties` :

```properties
minecraft_version=26.1-snapshot-11
loader_version=0.18.4
loom_version=1.15-SNAPSHOT
fabric_kotlin_version=1.13.9+kotlin.2.3.10
```

Pour passer à une nouvelle version de Minecraft :

1. Change `minecraft_version` pour la version visée
2. Mets à jour `fabric_version` avec une version de l'API Fabric compatible avec cette version de Minecraft
3. Mets à jour `loader_version` et `fabric_kotlin_version` si nécessaire
4. Le cas échéant, mets à jour la version des mappings Parchment dans `build.gradle`

Tu trouveras les bonnes versions sur [https://fabricmc.net/develop](https://fabricmc.net/develop).

Lance ensuite Minecraft et extrais les données, comme décrit [ici](../tools/steel_extractor/).
Pour les snapshots de la 26.1, le système Gradle a demandé davantage de changements, dont le passage de Java 21 à Java 25.
Tous les fichiers touchés pour cette snapshot sont visibles ici : https://github.com/JunkyDeveloper/SteelExtractor/commit/992ae692f8dcab02edba96308d30422f43f1961e

---

## 2. Copier les JSON du SteelExtractor

Déplace tous les fichiers JSON à leur emplacement correct. Dans la version la plus récente, le dossier `run` contient déjà des dossiers strictement identiques à ceux de Steel.

## 3. Extraire les données de Minecraft

Récupère le jar de la dernière version de Minecraft. Tu peux le faire via le launcher ou par le téléchargement officiel de Mojang. Une fois le jar téléchargé, il faut extraire cette archive.
On obtient la structure de dossiers suivante :

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

Copie maintenant le dossier `data` vers `steel-registry/build_assets/builtin_datapacks/minecraft/data`.
Et oui, le second dossier `minecraft` est bien le même dossier `minecraft`. La structure est donc :

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

## 4. Réparer le registre

La réparation se fait en deux étapes.
Dans la plupart des cas, le registre est cassé, ce qui empêche Steel de compiler parce que certaines structures ne correspondent plus. On commence donc par réparer le registre.

Le registre de Steel se compose de trois dossiers.
L'un est `build_assets`, avec lequel nous avons déjà travaillé.
Un autre est `build`, qui contient des fichiers Rust qui génèrent d'autres fichiers Rust à partir du contenu des fichiers JSON. C'est là que se déroule la première étape.
Il est recommandé de lancer un `git diff` après avoir copié les nouveaux fichiers, pour voir quels fichiers ont changé et comment la structure a été modifiée. Cela aide à repérer quels registres doivent être mis à jour.
Applique ensuite les changements nécessaires dans le dossier `build`. Une fois cela fait, tu rencontreras probablement de nouvelles erreurs de compilation, mais cette fois dans les registres eux-mêmes, puisqu'ils n'ont pas encore été mis à jour.
Applique-y les mêmes changements de structure. Après ça, tout devrait compiler correctement.

## 5. Réparer le reste

Cette étape consiste à corriger le code restant et à implémenter les nouveautés apportées par la nouvelle version. Le travail exact dépend de la version concernée, alors bonne montée de version !
