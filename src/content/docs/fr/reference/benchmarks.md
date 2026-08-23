---
title: Benchmarks
description: Benchmarks de performance reproductibles de SteelMC
---

Le premier benchmark publié de Steel porte sur ce qu'il fait le mieux aujourd'hui : générer du terrain. Nous avons comparé un build natif de Steel à Fabric via [Chunky](https://modrinth.com/plugin/chunky).

:::note[Fabric sert de référence vanilla]
Dans toute cette page, **Fabric** désigne un serveur Minecraft Java Edition 26.2 avec Fabric Loader, Fabric API et Chunky, sans aucun mod de performance. Nous l'utilisons comme substitut reproductible de vanilla : Chunky définit une zone de prégénération fixe, tandis que le générateur de monde vanilla de Minecraft fait le travail.
:::

Sur cette machine, Steel a généré la zone de test de 10 201 chunks **18,8 fois plus vite que Fabric**, sur trois exécutions.

| Serveur | Temps médian | Débit moyen      | Pic RSS médian | Utilisation CPU moyenne |
| ------- | -----------: | ---------------: | -------------: | ----------------------: |
| Steel   |       3,95 s | 2 581,8 chunks/s |       1,79 Gio |             30,2 cœurs  |
| Fabric  |      74,42 s |   137,2 chunks/s |       2,47 Gio |              4,4 cœurs  |

Les temps et les chiffres de mémoire sont des médianes sur trois exécutions. Le débit et l'utilisation CPU sont des moyennes arithmétiques. Un débit plus élevé est meilleur, un temps et une mémoire plus faibles sont meilleurs.

![Un diagramme en barres horizontales montrant Steel à 2 581,8 chunks par seconde et Fabric à 137,2.](../../../../assets/benchmarks/chunk-generation-throughput.svg)

Le parallélisme explique une grande partie du résultat. Steel a occupé en moyenne 30,2 cœurs CPU logiques pendant l'intervalle mesuré, contre 4,4 pour Fabric.

![Un diagramme en barres horizontales montrant une utilisation CPU moyenne de 30,2 cœurs pour Steel et 4,4 pour Fabric.](../../../../assets/benchmarks/chunk-generation-cpu.svg)

### Ramené à l'utilisation CPU

Diviser le débit par l'utilisation CPU moyenne donne une mesure approximative du travail accompli par seconde-CPU :

| Serveur | Chunks par seconde-CPU | Par rapport à Fabric |
| ------- | ---------------------: | -------------------: |
| Steel   |                  85,51 |               2,75 x |
| Fabric  |                  31,15 |               1,00 x |

Cet ajustement réduit l'écart affiché, sans le supprimer : Steel a généré environ **2,75 fois plus de chunks par seconde-CPU que Fabric**. Ce n'est pas un substitut au débit en temps réel, des cœurs inutilisés ne feront jamais finir un travail de génération plus tôt, mais cela donne un aperçu grossier de l'efficacité par cœur, à côté de la mise à l'échelle parallèle dans ce test limité par le CPU.

## Utilisation mémoire

Le pic de mémoire résidente a été le plus bas pour Steel dans ce test. Sa médiane s'établit à 1,79 Gio, contre 2,47 Gio pour Fabric.

Le graphique ci-dessous utilise l'exécution de durée médiane de chaque serveur. Une courbe qui s'arrête plus tôt signifie que ce serveur a terminé la génération plus tôt, pas que la mémoire est tombée à zéro.

![Un graphique en courbes de la mémoire résidente dans le temps. Steel termine après environ 4,0 secondes autour de 1,8 Gio, et Fabric après environ 74,4 secondes autour de 3,6 Gio.](../../../../assets/benchmarks/chunk-generation-memory.svg)

La taille de l'ensemble résident mesure l'ensemble du processus serveur, pas seulement les données de chunks vivantes. Pour Java, cela inclut la JVM et les pages de tas engagées ; pour Steel, cela inclut le processus natif et l'allocateur. Cette métrique montre ce que le système d'exploitation a gardé en mémoire pendant cette charge de travail, mais elle ne compare pas directement l'usage du tas Java aux allocations Rust.

## Région plus grande

Nous avons aussi lancé chaque serveur une fois sur une zone de 301 sur 301 : 90 601 chunks, soit 8,88 fois plus de terrain à générer. Cette exécution plus longue laisse davantage de temps aux ordonnanceurs pour monter en régime et indique mieux le débit soutenu, mais un essai unique n'offre pas la même confiance que le résultat répété en 101 sur 101.

| Serveur |   Temps |            Débit | Pic RSS  | Utilisation CPU moyenne | Chunks par seconde-CPU |
| ------- | ------: | ---------------: | -------: | ----------------------: | ---------------------: |
| Steel   | 32,14 s | 2 818,6 chunks/s | 3,98 Gio |             29,4 cœurs  |                  95,86 |
| Fabric  | 8:37,39 |   175,1 chunks/s | 3,35 Gio |              4,1 cœurs  |                  42,68 |

Steel a été **16,10 fois plus rapide que Fabric** sur cette exécution. Après division par l'utilisation CPU moyenne, Steel a accompli **2,25 fois plus de chunks par seconde-CPU que Fabric**.

Les deux serveurs affichent un meilleur débit sur la zone plus grande : Steel progresse de 9,2 % et Fabric de 27,6 % par rapport à leurs moyennes en 101 sur 101. Le pic de RSS n'est pas directement comparable entre tailles de région, car les exécutions plus grandes gardent en mémoire davantage de données de chunks générés et en attente.

![Un diagramme en barres horizontales groupées comparant le débit moyen en 101 sur 101 à une exécution en 301 sur 301, pour Steel et Fabric.](../../../../assets/benchmarks/chunk-generation-scaling.svg)

## Méthodologie

Le benchmark principal a généré un carré neuf de 101 sur 101 chunks d'Overworld entièrement générés, centré sur le chunk 0,0. Cela représente 10 201 chunks cibles, couvrant environ 2,61 kilomètres carrés. Le contrôle de mise à l'échelle a utilisé un carré de 301 sur 301, soit 90 601 chunks cibles couvrant environ 23,19 kilomètres carrés. Le benchmark a utilisé cette seed fixe :

```text
8500081009970950196
```

Cette seed a été choisie pour sa variété inhabituellement dense : la personne qui l'a trouvée [a relevé tous les biomes et toutes les structures dans un rayon de 1 000 blocs autour de 0,0](https://www.reddit.com/r/minecraftseeds/comments/1tf9iz2/ive_been_seedfinding_for_close_to_3_years_now/), ce qui donne à une zone de benchmark compacte une large couverture de terrain et de structures.

Les réglages communs étaient :

- Minecraft Java Edition 26.2
- structures activées
- aucun joueur connecté
- un nouveau dossier de monde à chaque exécution
- stockage du monde sur le même système de fichiers `tmpfs`
- trois exécutions à froid par serveur en 101 sur 101, plus une exécution à froid en 301 sur 301
- temps CPU du processus et RSS échantillonnés toutes les 250 millisecondes
- taille de la fenêtre de prégénération de Steel réglée à 64 chunks (`PREGEN_WINDOW_SIZE=64`)

Placer les mondes sur `tmpfs` retire le périphérique de stockage de la comparaison. La sérialisation, la compression et la sauvegarde des chunks tournent toujours, mais la vitesse du disque physique ne domine pas le résultat.

L'intervalle mesuré de Steel commence à `Preparing spawn area` et se termine à `Spawn area prepared`. Les intervalles de Fabric commencent quand Chunky signale `Task started` et se terminent à `Task finished`. Le démarrage, le chargement des registres, la sélection du spawn et l'arrêt sont en dehors de l'intervalle mesuré, pour les deux serveurs.

### Logiciels

| Composant     | Version                                                            |
| ------------- | ------------------------------------------------------------------ |
| Steel         | commit `c9f6a90b843a984b7c2c522ed7418098083c4780`, worktree propre  |
| Fabric Loader | 0.19.3                                                             |
| Fabric API    | 0.155.2+26.2                                                       |
| Chunky        | 1.5.3                                                              |
| Java          | OpenJDK 25.0.4, G1GC, tas initial de 512 Mio et maximum de 8 Gio    |

La configuration Fabric de référence ne contenait que Fabric Loader, Fabric API et Chunky. Les mods de performance n'ont volontairement pas été installés, les limites ci-dessous expliquent pourquoi.

### Matériel

| Composant | Système de test                            |
| --------- | ------------------------------------------ |
| CPU       | AMD Ryzen 9 9950X, 16 cœurs / 32 threads   |
| Mémoire   | 123,4 Gio de mémoire système               |
| OS        | Arch Linux, noyau 7.1.4-arch1-1            |
| Stockage  | `tmpfs` pour les mondes générés            |

### Reproduire le benchmark

Le harnais de benchmark et le générateur de graphiques sont des fichiers TypeScript versionnés, exécutés avec Bun. Depuis le dépôt de documentation :

```sh
PREGEN_WINDOW_SIZE=64 bun run benchmark -- \
  --steel ../SteelMC \
  --fabric ../fabric_server \
  --output /tmp/steel-benchmark \
  --runs 3 --side 101
```

Pour l'exécution unique sur la région plus grande, remplace la dernière ligne par `--runs 1 --side 301` et utilise un dossier de sortie distinct.

Le runner crée un monde temporaire neuf à chaque essai, vérifie par SHA-512 les téléchargements épinglés de Chunky et de Fabric API, échantillonne `/proc` sous Linux, et écrit les logs bruts ainsi que les résultats en JSON et CSV. Le profil `all` par défaut alterne l'ordre de Steel et de Fabric entre les exécutions. Utilise `--profile steel` ou `fabric` pour ne lancer qu'un seul serveur.

Pour régénérer les graphiques versionnés à partir des données versionnées :

```sh
bun run benchmark:render
```

## Exécutions individuelles

| Serveur | Exécution |    Temps |            Débit | Pic RSS  | Utilisation CPU moyenne |
| ------- | --------: | -------: | ---------------: | -------: | ----------------------: |
| Steel   |         1 |  3,940 s | 2 588,9 chunks/s | 1,79 Gio |             30,19 cœurs |
| Steel   |         2 |  3,959 s | 2 576,7 chunks/s | 1,79 Gio |             30,17 cœurs |
| Steel   |         3 |  3,954 s | 2 579,9 chunks/s | 1,80 Gio |             30,22 cœurs |
| Fabric  |         1 | 75,088 s |   135,9 chunks/s | 2,35 Gio |              4,42 cœurs |
| Fabric  |         2 | 74,419 s |   137,1 chunks/s | 3,63 Gio |              4,40 cœurs |
| Fabric  |         3 | 73,547 s |   138,7 chunks/s | 2,47 Gio |              4,40 cœurs |

Le tableau 301 sur 301 ci-dessus ne contient qu'une exécution par serveur, il n'est donc pas répété ici.

Les données sources exploitables par une machine, utilisées pour les tableaux et les graphiques, sont stockées à côté de la documentation dans `results.csv`, `results.json` et `samples.csv`.

## Limites

:::caution[À lire avant de citer ces résultats]
Il s'agit d'un benchmark ciblé sur la génération de monde, pas d'une affirmation selon laquelle Steel serait 18,8 fois plus rapide sur toutes les charges de travail d'un serveur.
:::

- **La zone répétée est volontairement modeste.** Le test 101 sur 101 a été choisi pour que Fabric vanilla puisse être répété trois fois. Le résultat en 301 sur 301 met en évidence les effets de montée en régime, mais il ne s'agit que d'une seule exécution et il ne doit pas être pris pour une moyenne stable.
- **Le travail généré n'est pas parfaitement identique.** Steel désactive actuellement l'étape de génération liée à l'apparition des entités, car la plupart des entités générées ne sont pas implémentées. Fabric vanilla, lui, exécute cette étape. À part cela, les deux configurations demandent des chunks entièrement générés, avec structures et lumière.
- **Fabric est notre référence vanilla, pas un serveur moddé optimisé.** Fabric Loader fournit l'environnement de mods, tandis que Fabric API et Chunky nous permettent de définir et d'exécuter la même tâche de prégénération à chaque fois. Nous avons volontairement exclu les mods de performance, parce qu'ils demandent souvent un réglage propre à la charge de travail. Un test mal configuré pourrait sous-estimer ce dont ils sont capables. Nous accueillons volontiers des contributions de benchmarks reproductibles de la part de gens qui savent configurer tel ou tel mod.
- **Le benchmark favorise le travail CPU.** Le `tmpfs`, un serveur au repos et l'absence de joueurs réduisent les interférences liées au disque et au gameplay. Un serveur en production sur du stockage persistant se comportera différemment.
- **Il s'agit d'une seule machine, d'une seule seed, d'une seule dimension et d'une seule révision du serveur.** Ces résultats devraient être reproduits sur d'autres matériels et étendus au Nether, à l'End, au chargement de chunks, à l'envoi de chunks, au ticking et à la concurrence entre joueurs avant d'en tirer des conclusions plus larges.

## Benchmarks à venir

Les ajouts les plus utiles seraient :

- des configurations de mods de performance Fabric réglées sérieusement, apportées par des gens qui connaissent ces mods
- une génération 301 sur 301 répétée sur d'autres machines
- du stockage NVMe physique, avec la taille du monde et les octets écrits
- le Nether et l'End
- le chargement depuis le disque de chunks déjà générés
- l'envoi de chunks vers un puis plusieurs clients
- le temps de tick et la mémoire sous joueurs simulés
