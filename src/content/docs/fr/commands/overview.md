---
title: Référence des commandes
description: Conventions et références détaillées des commandes de SteelMC.
sidebar:
  order: 1
---

Cette section documente les familles de commandes de SteelMC qui demandent plus qu'une courte liste de syntaxe. Chaque référence explique ce qu'une opération modifie, quelles permissions elle exige, et comment l'utiliser sans danger.

## Index des commandes

- [`/perms`](../permissions) — inspecter et gérer les règles des joueurs, les groupes, l'héritage, les valeurs par défaut et les métadonnées

Les commandes vanilla suivent leur syntaxe Minecraft habituelle. Tant qu'une commande n'a pas de comportement propre à Steel qui justifie sa propre référence, réfère-toi à la [liste des commandes du Minecraft Wiki](https://minecraft.wiki/w/Commands#List_and_summary_of_commands).

## Lire la syntaxe des commandes

Les références de commandes utilisent des chevrons pour les valeurs que tu dois fournir :

```text
/commande <valeur_requise>
```

Ne tape pas les chevrons. Par exemple, `/perms group <groupe> info` devient :

```text
/perms group moderator info
```

Les arguments qui ciblent un joueur acceptent un nom de joueur ou un sélecteur de cible Minecraft compatible. Les commandes qui utilisent des cibles de profil peuvent aussi résoudre des joueurs hors ligne connus.

## Permissions

La plupart des commandes dérivent leur permission de leur identifiant de commande avec namespace :

```text
<namespace>.command.<commande>
```

Certaines familles de commandes publient des permissions plus spécifiques pour des opérations individuelles. La permission racine accorde ces opérations, sauf si une règle plus spécifique en refuse une. La console et RCON contournent les vérifications de permissions des joueurs.

Pour le détail des clés de permission, des groupes, des contextes et de la résolution des conflits, voir [Configuration des permissions](../../configuration/permissions).
