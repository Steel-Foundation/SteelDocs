---
title: FAQ
description: Réponses aux questions les plus fréquentes.
---

Tu trouveras ici les réponses aux questions les plus fréquentes !
:::caution[AVERTISSEMENT]
Steel est en pre-alpha, les fonctionnalités et les réponses ci-dessous peuvent donc changer souvent !
:::

## Comment installer Steel ?

Le guide complet se trouve [ici](../installation).

## Existe-t-il un Egg ?

Oui, nous fournissons un fichier de configuration Egg, plus d'informations dans notre [guide d'installation](../installation).

## Où est le fichier jar (\*.jar) ?

Steel n'est pas écrit en Java, il n'y a donc pas de jar (\*.jar).\
Pas d'inquiétude, tu trouveras des exécutables Windows, Linux et Mac sur notre [page de téléchargement](../../download) ou dans les [releases GitHub](https://github.com/Steel-Foundation/SteelMC/releases).

## Steel aura-t-il la parité vanilla ?

En un mot : **c'est notre objectif principal.**

## Steel a-t-il des plugins, et mon plugin Paper/Bukkit fonctionnera-t-il dessus ?

Pas pour le moment. Steel est en cours de développement, les plugins sont prévus mais pas encore possibles.\
À terme, Steel aura sa propre API, et nous comptons bien y reprendre le meilleur de Paper/Bukkit et des API de modding !

## Dans quel langage les plugins seront-ils écrits ?

L'API principale sera en Rust, mais la communauté pourra ajouter la prise en charge de WASM ou d'autres technologies pour ouvrir la porte à d'autres langages.

## Steel a-t-il des mods, et puis-je utiliser les miens ?

Les mods NeoForge/Forge/Fabric ne seront pas pris en charge. Comme pour les plugins, Steel utilisera Rust, et le fonctionnement interne sera différent, tout comme ce qu'il sera possible d'en faire.

## Comment augmenter ma vitesse de vol

Utilise la commande `/fly speed <multiplicateur de vitesse>`, où le multiplicateur doit être un nombre décimal entre 0 et 30.

## Puis-je intégrer steel-worldgen dans paper/fabric/etc ?

Il existe quelques PoC et nous sommes ravis d'aider, mais l'objectif de ce projet est d'être un serveur Minecraft complet. Pour faire communiquer Rust et Java, il faut passer par JNI ou Panama.

## Quand je vole vite, le serveur me repousse en arrière toutes les quelques secondes

C'est dû à une gamerule vanilla, tu peux la désactiver avec `/gamerule player_movement_check false`.

## J'ai un problème, que faire ?

Tu peux le signaler sur [GitHub](https://github.com/Steel-Foundation/SteelMC/issues), ou rejoindre notre [Discord](/discord) et le poster dans le salon bugs.
