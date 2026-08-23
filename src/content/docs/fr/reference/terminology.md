---
title: Terminologie
description: Les termes courants de Steel pour les mondes et la configuration
sidebar:
  order: 1
---

Steel emploie certains termes différemment de Minecraft vanilla et des noms internes de Mojang. Cette page est un petit glossaire des termes de monde et de configuration utilisés dans la documentation.

## Aide-mémoire

| Terme                                       | Signification                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Identifiant](#identifiant)                 | Un nom unique `namespace:chemin` utilisé pour les valeurs Minecraft et Steel            |
| [Domaine](#domaine)                         | Un ensemble de mondes liés, partageant les données de joueur et les valeurs par défaut  |
| [Monde](#monde)                             | Une carte jouable à l'intérieur d'un domaine                                            |
| [Dimension](#dimension)                     | Le jeu de règles et les propriétés visuelles utilisés par un monde                      |
| [Générateur de monde](#générateur-de-monde) | Le système qui crée le terrain et qui choisit ou accepte un type de dimension           |
| [Cible de portail](#cible-de-portail)       | Le monde du même domaine vers lequel un portail envoie les entités                      |

## Identifiant

Un **identifiant** est un nom composé d'un namespace et d'un chemin, écrit `namespace:chemin`.

Par exemple `minecraft:overworld`, `minecraft:flat`, `minecraft:stone`, `minecraft:stick` et `steel:disk`.

Steel utilise des identifiants pour des valeurs comme les générateurs de monde, les types de dimension, les backends de stockage, les blocs et les items. Un identifiant doit être unique dans le registre ou le contexte de configuration où il est utilisé.

Les noms de domaines utilisent la partie namespace. Les noms de mondes utilisent la partie chemin.

## Domaine

Un **domaine** est un ensemble de mondes qui vont ensemble. C'est le niveau le plus haut de `worlds.toml`.

Les réglages de niveau domaine, comme la seed, le mode de jeu par défaut, la difficulté et le stockage, peuvent être hérités par tous les mondes de ce domaine. Les données de joueur sont elles aussi rattachées au domaine. Changer de domaine revient à peu près à changer de serveur, puisque les données de joueur ne franchissent pas les frontières d'un domaine.

Exemple : une installation de style vanilla comporte en général un seul domaine `minecraft` contenant l'Overworld, le Nether et l'End.

## Monde

Un **monde** est une carte jouable à l'intérieur d'un domaine.

Dans Minecraft vanilla, on parle le plus souvent de l'Overworld, du Nether ou de l'End. Steel peut définir davantage de mondes que vanilla. Un même domaine peut par exemple contenir `overworld`, `overworld_2` et `testing`.

Chaque monde choisit un générateur de monde. Un monde peut aussi surcharger les réglages hérités de son domaine, comme la seed, le mode de jeu, la difficulté ou le stockage.

## Dimension

Une **dimension** décrit les propriétés utilisées par un monde. Cela comprend la hauteur, le ciel, le brouillard et d'autres comportements propres à la dimension.

La dimension Overworld a une hauteur de 384 blocs. Le Nether a le brouillard du Nether. L'End a la skybox de l'End.

Une dimension n'est pas la même chose qu'une carte sauvegardée. Plusieurs mondes peuvent utiliser le même type de dimension.

## Générateur de monde

Un **générateur de monde** crée le terrain d'un monde.

Certains générateurs visent toujours une seule dimension. `minecraft:overworld` vise par exemple la dimension Overworld. D'autres générateurs acceptent un type de dimension via leur configuration. `minecraft:flat` peut par exemple créer un monde plat utilisant les propriétés de l'Overworld, du Nether ou de l'End.

## Cible de portail

Une **cible de portail** est le monde du même domaine vers lequel un portail envoie une entité.

Steel utilise par défaut les noms conventionnels de vanilla : `overworld`, `the_nether` et `the_end`. Les mondes portant des noms personnalisés peuvent surcharger ce comportement avec `nether_portal_target` et `end_portal_target` dans `worlds.toml`.

## Pages liées

- [Configuration des mondes](../../configuration/world-configuration)
