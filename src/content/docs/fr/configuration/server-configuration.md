---
title: Configuration du serveur
description: Référence complète de toutes les options de configuration du serveur dans SteelMC
sidebar:
  order: 2
---

SteelMC se configure via un fichier TOML situé dans `config/config.toml`. Cette page documente toutes les options du serveur.

Les réglages de monde sont documentés dans [Configuration des mondes](../world-configuration).

## Réglages de base

| Option                                | Type   | Défaut             | Description                                                                                        |
| ------------------------------------- | ------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| `server.server_port`                  | u16    | `25565`            | Le port sur lequel le serveur écoute                                                               |
| `server.max_players`                  | u32    | `20`               | Nombre maximum de joueurs connectés simultanément                                                  |
| `server.allow_extended_view_distance` | bool   | `false`            | Autorise une `view_distance` au-delà de la limite vanilla de 32 chunks, jusqu'aux 127 chunks de Steel |
| `server.view_distance`                | u8     | `10`               | Distance de vue maximale, en chunks. Normalement 1-32, ou 1-127 avec l'option étendue activée      |
| `server.simulation_distance`          | u8     | `10`               | Distance de simulation maximale, en chunks. Doit être inférieure ou égale à la distance de vue     |
| `server.motd`                         | String | `"A Steel Server"` | Message affiché dans la liste des serveurs                                                         |

:::note
Au-delà de 32 chunks de distance de vue, les clients vanilla ont toujours besoin d'un mod côté client qui autorise des distances d'affichage plus grandes.
:::

## Réglages des threads

Nombre de workers, optionnel, pour les pools de threads du serveur. La valeur 0, ou l'absence de valeur, laisse chaque pool utiliser son réglage automatique par défaut.

| Option                            | Type  | Défaut | Description                                                                      |
| --------------------------------- | ----- | ------ | -------------------------------------------------------------------------------- |
| `server.threads.main_runtime`     | usize | 0      | Threads de travail du runtime Tokio principal. 0 ou absent pour le mode auto.    |
| `server.threads.chunk_runtime`    | usize | 0      | Threads de travail du runtime Tokio dédié aux chunks.                            |
| `server.threads.chunk_generation` | usize | 0      | Threads de travail du pool Rayon de génération de chunks.                        |

Ces réglages ne sont utiles que si tu veux répartir la charge CPU à la main, par exemple pour laisser de la marge à d'autres processus sur la même machine.

## Réglages de sécurité

| Option                       | Type   | Défaut | Description                                                                              |
| ---------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------- |
| `server.online_mode`         | bool   | `true` | Utiliser l'authentification Mojang pour vérifier les joueurs                             |
| `server.auth_server`         | String | absent | Point de terminaison `hasJoined` optionnel pour le mode online. Absent pour utiliser Mojang |
| `server.profile_server`      | String | absent | Point de terminaison optionnel de résolution pseudo vers profil. Absent pour utiliser le service Mojang |
| `server.encryption`          | bool   | `true` | Activer le chiffrement des communications client-serveur                                 |
| `server.allow_flight`        | bool   | `false`| Autoriser le vol non autorisé côté client dans les contrôles de déplacement vanilla      |
| `server.enforce_secure_chat` | bool   | `false`| Imposer le chat sécurisé. Nécessite `online_mode = true` et `encryption = true`          |

:::caution
Désactiver `online_mode` permet à des clients non authentifiés de se connecter. Ne le fais que sur un réseau privé ou en développement.
:::

:::info
Pour le débogage et les bots, il est recommandé de désactiver le chiffrement (pour les tests uniquement !)
:::

## Réglages du chat

| Option                                  | Type | Défaut | Description                                                                                     |
| --------------------------------------- | ---- | ------ | ----------------------------------------------------------------------------------------------- |
| `server.chat_spam_threshold_seconds`    | i32  | `10`   | Fenêtre vanilla de détection du spam dans le chat, en secondes. Une valeur <= 0 désactive la limitation |
| `server.command_spam_threshold_seconds` | i32  | `10`   | Fenêtre vanilla de détection du spam de commandes, en secondes. Une valeur <= 0 désactive la limitation |

## Réglages du favicon

| Option               | Type   | Défaut                 | Description                              |
| -------------------- | ------ | ---------------------- | ---------------------------------------- |
| `server.use_favicon` | bool   | `true`                 | Utiliser ou non un favicon personnalisé  |
| `server.favicon`     | String | `"config/favicon.png"` | Chemin du fichier favicon (PNG 64x64)    |

## Réglages de compression

La compression réseau réduit la bande passante utilisée, au prix de CPU.

| Option                         | Type | Défaut | Plage valide | Description                                        |
| ------------------------------ | ---- | ------ | ------------ | -------------------------------------------------- |
| `server.compression.threshold` | u32  | `256`  | >=256        | Taille de paquet à partir de laquelle compresser   |
| `server.compression.level`     | i32  | `4`    | 1-9          | Niveau de compression (1=rapide, 9=meilleur)       |

La table `[server.compression]` est optionnelle. Si elle est absente, la compression est désactivée.

## Liens de serveur

Les liens de serveur sont affichés dans le menu multijoueur.

| Option                       | Type   | Défaut   | Description                                  |
| ---------------------------- | ------ | -------- | -------------------------------------------- |
| `server.server_links.enable` | bool   | `true`   | Active la fonctionnalité des liens de serveur |
| `server.server_links.links`  | Tableau| 4 liens  | Liste des liens à afficher                   |

Voir le [guide des liens de serveur](../server-links) pour la configuration détaillée.

## Réglages de journalisation

| Option              | Type   | Défaut      | Description                                                              |
| ------------------- | ------ | ----------- | ------------------------------------------------------------------------ |
| `log.log_path`      | String | `"./.logs"` | Dossier des fichiers de logs et de l'historique des commandes            |
| `log.log_level`     | String | `"info"`    | Niveau de log : `error`, `warn`, `info`, `debug` ou `trace`              |
| `log.time`          | String | `"uptime"`  | Format de l'heure : `none`, `date` ou `uptime`                           |
| `log.module_path`   | bool   | `false`     | Afficher ou non le chemin du module                                      |
| `log.extra`         | bool   | `false`     | Afficher ou non les données de log supplémentaires                       |
| `log.log_file`      | bool   | `true`      | Écrire ou non les logs également dans des fichiers                       |
| `log.rotation_time` | String | `"daily"`   | Rotation des fichiers : `none`, `hourly`, `daily`, `weekly` ou `monthly` |
| `log.max_history`   | usize  | `50`        | Nombre de commandes console conservées dans l'historique                 |

## Exemple de configuration

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
allow_extended_view_distance = false
view_distance = 12
simulation_distance = 10
online_mode = true
# auth_server = "https://sessionserver.mojang.com/session/minecraft/hasJoined"
# profile_server = "https://api.minecraftservices.com/minecraft/profile/lookup/name"
encryption = true
allow_flight = false
motd = "Bienvenue sur mon serveur Steel !"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false
chat_spam_threshold_seconds = 10
command_spam_threshold_seconds = 10

[server.threads]
main_runtime = 0
chunk_runtime = 0
chunk_generation = 0

[server.compression]
threshold = 256
level = 4

[server.server_links]
enable = true

[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

[log]
log_path = "./.logs"
log_level = "info"
time = "uptime"
module_path = false
extra = false
log_file = true
rotation_time = "daily"
max_history = 50
```

## Règles de validation

Le serveur valide la configuration au démarrage :

- les champs inconnus sont rejetés
- `server.view_distance` doit être compris entre 1 et 32, ou entre 1 et 127 si `server.allow_extended_view_distance` vaut true
- `server.simulation_distance` doit être inférieur ou égal à `server.view_distance`
- `server.auth_server`, s'il est défini, doit être une URL absolue en `http` ou `https`
- `server.profile_server`, s'il est défini, doit être une URL absolue en `http` ou `https`
- `server.compression.threshold` doit valoir au moins 256
- `server.compression.level` doit être compris entre 1 et 9
- si `server.enforce_secure_chat` vaut true, `server.online_mode` et `server.encryption` doivent tous les deux valoir true
- `log.log_level`, `log.time` et `log.rotation_time` doivent utiliser l'une des valeurs listées

Si la validation échoue, le serveur s'arrête avec un message d'erreur.
