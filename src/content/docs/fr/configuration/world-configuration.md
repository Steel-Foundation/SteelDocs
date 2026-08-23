---
title: Configuration des mondes du serveur
description: Référence complète de toutes les options de configuration des mondes du serveur dans SteelMC
sidebar:
  order: 3
---

La configuration des [mondes](../../reference/terminology#monde) de SteelMC se fait via un fichier TOML situé dans `config/worlds.toml`. Cette page documente toutes les options de mondes, de
[domaines](../../reference/terminology#domaine), de [générateurs de monde](../../reference/terminology#générateur-de-monde) et de stockage.

## Réglages de base

| Option                | Type       | Défaut         | Description                                                             |
| --------------------- | ---------- | -------------- | ----------------------------------------------------------------------- |
| `save_path`           | String     | `"saves"`      | Dossier racine des [mondes](../../reference/terminology#monde) sauvegardés |
| `seed`                | String     | `""`           | Seed de génération du monde (vide = aléatoire)                          |
| `default_gamemode`    | String     | `"survival"`   | Mode de jeu par défaut des nouvelles données de joueur                  |
| `difficulty`          | String     | `"normal"`     | Difficulté des nouvelles données de niveau                              |
| `storage.type`        | Identifier | `"steel:disk"` | Backend de stockage de monde par défaut                                 |
| `player_storage.type` | Identifier | `"steel:file"` | Backend de stockage des données de joueur                               |

Les valeurs `seed`, `default_gamemode`, `difficulty` et `storage` sont héritées de la racine vers les [domaines](../../reference/terminology#domaine), puis des domaines vers les mondes. Elles peuvent aussi être surchargées à chaque niveau, ce qui rend la configuration du serveur très souple.

Les modes de jeu valides sont `survival`, `creative`, `adventure` et `spectator`.
Les difficultés valides sont `peaceful`, `easy`, `normal` et `hard`.

:::caution
Lis cette section si la terminologie de Steel ne t'est pas familière.
:::
Malheureusement, Mojang n'emploie pas les mêmes termes de façon cohérente dans sa base de code. `World`, `level` et `map` peuvent désigner la même chose en interne. Steel ajoute par ailleurs nativement certaines fonctionnalités de [Multiverse](https://modrinth.com/plugin/multiverse-core). Pour décrire tout cela clairement, Steel a introduit un nouveau terme : les domaines.
Le glossaire couvre également la [dimension](../../reference/terminology#dimension) et le [générateur de monde](../../reference/terminology#générateur-de-monde), utilisés ci-dessous.

## Domaines

Il faut au moins un [domaine](../../reference/terminology#domaine), et exactement un domaine doit être celui par défaut.

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| Option                              | Type   | Défaut  | Description                                                                       |
| ----------------------------------- | ------ | ------- | --------------------------------------------------------------------------------- |
| `domains.<domaine>.worlds`           | Tableau | Aucun  | **[REQUIS]** [Mondes](../../reference/terminology#monde) contenus dans ce domaine |
| `domains.<domaine>.default`          | bool   | `false` | Indique s'il s'agit du domaine par défaut                                         |
| `domains.<domaine>.seed`             | String | hérité  | Surcharge de la seed du domaine                                                   |
| `domains.<domaine>.default_gamemode` | String | hérité  | Surcharge du mode de jeu du domaine                                               |
| `domains.<domaine>.difficulty`       | String | hérité  | Surcharge de la difficulté du domaine                                             |
| `domains.<domaine>.storage`          | Table  | hérité  | Surcharge du stockage du domaine                                                  |

Le nom du domaine doit être un namespace d'identifiant valide. `global` est réservé et ne peut pas être utilisé.

## Mondes

Chaque [domaine](../../reference/terminology#domaine) a besoin d'au moins un [monde](../../reference/terminology#monde) et d'exactement un monde par défaut.

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
storage.type = "steel:ram"
```

| Option                 | Type       | Défaut     | Description                                                                                                                                |
| ---------------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                 | String     | Aucun      | **[REQUIS]** Nom du monde à l'intérieur du domaine                                                                                         |
| `generator`            | Identifier | Aucun      | **[REQUIS]** [Générateur de monde](../../reference/terminology#générateur-de-monde) à utiliser, les options sont dans la section suivante   |
| `default`              | bool       | `false`    | Indique s'il s'agit du monde par défaut du domaine                                                                                         |
| `seed`                 | String     | hérité     | Surcharge de la seed du monde                                                                                                              |
| `default_gamemode`     | String     | hérité     | Surcharge du mode de jeu du monde                                                                                                          |
| `difficulty`           | String     | hérité     | Surcharge de la difficulté du monde                                                                                                        |
| `storage`              | Table      | hérité     | Surcharge du stockage du monde                                                                                                             |
| `nether_portal_target` | String     | automatique | Nom du monde du même domaine ciblé par les portails du Nether depuis ce monde                                                             |
| `end_portal_target`    | String     | automatique | Nom du monde de dimension End, dans le même domaine, ciblé par les portails de l'End depuis les mondes hors End                           |
| `config`               | Table      | `{}`       | Configuration propre au générateur                                                                                                         |

Les noms de mondes doivent être des chemins d'identifiant valides, ne peuvent pas contenir `/` et doivent être uniques au sein du domaine.

## Cibles des portails

Les portails sont résolus à l'intérieur du [domaine](../../reference/terminology#domaine) du monde d'origine. Si aucune cible explicite n'est configurée, Steel utilise les noms de mondes conventionnels de vanilla :

- Les portails du Nether depuis `the_nether` ciblent `overworld`
- Les portails du Nether depuis n'importe quel autre monde ciblent `the_nether`
- Les portails de l'End depuis les mondes hors End ciblent `the_end`
- Les retours de portail de l'End depuis les mondes de dimension End utilisent les données de réapparition de l'entité ou du joueur, et non `end_portal_target`

Ces noms conventionnels permettent à une configuration classique `overworld`, `the_nether` et `the_end` de fonctionner sans configuration supplémentaire. Si tu utilises d'autres noms de mondes, configure des cibles explicites.

```toml
[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld2"
generator = "minecraft:overworld"
default = true
nether_portal_target = "the_nether2"
end_portal_target = "the_end2"

[[domains.minecraft.worlds]]
name = "the_nether2"
generator = "minecraft:the_nether"
nether_portal_target = "overworld2"

[[domains.minecraft.worlds]]
name = "the_end2"
generator = "minecraft:the_end"
```

Les champs de cible de portail attendent un nom de monde, pas un identifiant complet `namespace:chemin`. Ils ne peuvent pas pointer vers un autre domaine, ni vers le monde lui-même, et doivent pointer vers un monde déclaré dans le même domaine. `end_portal_target` est invalide sur les mondes utilisant la dimension End, et doit pointer vers un monde dont le générateur utilise la dimension End.

## Générateurs

Steel fournit ces [générateurs de monde](../../reference/terminology#générateur-de-monde) intégrés :

| Générateur             | Configuration                            |
| ---------------------- | ---------------------------------------- |
| `minecraft:overworld`  | N'accepte aucune table de configuration  |
| `minecraft:the_nether` | N'accepte aucune table de configuration  |
| `minecraft:the_end`    | N'accepte aucune table de configuration  |
| `minecraft:flat`       | Configuration de monde plat optionnelle  |
| `steel:empty`          | Nécessite `config.dimension_type`        |

### Générateur de monde Minecraft

Les [générateurs](../../reference/terminology#générateur-de-monde) `minecraft:overworld`, `minecraft:the_nether` et `minecraft:the_end` n'ont pas de configuration. Ils produisent des [mondes](../../reference/terminology#monde) avec parité vanilla pour leurs [dimensions](../../reference/terminology#dimension).

### Générateur de monde plat

Le [générateur de monde](../../reference/terminology#générateur-de-monde) `minecraft:flat` accepte une table `config` optionnelle. Sans elle, Steel utilise la [dimension](../../reference/terminology#dimension) Overworld, une pile de couches superplates de style vanilla et les surcharges de structures par défaut.

| Option                | Type                        | Défaut                             | Description                                                                     |
| --------------------- | --------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| `layers[].block`      | Identifier                  | Aucun                              | **[REQUIS]** Bloc utilisé par cette couche                                      |
| `layers[].height`     | Entier                      | Aucun                              | **[REQUIS]** Hauteur de cette couche, doit être supérieure à `0`                |
| `dimension_type`      | Identifier                  | `"minecraft:overworld"`            | Type de dimension utilisé par le [monde](../../reference/terminology#monde) plat |
| `layers`              | Tableau de tables de couches | bedrock 1, terre 2, bloc d'herbe 1 | Blocs générés de bas en haut                                                    |
| `features`            | Booléen                     | `false`                            | Générer ou non les éléments de décoration. `true` n'est pas encore implémenté   |
| `lakes`               | Booléen                     | `false`                            | Générer ou non les lacs. `true` n'est pas encore implémenté                     |
| `structure_overrides` | Tableau d'Identifier        | strongholds et villages            | Structures autorisées dans ce monde plat                                        |

Les couches par défaut sont `minecraft:bedrock` avec une hauteur de `1`, `minecraft:dirt` avec une hauteur de `2` et `minecraft:grass_block` avec une hauteur de `1`.
Les `structure_overrides` par défaut sont `minecraft:strongholds` et `minecraft:villages`.

Des couches personnalisées peuvent s'écrire avec des tables de couches répétées ou des tables de couches en ligne.

#### Tables de couches répétées

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

#### Tables de couches en ligne

```toml
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

### Générateur de monde vide

L'élément important d'un [générateur de monde](../../reference/terminology#générateur-de-monde) vide est sa configuration, qui définit `dimension_type`. Ce champ sélectionne la [dimension](../../reference/terminology#dimension) et ses propriétés, comme la hauteur en Y et le brouillard.

```toml
[domains.empty]
default = true
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "void"
generator = "steel:empty"
default = true

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## Stockage

Steel fournit ces backends de stockage de [monde](../../reference/terminology#monde) intégrés. Le stockage peut être défini pour tout le serveur, par [domaine](../../reference/terminology#domaine) et par monde. Par exemple, l'ensemble du serveur peut utiliser le stockage en RAM, un domaine peut malgré tout utiliser le stockage sur disque et être sauvegardé, et un monde de ce domaine peut à son tour utiliser le stockage en RAM. Cela offre une souplesse maximale pour configurer le stockage selon les besoins.

:::caution
Le stockage en RAM signifie que le monde entier reste en mémoire et n'est jamais sauvegardé. La RAM peut donc se remplir vite. Le stockage en RAM est recommandé pour les mini-jeux, combiné au [générateur de monde](../../reference/terminology#générateur-de-monde) vide.
:::

| Stockage     | Configuration                                       |
| ------------ | --------------------------------------------------- |
| `steel:disk` | `config.path` optionnel, relatif à `save_path`      |
| `steel:ram`  | Aucune configuration, les chunks ne sont pas sauvegardés |

Le stockage des données de joueur ne prend actuellement en charge que `steel:file`.

Exemple de surcharge du chemin sur disque :

```toml
[[domains.minecraft.worlds]]
name = "testing"
generator = "minecraft:overworld"

[domains.minecraft.worlds.storage]
type = "steel:disk"

[domains.minecraft.worlds.storage.config]
path = "custom/testing"
```

## Exemple de configuration

Cette section montre d'abord la configuration par défaut générée au premier démarrage. La seconde configuration reprend les concepts ci-dessus pour construire une installation avec trois [domaines](../../reference/terminology#domaine), des modes de jeu différents, des réglages de stockage variés et de la configuration de [générateur de monde](../../reference/terminology#générateur-de-monde).

### Configuration simple

Voici la configuration par défaut de `worlds.toml`, qui crée un [monde](../../reference/terminology#monde) de survie classique.

```toml
# /config/worlds.toml

# Valeurs par défaut de la racine, héritées par les domaines et les mondes sauf surcharge.
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

# Les mondes peuvent définir les champs `nether_portal_target` et
# `end_portal_target` du même domaine pour surcharger les noms conventionnels de vanilla.
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

### Configuration multidomaine étendue

Elle comporte de nombreux réglages différents, expliqués plus haut.
Ici, le [domaine](../../reference/terminology#domaine) `minecraft` est sur disque, tout comme le [monde](../../reference/terminology#monde) `the_nether` du domaine `flat`. Les domaines `empty` et `minecraft` utilisent le mode survie, tandis que le domaine `flat` utilise le mode créatif.

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

## Règles de validation

Le serveur valide la configuration des mondes au démarrage :

- les champs inconnus sont rejetés
- au moins un [domaine](../../reference/terminology#domaine) doit être déclaré
- exactement un domaine doit définir `default = true`
- chaque domaine doit déclarer au moins un [monde](../../reference/terminology#monde)
- chaque domaine doit avoir exactement un monde par défaut
- les noms de domaines doivent être des namespaces d'identifiant valides
- le nom de domaine `global` est réservé
- les noms de mondes doivent être des chemins d'identifiant valides et ne peuvent pas contenir `/`
- `save_path` et les chemins de stockage doivent être des chemins relatifs propres
- les [générateurs](../../reference/terminology#générateur-de-monde) et les backends de stockage doivent être connus de Steel
- `nether_portal_target` et `end_portal_target` doivent pointer vers un monde existant du même domaine et ne peuvent pas cibler le monde d'origine
- `end_portal_target` ne peut pas être défini sur les mondes de dimension End
- `end_portal_target` doit cibler un monde de dimension End
- `minecraft:flat` nécessite au moins une couche, et `features = true` ou `lakes = true` ne sont pas encore implémentés

Si la validation échoue, le serveur s'arrête avec un message d'erreur.
