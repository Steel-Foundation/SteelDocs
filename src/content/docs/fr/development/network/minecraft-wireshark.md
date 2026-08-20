---
title: Déboguer le trafic réseau de Minecraft
description: Comment déboguer le trafic réseau de Minecraft avec Wireshark
---

Ce document décrit comment déboguer le trafic réseau de Minecraft pour inspecter la façon dont les paquets sont envoyés, avec Wireshark.

Si tu ne veux pas utiliser Wireshark, ce projet peut t'être utile : [https://github.com/adepierre/SniffCraft](https://github.com/adepierre/SniffCraft)

## Prérequis

D'abord, **le chiffrement et la compression doivent être désactivés**.
Ces réglages se trouvent dans `config/config.toml`, généré après le premier démarrage.

```toml
[server]
encryption = false
```

Retire la table `[server.compression]` pendant la capture de paquets. Si tu tiens à garder la compression activée pour un test précis, règle `server.compression.threshold` suffisamment haut pour que les paquets qui t'intéressent restent non compressés.

Il te faudra :

- Un **serveur Minecraft local**
- **Wireshark** lancé avec les privilèges root (ou les permissions adéquates) pour capturer le trafic sur `localhost`

Les paquets capturés peuvent être comparés à la documentation officielle du protocole :
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

Cela aide à comprendre tous les types de paquets et ce qu'ils décrivent.

## Mise en place de Wireshark

Tu peux lancer Wireshark tout de suite et observer les paquets, mais pour une meilleure lisibilité il est recommandé de compiler et
d'utiliser un **plugin dissecteur Wireshark**.

### Dissecteur Wireshark pour Minecraft

Dépôt :
[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)

Prérequis :

- **Wireshark 4.6** (recommandé)

Le mieux est de compiler le plugin toi-même en suivant les instructions du fichier `ci.yaml` du
dépôt.

**Sous Linux :**\
Après compilation, copie le fichier `.so` généré dans :

```bash
~/.local/lib/wireshark/plugins/<Version de Wireshark>/epan
```

**Sous Windows :**\
Après compilation, copie le fichier `.dll` généré dans :

```bash
plugins/<Version de Wireshark>/epan
```

Adapte le chemin à ta version de Wireshark.

### Dépôt des données de protocole

Clone le dépôt des données de protocole :

[https://github.com/Nickid2018/MC_Protocol_Data](https://github.com/Nickid2018/MC_Protocol_Data)

## Configuration de Wireshark

Lance Wireshark en tant qu'utilisateur non root ! (Sous Linux, pour capturer la boucle locale, ton utilisateur doit appartenir au groupe `wireshark`.)

Rends-toi ensuite dans :

**Préférences → Protocoles → Minecraft**

Sélectionne le protocole et indique le chemin du dépôt `MC_Protocol_Data` cloné.
Ensuite, **redémarre Wireshark**.

## Filtre d'affichage utile

Pour avoir une meilleure vue d'ensemble du trafic Minecraft, utilise ce filtre :

```
mcje
```

## Résultat

Au final, les paquets seront **bien plus lisibles** que des données réseau brutes, ce qui simplifie beaucoup le débogage du protocole.

![Vue de Wireshark](@/assets/wireshark_output.webp "Sortie du dissecteur de paquets Minecraft")

## Autres ressources utiles

Ces ressources peuvent t'aider à approfondir :

- [Minecraft décompilé](../../decompile-minecraft/)
- [https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)
