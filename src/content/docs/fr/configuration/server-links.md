---
title: Comment ajouter des liens de serveur
description: Comprendre les liens de serveur et savoir comment les configurer.
---

Commençons par le principal : les liens de serveur permettent d'afficher, dans le menu pause du joueur, des liens sur
lesquels il peut cliquer. Par exemple ta boutique, le site du serveur, etc.

Deux approches sont possibles. Les types intégrés, rapides à mettre en place mais avec peu d'options de configuration.
Ou les TextComponents, que tu peux créer et styliser comme tu veux.

## Activer les liens de serveur

Il faut d'abord activer les liens de serveur, en ajoutant ce bloc à ton `config/config.toml` :

```toml
# /config/config.toml

[server.server_links]
# Active la fonctionnalité des liens de serveur
enable = true
```

Ce bloc se place sous la configuration du serveur. Pour les désactiver temporairement, il suffit de passer `enable` à
`false`.

## Liens de serveur intégrés

Dix types intégrés sont disponibles :

- `bug_report`
- `community_guidelines`
- `support`
- `status`
- `feedback`
- `community`
- `website`
- `forums`
- `news`
- `announcements`

Le seul cas particulier est `bug_report` : il est également affiché lorsque le serveur plante, lève une exception ou
envoie des données malformées au client.

Il s'utilise comme ceci :

```toml
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

Et voici un exemple complet :

```toml
# /config/config.toml

[server.server_links]
# Active la fonctionnalité des liens de serveur
enable = true

# Type de lien intégré (label sous forme de simple chaîne)
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

## Liens de serveur personnalisés

Ce sont des TextComponents, tu disposes donc de bien plus de possibilités pour la mise en forme, avec du texte et des
couleurs personnalisés. Cela ressemble à ceci :

```toml
[[server.server_links.links]]
label = { text = "Rejoins le Discord SteelMC", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```

### Ressources complémentaires

Tu trouveras sur le web de nombreux tutoriels sur les TextComponents et la façon de les utiliser correctement.

<details>
<summary>Exemple de configuration complète</summary>

```toml
# /config/config.toml

[server]
# Port du serveur
server_port = 25565
# Nombre maximum de joueurs autorisés sur le serveur
max_players = 20
# Distance de vue maximale, en chunks
view_distance = 10
# Distance de simulation maximale, en chunks
simulation_distance = 10
# Utiliser ou non le service d'authentification de Mojang
online_mode = true
# Activer ou non le chiffrement des communications client-serveur
encryption = true
# Message du jour affiché dans les listes de serveurs
motd = "A Steel Server"
# Utiliser ou non un favicon personnalisé pour le serveur
use_favicon = true
# Chemin du fichier favicon (format PNG, 64x64 pixels)
favicon = "config/favicon.png"
# Imposer ou non le chat sécurisé
enforce_secure_chat = false

# Réglages de compression
[server.compression]
threshold = 256
level = 4

# Configuration des liens de serveur
[server.server_links]
# Active la fonctionnalité des liens de serveur
enable = true

# Type de lien intégré (label sous forme de simple chaîne)
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

# Un autre type intégré
[[server.server_links.links]]
label = "website"
url = "https://github.com/4lve/SteelMC"

# Le salon des annonces sur Discord
[[server.server_links.links]]
label = "announcements"
url = "https://discord.com/channels/1428487339759370322/1428487584966774795"

# TextComponent personnalisé (label sous forme d'objet, avec mise en forme)
[[server.server_links.links]]
label = { text = "Rejoins le Discord SteelMC", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```

</details>
