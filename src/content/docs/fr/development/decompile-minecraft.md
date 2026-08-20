---
title: Comment décompiler Minecraft
description: Comment décompiler le jeu pour s'en servir de référence.
---

Avant la 1.21.11, le code était obfusqué et il fallait donc des mappings. Comme ce serveur vise les versions >= 1.21.11,
cette documentation ne t'aidera que pour ces versions.

## Prérequis

Tu trouveras ci-dessous une commande pour la 1.21.11 et une pour la 26.1, mais tu peux l'utiliser avec n'importe quelle version.
Avec le launcher Minecraft (ou Prism, etc.), crée une instance dans la version qui t'intéresse, puis lance-la : cela
téléchargera le fichier jar. Son emplacement dépend du launcher et du système d'exploitation, mais une fois que tu as le
jar, tu peux utiliser l'une des options ci-dessous.

## Plusieurs méthodes possibles

- utiliser `update-minecraft-src.sh`, notre script de décompilation inclus dans le dépôt (il s'appuie sur `gitcraft` en coulisses, comme la troisième méthode)

- utiliser une version décompilée en ligne, ce qui permet d'envoyer des liens vers des fichiers à d'autres personnes. Le site est [mcsrc.dev](https://mcsrc.dev), et [https://mcsrc.dev/1/26.1] fonctionne aussi comme alternative

- pour consulter le code source de Minecraft, tu peux cloner [gitcraft](https://github.com/WinPlay02/GitCraft) et lancer
  `./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"`, ce qui créera
  `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` avec tout le code source

- ou tu peux télécharger [vineflower.jar](https://github.com/Vineflower/vineflower/releases) puis lancer cette commande
  ``java -jar vineflower-1.11.2.jar ./minecraft-26.1-client.jar --folder minecraft_26.1``. Cela créera un
  dossier nommé `minecraft_26.1`

## Autres ressources utiles

- des vidéos sur YouTube, qui font également de bons tutoriels
