---
title: Commandes de permissions
description: Inspecter et gérer les permissions, groupes, héritages et métadonnées de SteelMC avec /perms.
sidebar:
  order: 2
---

`/perms` gère les permissions pendant que le serveur tourne. Elle a trois portées :

```text
/perms user <cibles> <opération>
/perms group <groupe> <opération>
/perms groups <opération>
```

- `user` gère les surcharges directes d'un joueur et ses assignations de groupes.
- `group` gère les règles, la priorité, l'héritage et les métadonnées d'un groupe nommé.
- `groups` liste les groupes et gère ceux que chaque joueur reçoit par défaut.

Cette référence suppose que tu es à l'aise avec les clés de permission, les wildcards, les groupes et les contextes. Commence par [Configuration des permissions](../../configuration/permissions) si ces notions sont nouvelles pour toi.

:::tip
Inspecte un joueur ou un groupe avant de le modifier. Les règles directes, héritées et contextuelles, ainsi que la priorité de groupe, peuvent rendre le résultat effectif différent d'une seule entrée de configuration.
:::

## Comment fonctionne l'autorisation

Chaque opération a une permission de commande fine. L'inspection d'un joueur exige par exemple `steel.command.perms.user.info`. La permission racine `steel.command.perms` accorde toutes les opérations de `/perms`, sauf si une opération plus spécifique est refusée.

Modifier ou afficher les données gérées peut demander une autorité supplémentaire :

| Autorité | Rôle |
| -------- | ---- |
| `steel.permission.manage.<permission>` | Inspecter, vérifier ou modifier les règles de cette clé de permission |
| `steel.permission.group.<groupe>` | Inspecter, assigner ou modifier ce groupe |
| `steel.permission.metadata` | Afficher, vérifier ou modifier les métadonnées de permissions |

Les wildcards peuvent accorder une plage d'autorité. Par exemple, `steel.permission.manage.minecraft.command.*` autorise la gestion des clés descendantes comme `minecraft.command.give`, tandis que `steel.permission.manage.*` autorise la gestion de toutes les clés de permission. De la même façon, `steel.permission.group.*` autorise la gestion de tous les groupes.

Les commandes d'information filtrent leur sortie selon l'autorité de l'émetteur. Les infos d'un joueur omettent par exemple les métadonnées sans `steel.permission.metadata`, ainsi que les règles ou les groupes que l'émetteur ne peut pas gérer.

La console et RCON contournent ces vérifications de permissions des joueurs.

## Inspecter les réglages actuels

Ce sont les meilleures commandes à lancer avant toute modification.

### Inspecter un joueur

```text
/perms user <cibles> info
```

Affiche, pour chaque cible, les groupes assignés, les règles de permission directes et les surcharges de métadonnées directes. Cela rapporte les réglages stockés du joueur, pas l'ensemble des règles effectives héritées.

Permission de commande : `steel.command.perms.user.info`

La sortie est filtrée selon l'autorité de l'émetteur sur la gestion des permissions, des groupes et des métadonnées.

```text
/perms user Steve info
```

### Vérifier la permission effective d'un joueur

```text
/perms user <cibles> check <expr_permission>
```

Résout la permission pour chaque cible, en tenant compte des groupes par défaut, des groupes assignés, des surcharges directes, de l'héritage, de la priorité et du contexte. Le résultat identifie la règle gagnante et sa source, ou signale que la permission n'est pas définie.

Permission de commande : `steel.command.perms.user.check`

Autorité supplémentaire : `steel.permission.manage.<permission>` pour la clé vérifiée.

```text
/perms user Steve check minecraft.command.gamemode.creative
/perms user Steve check minecraft.command.gamemode{domain=lobby}
```

### Inspecter un groupe

```text
/perms group <groupe> info
```

Affiche la priorité du groupe, ses groupes parents, ses règles d'autorisation, ses règles de refus et ses métadonnées. Les entrées hors de l'autorité de gestion de l'émetteur sont omises.

Permission de commande : `steel.command.perms.group.info`

Autorité supplémentaire : `steel.permission.group.<groupe>`. Les métadonnées exigent en plus `steel.permission.metadata` ; chaque règle de permission exige l'autorité `steel.permission.manage.<permission>` correspondante.

```text
/perms group moderator info
```

### Lister les groupes

```text
/perms groups list
```

Liste les groupes que l'émetteur a l'autorité de gérer et indique lesquels sont des groupes par défaut.

Permission de commande : `steel.command.perms.groups.list`

Seuls les groupes couverts par l'autorité `steel.permission.group.<groupe>` de l'émetteur sont affichés.

## Gérer les règles de permission d'un joueur

Une expression de permission est une clé de permission avec un sélecteur de contexte optionnel :

```text
<permission>{<contexte>=<valeur>,...}
```

Voir [Règles contextuelles](../../configuration/permissions#règles-contextuelles) pour la syntaxe complète et le comportement de résolution.

### Autoriser une permission

```text
/perms user <cibles> allow <expr_permission>
```

Ajoute ou remplace la règle directe exacte par une autorisation. Les autres contextes de la même permission restent inchangés.

Permission de commande : `steel.command.perms.user.allow`

Autorité supplémentaire : `steel.permission.manage.<permission>`.

```text
/perms user Steve allow minecraft.command.teleport
/perms user Steve allow minecraft.command.gamemode{domain=lobby}
```

### Refuser une permission

```text
/perms user <cibles> deny <expr_permission>
```

Ajoute ou remplace la règle directe exacte par un refus. Un refus spécifique peut surcharger une autorisation plus large.

Permission de commande : `steel.command.perms.user.deny`

Autorité supplémentaire : `steel.permission.manage.<permission>`.

```text
/perms user Steve deny minecraft.command.gamemode.creative
```

### Retirer une règle directe

```text
/perms user <cibles> unset <expr_permission>
```

Retire uniquement la règle directe ayant la même clé de permission et le même contexte exact. Les règles héritées de groupes ne sont pas retirées.

Permission de commande : `steel.command.perms.user.unset`

Autorité supplémentaire : `steel.permission.manage.<permission>`.

```text
/perms user Steve unset minecraft.command.gamemode{domain=lobby}
```

## Assigner des groupes à un joueur

### Ajouter un groupe

```text
/perms user <cibles> group add <groupe>
```

Assigne le groupe à chaque cible. Assigner un groupe déjà présent ne change rien.

Permission de commande : `steel.command.perms.user.group.add`

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms user Steve group add moderator
```

### Retirer un groupe

```text
/perms user <cibles> group remove <groupe>
```

Retire le groupe assigné à chaque cible. Cela ne retire pas un groupe reçu via `default_groups` ou par héritage.

Permission de commande : `steel.command.perms.user.group.remove`

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms user Steve group remove moderator
```

## Gérer les groupes

### Créer ou supprimer un groupe

```text
/perms group <groupe> create
/perms group <groupe> delete
```

`create` ajoute un groupe vide. `delete` retire le groupe de la configuration des groupes. Steel refuse la suppression si le groupe est `op`, s'il est encore un groupe par défaut, ou s'il est hérité par un autre groupe : retire d'abord ces références.

Permissions de commande : `steel.command.perms.group.create` et `steel.command.perms.group.delete`.

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms group moderator create
/perms group retired-staff delete
```

### Autoriser, refuser ou retirer une règle de groupe

```text
/perms group <groupe> allow <expr_permission>
/perms group <groupe> deny <expr_permission>
/perms group <groupe> unset <expr_permission>
```

`allow` et `deny` ajoutent ou remplacent la règle de groupe exacte. `unset` retire uniquement la règle ayant la même clé de permission et le même contexte exact.

Permissions de commande :

- `steel.command.perms.group.allow`
- `steel.command.perms.group.deny`
- `steel.command.perms.group.unset`

Autorité supplémentaire : à la fois `steel.permission.group.<groupe>` et `steel.permission.manage.<permission>`.

```text
/perms group moderator allow minecraft.command.teleport
/perms group moderator deny minecraft.command.stop
/perms group moderator unset minecraft.command.teleport
```

### Changer la priorité d'un groupe

```text
/perms group <groupe> priority <priorité>
```

Définit la priorité, un entier signé 32 bits, utilisée quand des règles de spécificité égale provenant de groupes différents entrent en conflit. La priorité la plus élevée gagne ; la spécificité prime toujours sur la priorité.

Permission de commande : `steel.command.perms.group.priority`

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms group moderator priority 10
```

## Gérer l'héritage entre groupes

### Lister les groupes parents

```text
/perms group <groupe> inherit list
```

Liste les parents directs du groupe. Les entrées parentes hors de l'autorité de gestion des groupes de l'émetteur sont omises.

Permission de commande : `steel.command.perms.group.inherit.list`

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms group moderator inherit list
```

### Ajouter ou retirer un parent

```text
/perms group <groupe> inherit add <parent>
/perms group <groupe> inherit remove <parent>
```

Ajoute ou retire une relation d'héritage directe. Ajouter une relation qui créerait un cycle est refusé. Les règles héritées conservent la priorité du groupe où elles ont été définies.

Permissions de commande : `steel.command.perms.group.inherit.add` et `steel.command.perms.group.inherit.remove`.

Autorité supplémentaire : `steel.permission.group.<groupe>` et `steel.permission.group.<parent>`.

```text
/perms group moderator inherit add helper
/perms group moderator inherit remove helper
```

## Gérer les métadonnées

Les expressions de métadonnées utilisent une clé avec namespace et la même syntaxe de contexte optionnelle que les expressions de permission :

```text
<namespace>:<clé>{<contexte>=<valeur>,...}
```

Les valeurs sont explicitement typées en `int`, `bool` ou `string`. Voir [Métadonnées](../../configuration/permissions#métadonnées) pour les règles de résolution.

Mets entre guillemets les valeurs de chaîne contenant des espaces :

```text
/perms user Steve metadata set string "Senior Builder" plugin:rank
```

### Définir une métadonnée de joueur

```text
/perms user <cibles> metadata set int <valeur> <expr_métadonnée>
/perms user <cibles> metadata set bool <valeur> <expr_métadonnée>
/perms user <cibles> metadata set string <valeur> <expr_métadonnée>
```

Définit une surcharge de métadonnée directe pour chaque cible. Cela ne remplace que la valeur ayant la même clé de métadonnée et le même contexte exact.

Permission de commande : `steel.command.perms.user.metadata.set`

Autorité supplémentaire : `steel.permission.metadata`.

```text
/perms user Steve metadata set int 5 plugin:max_homes
/perms user Steve metadata set string gold plugin:chat/color{domain=lobby}
```

### Vérifier une métadonnée de joueur

```text
/perms user <cibles> metadata check <expr_métadonnée>
```

Résout la valeur effective de chaque cible dans le contexte demandé et indique la source gagnante. Cela inclut les métadonnées de groupe et les surcharges directes.

Permission de commande : `steel.command.perms.user.metadata.check`

Autorité supplémentaire : `steel.permission.metadata`.

```text
/perms user Steve metadata check plugin:max_homes{world=survival:overworld}
```

### Retirer une métadonnée de joueur

```text
/perms user <cibles> metadata unset <expr_métadonnée>
```

Retire uniquement l'entrée de métadonnée directe ayant la même clé et le même contexte exact. Les métadonnées héritées d'un groupe restent inchangées.

Permission de commande : `steel.command.perms.user.metadata.unset`

Autorité supplémentaire : `steel.permission.metadata`.

```text
/perms user Steve metadata unset plugin:max_homes
```

### Définir ou retirer une métadonnée de groupe

```text
/perms group <groupe> metadata set int <valeur> <expr_métadonnée>
/perms group <groupe> metadata set bool <valeur> <expr_métadonnée>
/perms group <groupe> metadata set string <valeur> <expr_métadonnée>
/perms group <groupe> metadata unset <expr_métadonnée>
```

Définit ou retire une entrée de métadonnée exacte sur le groupe. Utilise `/perms group <groupe> info` pour inspecter les métadonnées configurées d'un groupe ; il n'existe pas d'opération `check` distincte pour les métadonnées de groupe.

Permissions de commande : `steel.command.perms.group.metadata.set` et `steel.command.perms.group.metadata.unset`.

Autorité supplémentaire : `steel.permission.group.<groupe>` et `steel.permission.metadata`.

```text
/perms group vip metadata set int 10 plugin:max_homes
/perms group vip metadata unset plugin:max_homes
```

## Gérer les groupes par défaut

```text
/perms groups default add <groupe>
/perms groups default remove <groupe>
```

Ajoute ou retire un groupe de `default_groups`. Les groupes par défaut contribuent aux permissions et aux métadonnées effectives de tous les joueurs. Retirer un groupe par défaut ne le supprime pas.

Permissions de commande : `steel.command.perms.groups.default.add` et `steel.command.perms.groups.default.remove`.

Autorité supplémentaire : `steel.permission.group.<groupe>`.

```text
/perms groups default add member
/perms groups default remove member
```

## Persistance et joueurs hors ligne

Les opérations sur les groupes mettent à jour `config/groups.toml`. Les opérations sur les joueurs mettent à jour `<save_root>/global/player_permissions.toml` et peuvent résoudre les joueurs connectés, les joueurs hors ligne connus, ou les noms de profil accessibles via la résolution de profils du serveur.

Ces opérations s'exécutent sans bloquer le tick du serveur. L'exécution de la commande reste suspendue jusqu'à la fin de l'opération, puis l'émetteur reçoit son résultat et son retour.
