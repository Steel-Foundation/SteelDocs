---
title: Configuration des permissions
description: Configurer les permissions de commandes, les groupes, les surcharges par joueur et les métadonnées de permissions dans SteelMC.
sidebar:
  order: 4
---

Les permissions de SteelMC se configurent via `config/groups.toml` et peuvent aussi être modifiées à chaud avec `/perms`.

Les permissions contrôlent l'accès aux commandes, les suggestions de commandes et l'arbre de commandes envoyé à chaque client. Le même système gère également des règles contextuelles et des valeurs de métadonnées typées, pour les fonctionnalités du serveur et les plugins.

## Fichiers

Steel utilise deux fichiers de permissions :

| Fichier | Rôle |
| ------- | ---- |
| `config/groups.toml` | Groupes de permissions valables pour tout le serveur, et groupes par défaut |
| `<save_root>/global/player_permissions.toml` | Groupes assignés, surcharges directes et métadonnées, par joueur |

Modifie `groups.toml` pour la politique normale du serveur. Le fichier de permissions des joueurs se trouve sous le `save_path` configuré du monde, qui vaut `saves` par défaut. Il est géré par Steel et par `/perms` ; une modification manuelle ne devrait être nécessaire que pour une récupération ou une migration en masse, serveur éteint.

## Groupes par défaut

Un serveur neuf possède deux groupes : `default` et `op`. Chaque joueur reçoit `default`, car il est listé dans `default_groups`. Le groupe `op`, obligatoire, accorde `*` et est assigné par `/op`.

Ajoute les rôles de ton serveur sous forme de tables nommées `[groups.<nom>]`. Chaque groupe peut contenir des règles de permissions, des métadonnées et des groupes parents dont hériter. Un [exemple complet](#exemple-complet) plus bas dans cette page montre comment tout s'assemble.

:::caution
Ne mets pas `op` dans `default_groups`, sauf si tous les joueurs doivent avoir toutes les permissions.
:::

## Clés de permission

Les clés de permission sont des chaînes en minuscules séparées par des points :

```text
minecraft.command.give
steel.command.fly
plugin.region.build
```

:::caution
La syntaxe des clés de permission est stricte. Un segment ne peut contenir que des lettres ASCII minuscules, des chiffres, `_` et `-`. Les segments vides et les majuscules sont invalides.
:::

Les wildcards ne sont autorisés qu'en dernier segment :

| Clé | Signification |
| --- | ------------- |
| `*` | Correspond à toutes les permissions |
| `minecraft.command.*` | Correspond aux descendants, par exemple `minecraft.command.give` |
| `minecraft.command.give` | Correspond uniquement à cette clé exacte |

`minecraft.command.*` correspond à `minecraft.command.give`, mais pas à `minecraft.command` lui-même.

:::note
Un wildcard ne correspond qu'aux descendants. Accorde à la fois `minecraft.command` et `minecraft.command.*` si un système définit des permissions utiles aux deux niveaux.
:::

## Permissions de commandes

La plupart des commandes intégrées utilisent automatiquement cette forme de permission :

```text
<namespace>.command.<commande>
```

Exemples :

| Commande | Permission |
| -------- | ---------- |
| `/give` | `minecraft.command.give` |
| `/fly` | `steel.command.fly` |
| `/tp` et `/teleport` | `minecraft.command.teleport` |
| `/xp` et `/experience` | `minecraft.command.experience` |
| `/perms` | `steel.command.perms` |

Les commandes accessibles par défaut, comme `/list`, fonctionnent quand leur permission n'est pas définie, mais peuvent tout de même être désactivées par un refus explicite.

Certaines commandes exposent des permissions plus fines, par sous-commande ou par valeur. Par exemple, `/tick freeze` peut être accordée soit par `minecraft.command.tick`, soit par `minecraft.command.tick.freeze`.

`/gamemode` a des permissions spécifiques à chaque valeur :

| Action | Permission |
| ------ | ---------- |
| N'importe quel changement de mode de jeu | `minecraft.command.gamemode` |
| Survie uniquement | `minecraft.command.gamemode.survival` |
| Créatif uniquement | `minecraft.command.gamemode.creative` |
| Aventure uniquement | `minecraft.command.gamemode.adventure` |
| Spectateur uniquement | `minecraft.command.gamemode.spectator` |

Une permission plus large accorde l'action fille, mais un refus plus spécifique peut la surcharger. Par exemple, autorise `minecraft.command.gamemode` et refuse `minecraft.command.gamemode.creative` pour permettre tous les changements de mode de jeu sauf le créatif.

## Configuration des groupes

Les groupes sont des tables sous `[groups.<nom>]`.

```toml
[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
]
deny = [
  "minecraft.command.stop",
]
metadata = []
```

Les noms de groupes doivent être des segments de permission valides : lettres minuscules, chiffres, `_` et `-`.

### Héritage de groupes

Un groupe peut hériter des permissions et des métadonnées d'autres groupes :

```toml
[groups.helper]
priority = 5
inherits = []
allow = ["minecraft.command.teleport"]
deny = []
metadata = []

[groups.moderator]
priority = 10
inherits = ["helper"]
allow = ["minecraft.command.gamemode.spectator"]
deny = []
metadata = []
```

Les membres de `moderator` reçoivent les deux permissions. La règle de téléportation héritée conserve la priorité `5` de `helper` ; elle ne prend pas la priorité `10` de `moderator`.

L'héritage est transitif, et chaque groupe hérité ne contribue qu'une seule fois. Les cycles et les références à des groupes inexistants rendent la configuration invalide.

### Règles contextuelles

Les règles de permissions et de métadonnées peuvent inclure des sélecteurs de contexte :

```toml
[groups.builder]
priority = 5
inherits = []
allow = [
  "plugin.region.build{world=lobby:spawn,plugin:region=market}",
  "minecraft.command.gamemode{domain=lobby}",
]
deny = [
  "minecraft.command.gamemode.creative{world=lobby:spawn}",
]
metadata = []
```

Clés de contexte intégrées :

| Contexte | Exemple | Signification |
| -------- | ------- | ------------- |
| `domain` | `domain=lobby` | Ne s'applique qu'à l'intérieur d'un [domaine](../../reference/terminology#domaine) |
| `world` | `world=lobby:spawn` | Ne s'applique qu'à l'intérieur d'un [monde](../../reference/terminology#monde) chargé |

Des contextes personnalisés peuvent être fournis par des plugins ou par des sous-systèmes du serveur. Les clés sans namespace comme `region=spawn` sont valides, mais les clés avec namespace comme `plugin:region=spawn` sont préférables pour les contextes appartenant à un plugin.

Plusieurs sélecteurs sont combinés par un ET :

```text
plugin.region.build{world=lobby:spawn,plugin:region=market}
```

:::caution
La syntaxe des contextes est stricte. Chaque clé ne peut apparaître qu'une fois dans une expression.

`world=lobby:spawn` inclut déjà le domaine `lobby` et correspond donc aux règles portées par `domain=lobby`. Écrire les deux est inutile. Si les deux sont présents, ils doivent être cohérents ; `{domain=survival,world=lobby:spawn}` est invalide.

Les valeurs ne peuvent pas être vides ni contenir d'espace, `{`, `}`, `,` ou `=`. Les noms de domaines utilisent la syntaxe de namespace des identifiants Minecraft, et les mondes doivent s'écrire `<domaine>:<monde>`.
:::

La spécificité des contextes est cumulative. Les règles globales sont les moins spécifiques, un sélecteur de domaine ou personnalisé ajoute un niveau, et un monde en ajoute deux puisqu'il identifie à la fois un domaine et un monde chargé. Une règle avec plusieurs sélecteurs qui correspondent est donc plus spécifique qu'une règle qui n'en a qu'un seul.

## Métadonnées

Les métadonnées sont des données typées, résolues par le même modèle de groupes et de contextes que les permissions. Les valeurs peuvent être des booléens, des entiers ou des chaînes.

```toml
[groups.vip]
priority = 20
inherits = []
allow = []
deny = []
metadata = [
  { key = "plugin:homes", value = 10 },
  { key = "plugin:homes{domain=lobby}", value = 3 },
  { key = "plugin:chat/color", value = "gold" },
  { key = "plugin:can_fly", value = true },
]
```

Les clés de métadonnées doivent être des identifiants avec namespace, par exemple `plugin:homes` ou `plugin:chat/color`. Le système propriétaire d'une clé décide de ce que sa valeur signifie : un plugin de homes pourrait par exemple interpréter ces règles comme une limite de 10 homes en temps normal et de 3 dans le domaine `lobby`. Steel stocke et résout les valeurs, mais n'implémente ni les homes, ni les couleurs de chat, ni le vol du simple fait que ces clés d'exemple existent.

La résolution des métadonnées ne considère que les entrées dont la clé de métadonnée est exactement celle demandée. Parmi les entrées correspondantes, Steel retient :

1. Le contexte le plus spécifique.
2. Une valeur directement liée au joueur plutôt qu'une valeur de groupe, à spécificité égale.
3. La priorité de groupe la plus élevée en cas d'égalité entre valeurs de groupe.
4. La dernière entrée de l'ensemble de métadonnées effectif si tout le reste est à égalité.

Contrairement aux permissions, les métadonnées n'ont pas d'état accordé/refusé et leurs clés n'utilisent pas de wildcards. Définir une valeur ne remplace que l'entrée ayant la même clé et le même contexte exact ; la supprimer ne retire de même que cette entrée précise. Une valeur globale et une valeur contextuelle pour la même clé peuvent coexister.

## Résolution des conflits

Une permission non définie est refusée. Quand plusieurs règles correspondent, Steel choisit la règle gagnante dans cet ordre :

1. La clé de permission la plus spécifique gagne.
2. Le contexte le plus spécifique gagne.
3. Les surcharges directes du joueur l'emportent sur les règles de groupe, à spécificité égale.
4. La priorité de groupe la plus élevée gagne en cas d'égalité entre règles de groupe.
5. Le refus gagne si tout le reste est à égalité.

Autrement dit, un refus spécifique peut surcharger une autorisation large :

```toml
[groups.staff]
priority = 10
inherits = []
allow = ["minecraft.command.*"]
deny = ["minecraft.command.stop"]
metadata = []
```

Le joueur peut utiliser la plupart des commandes Minecraft, mais pas `/stop`.

## Exemple complet

Cette configuration constitue un bon point de départ pour un petit serveur :

```toml
default_groups = ["default"]

[groups.default]
priority = 0
inherits = []
allow = []
deny = []
metadata = []

[groups.vip]
priority = 5
inherits = []
allow = []
deny = []
metadata = [
  { key = "example_homes:max", value = 5 },
  { key = "example_chat:color", value = "gold" },
]

[groups.moderator]
priority = 10
inherits = []
allow = [
  "minecraft.command.teleport",
  "minecraft.command.gamemode.spectator",
  "minecraft.command.tick.freeze",
]
deny = []
metadata = []

[groups.op]
priority = 0
inherits = []
allow = ["*"]
deny = []
metadata = []
```

- Tout le monde reçoit `default`.
- Assigne `vip` aux joueurs qui doivent bénéficier des avantages fournis par les plugins.
- Assigne `moderator` au staff qui a besoin des commandes listées.
- `/op` assigne le groupe `op` obligatoire, qui accorde toutes les permissions par défaut.

Les entrées `example_homes:max` et `example_chat:color` sont illustratives. Elles n'ont d'effet que si des plugins ou des sous-systèmes du serveur propriétaires de ces clés les lisent. Remplace-les par les métadonnées prises en charge par les plugins que tu installes réellement.

## Commandes à chaud

Utilise `/perms` pour inspecter et modifier les permissions pendant que le serveur tourne. Sa forme générale est :

```text
/perms <user|group|groups> ...
```

Commence par inspecter la configuration actuelle :

```text
/perms user <cibles> info
/perms group <groupe> info
/perms groups list
```

Ces commandes affichent les réglages directs d'un joueur, les règles et l'héritage d'un groupe, et les groupes disponibles, avant que tu ne modifies quoi que ce soit. Voir [Commandes de permissions](../../commands/permissions) pour toutes les opérations, la permission requise et un exemple.

## Opérateurs

`/op <cibles>` et `/deop <cibles>` s'appuient sur le système de permissions :

- `/op` ajoute le groupe `op`.
- `/deop` retire le groupe `op`.
- Le groupe `op` par défaut accorde `*`.
- Le groupe `op` est obligatoire et ne peut pas être supprimé avec `/perms`.

Les cibles peuvent être des joueurs connectés, des joueurs hors ligne connus, ou des noms de profil que le serveur sait résoudre.

## Arbre de commandes du client

Les joueurs ne reçoivent que les nœuds de commandes qu'ils ont le droit d'utiliser. Cela concerne :

- les commandes visibles dans l'arbre de commandes du client
- l'autocomplétion
- les suggestions de commandes côté serveur
- le sélecteur de mode de jeu du client

La console et RCON contournent les vérifications de permissions.
