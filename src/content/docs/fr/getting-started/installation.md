---
title: Installation
description: Comment installer Steel sur ton système.
sidebar:
  order: 1
---

Ce guide te montre comment installer et lancer Steel.\
Plusieurs méthodes sont possibles :

- [Binaire précompilé](#binaires-précompilés)
- [Docker](#docker)
- [Egg (Pelican / Pterodactyl)](#egg)
- [Compilation manuelle](#compilation-manuelle)

## Laquelle choisir

Choisis la méthode d'installation qui correspond à l'endroit où Steel va tourner.

- Si tu veux lancer Steel directement sur la machine hôte, utilise les binaires précompilés.

- Si tu utilises déjà Kubernetes, Docker Swarm ou un hôte Docker classique, le conteneur Docker est l'option recommandée.

- Si ta plateforme cible est Pelican, Pterodactyl ou un autre panel basé sur des eggs, utilise l'egg Steel fourni au format JSON ou YAML.

- Si tu veux des performances natives pour ton processeur, ou si ta plateforme / architecture n'est pas encore prise en charge, compile Steel depuis les sources pour ton système.

| Méthode                                   | Linux x64 | Linux arm64 | Linux armv7 | Linux armv6 | Windows x64 | Windows arm | Mac arm | Mac x64 |
| ----------------------------------------- | :-------: | :---------: | :---------: | :---------: | :---------: | :---------: | :-----: | :-----: |
| [Binaire](#binaires-précompilés)          |    ✅     |     ❌      |     ❌      |     ❌      |     ✅      |     ❌      |   ✅    |   ❌    |
| [Docker](#docker)                         |    ✅     |     ✅      |     ❌      |     ❌      |     ✅      |     ✅      |   ✅    |   ✅    |
| [Egg](#egg)                               |    ✅     |     ❌      |     ❌      |     ❌      |     ❌      |     ❌      |   ❌    |   ❌    |
| [Compilé soi-même](#compilation-manuelle) |    ✅     |     ✅      |     ⚠️      |     ⚠️      |     ✅      |     ✅      |   ✅    |   ✅    |

✅ : pris en charge. ❌ : pas encore pris en charge. ⚠️ : demande de petits ajustements.

Les sections ci-dessous détaillent chaque option.

## Binaires précompilés

Des binaires précompilés sont disponibles sur notre [page de téléchargement](../../download) pour les plateformes suivantes :

- Linux (x86_64)
- Windows (x86_64)
- macOS (ARM)

Notre page de [releases GitHub](https://github.com/Steel-Foundation/SteelMC/releases) propose exactement les mêmes fichiers.

Une fois le fichier téléchargé, il te suffit d'ouvrir ton terminal préféré (PowerShell, Ghostty, Kitty, etc.) dans le dossier de l'exécutable et de lancer la commande suivante :

```bash
# Windows
./steel.exe

# macOS / Linux
./steel
```

:::caution
Sur macOS, il faut activer le mode développement du système pour pouvoir exécuter Steel, car il n'est pas signé officiellement.

Pour cela, lance la commande suivante dans le terminal et saisis ton mot de passe administrateur :

```bash
sudo devtools enable
```

:::

## Docker

Steel ne publie pas de tag Docker `latest`. Utilise plutôt un tag de version précis : les mises à jour restent ainsi planifiées et aucun conteneur ne se met à jour de façon inattendue.

Le tag `nightly` est disponible pour tester des plugins et les changements à venir. Il suit le dernier commit de la branche `master` et peut contenir des bugs qui n'ont pas encore été corrigés pour une release. N'utilise pas `nightly` en production.

### Lancer l'image

Lance le conteneur Steel avec le port du serveur exposé et des dossiers locaux montés pour la configuration et les sauvegardes :

```bash
docker run -d -p 25565:25565 -v ./config:/config -v ./saves:/saves -v ./logs:/logs ghcr.io/steel-foundation/steelmc:<version>
```

:::note
Le pull Docker pour nightly est : `docker pull ghcr.io/steel-foundation/steelmc:nightly`
:::

:::tip
La même configuration peut s'écrire en service Docker Compose (recommandé) :

```yaml
# docker-compose.yml
services:
  steel:
    image: ghcr.io/steel-foundation/steelmc:<version>
    ports:
      - 25565:25565
    volumes:
      - ./config:/config
      - ./saves:/saves
      - ./logs:/logs
```

Docker Compose est une autre manière d'écrire la commande `docker run`, dans un fichier.\
La référence complète de Docker Compose est ici : https://docs.docker.com/reference/compose-file/

:::

### Changer les ports et les dossiers

Pour celles et ceux qui ne savent pas configurer Docker, voici un petit aide-mémoire des paramètres configurables :

- **`-p` (`--port`, `ports`) :** le premier nombre est le port de l'hôte, tu peux le changer. Le second est le port à l'intérieur du conteneur Docker et ne doit être modifié que pour correspondre à celui de la config de Steel. Par exemple, `-p 1111:25565` rend le serveur Minecraft accessible sur le port `1111` de la machine Linux.
- **`-v` (`--volume`, `volumes`) :** le chemin avant les deux-points est celui de ton système hôte, il peut être relatif au fichier compose. Le chemin après les deux-points est celui à l'intérieur du conteneur Docker et ne doit pas être modifié.

## Egg

Pour Pelican et Pterodactyl, Steel fournit un egg importable directement depuis la boutique d'eggs du panel.

Pour les autres plateformes basées sur des eggs, utilise les fichiers egg JSON ou YAML de notre dépôt, ou télécharge l'egg correspondant depuis l'une des boutiques prises en charge lorsqu'il est disponible.

Pelican : `[Bientôt disponible]`

Pterodactyl : `[Bientôt disponible]`

## Compilation manuelle

### Prérequis

- **Toolchain Rust nightly** - Steel utilise des fonctionnalités de l'édition Rust 2024
- **Système d'exploitation 64 bits** - Linux, macOS ou Windows
- **Git** - Pour cloner le dépôt

### Installer Rust

Si tu n'as pas Rust, passe par [rustup](https://rustup.rs/).

```bash
# Pour les systèmes Unix uniquement (macOS, Linux)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Steel nécessite la toolchain nightly. Le dépôt contient un `rust-toolchain.toml` qui sélectionne automatiquement la bonne version.

### Compiler depuis les sources

```bash
# Cloner le dépôt
git clone https://github.com/Steel-Foundation/SteelMC.git
cd SteelMC

# Compiler en mode release (recommandé pour l'exécution)
cargo build-native --release
```

:::note
**Le binaire se trouvera dans `./target/release/steel`**
:::

:::caution
Si tu veux compiler pour armv6 et armv7, tu dois aussi cloner simdnbt, modifier le `Cargo.toml` pour utiliser ta version locale, et retirer la restriction 64 bits de simdnbt.
Pour plus d'aide, on peut t'accompagner sur [Discord](/discord).
:::

#### Commandes de compilation

| Commande                       | Rôle                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `cargo build-native`           | Build debug (compilation rapide, exécution plus lente) (avec optimisations propres à l'architecture)  |
| `cargo build-native --release` | Build release (compilation plus lente, optimisée) (avec optimisations propres à l'architecture)       |
| `cargo build`                  | Build debug (compilation rapide, exécution plus lente)                                                |
| `cargo build --release`        | Build release (compilation plus lente, optimisée)                                                     |
| `cargo check`                  | Vérification rapide de la syntaxe et des types                                                        |
| `cargo test`                   | Lancer la suite de tests                                                                              |
| `cargo clippy`                 | Lancer le linter                                                                                      |

:::caution
Les builds natifs ne peuvent pas être exécutés sur une autre machine, uniquement sur celle où ils ont été compilés.
(Ou sur une machine de même architecture.)
:::

#### Features de compilation

Steel propose des features optionnelles activables avec `--features` :

```bash
# Activer la détection de deadlocks (debug uniquement)
cargo build-native --features deadlock_detection

# Activer le profilage du tas avec dhat
cargo build-native --features dhat-heap

# Désactiver l'allocateur mimalloc par défaut
cargo build-native --no-default-features
```

**Features disponibles :**

| Feature              | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| `mimalloc`           | Utiliser l'allocateur mimalloc (activé par défaut)                                   |
| `deadlock_detection` | Activer la détection de deadlocks de parking_lot pour déboguer les soucis de verrous |
| `dhat-heap`          | Activer le profilage du tas avec dhat                                                |

La **détection de deadlocks** est particulièrement utile en développement si tu rencontres des blocages ou si tu suspectes un problème lié aux verrous. Une fois activée, parking_lot détecte les deadlocks potentiels et panique en affichant des informations de diagnostic.

### Lancer le serveur

```bash
# Lancer directement avec cargo (mode debug)
cargo run-native

# Lancer avec les optimisations release
cargo run-native --release

# Ou lancer directement le binaire compilé
./target/release/steel
```

## Étapes suivantes

Maintenant que Steel tourne, passe à la [configuration](../../configuration/overview) pour personnaliser ton serveur.
