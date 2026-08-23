---
title: Feature flags
description: Référence complète des feature flags de compilation de SteelMC.
---

SteelMC utilise les feature flags de Rust pour activer ou désactiver des fonctionnalités à la compilation. Ils permettent d'adapter un build à la production, au débogage, au profilage, à la télémétrie ou à la maintenance du code généré.

La plupart des utilisateurs compilent le binaire du serveur via le paquet `steel` :

```bash
cargo build -p steel --features "nom_de_la_feature"
```

## steel

Ces flags contrôlent l'exécutable principal du serveur.

| Feature               | Par défaut | Description                                                                                                                                      |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mimalloc`            | Oui        | Utilise MiMalloc comme allocateur global, pour de meilleures performances d'allocation.                                                           |
| `stand-alone`         | Non        | Embarque le favicon par défaut et l'écrit quand le fichier favicon configuré est absent.                                                          |
| `deadlock_detection`  | Non        | Active la détection de deadlocks de `parking_lot` pour le débogage.                                                                              |
| `dhat-heap`           | Non        | Active le profileur de tas DHAT pour l'analyse mémoire. Il remplace MiMalloc comme allocateur global quand les deux sont activés.                 |
| `spawn_chunk_display` | Non        | Affiche une grille colorée dans le terminal pendant la génération des chunks de spawn au démarrage.                                              |
| `slow_chunk_gen`      | Non        | Ralentit la génération de chunks pendant la préparation du spawn et propage `steel-core/slow_chunk_gen` ; utile pour observer l'affichage ci-dessus. |
| `jaeger`              | Non        | Active l'export de traces OpenTelemetry via OTLP, pour les installations de tracing compatibles Jaeger.                                          |

### Exemples d'utilisation

```bash
# Compiler avec la détection de deadlocks
cargo build -p steel --features deadlock_detection

# Compiler sans l'allocateur MiMalloc par défaut
cargo build -p steel --no-default-features

# Compiler avec l'affichage des chunks de spawn
cargo build -p steel --features "spawn_chunk_display slow_chunk_gen"

# Compiler avec le support du tracing Jaeger/OpenTelemetry
cargo build -p steel --features jaeger
```

## steel-core

Ces flags contrôlent la logique de jeu principale et les aides au débogage de bas niveau.

| Feature          | Par défaut | Description                                                                                                                                                                                                  |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stand-alone`    | Non        | Déclarée dans le manifeste du crate, mais sans chemin de code `cfg(feature = "stand-alone")` actif dans `steel-core` pour le moment. C'est la feature `stand-alone` du binaire serveur qui gère le favicon embarqué. |
| `slow_chunk_gen` | Non        | Ajoute un court délai après les étapes de génération de chunks quand le serveur active la génération lente du spawn.                                                                                          |
| `flint`          | Non        | Expose des aides à l'introspection des comportements, dont les noms de types concrets et les tranches du registre de comportements.                                                                           |

## steel-registry

Ces flags contrôlent le système de registres du jeu et le code de registre généré.

| Feature         | Par défaut | Description                                                                                                      |
| --------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `fmt`           | Non        | Exécute `rustfmt` sur les fichiers de registre générés pendant le build script.                                  |
| `minecraft-src` | Non        | Active des aides qui comparent les données de registre générées aux données de référence `minecraft-src` générées. |

## steel-utils

Ces flags contrôlent les données utilitaires générées.

| Feature | Par défaut | Description                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------ |
| `fmt`   | Non        | Exécute `rustfmt` sur les fichiers utilitaires générés pendant le build script.     |

## steel-worldgen

Ces flags contrôlent les données de génération de monde générées.

| Feature | Par défaut | Description                                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `fmt`   | Non        | Exécute `rustfmt` sur les fichiers de génération de monde générés pendant le build script.     |

## Combiner des features

Tu peux activer plusieurs features dans un même build :

```bash
# Compiler avec plusieurs features de débogage du serveur
cargo build -p steel --features "deadlock_detection spawn_chunk_display slow_chunk_gen"

# Compiler pour une distribution serveur de type standalone
cargo build -p steel --release --features stand-alone

# Formater la sortie de registre générée en compilant ce crate
cargo build -p steel-registry --features fmt
```

Les feature flags sont propres à chaque paquet. Quand tu actives des features en dehors du paquet `steel`, indique explicitement le paquet cible avec `-p`.

## Recommandations pour la production

Pour un serveur de production, privilégie ceci :

- Garde `mimalloc` activée, sauf si tu profiles avec `dhat-heap`.
- Garde `deadlock_detection`, `dhat-heap`, `spawn_chunk_display` et `slow_chunk_gen` désactivées.
- N'active `stand-alone` que si tu veux que le binaire du serveur fournisse le fichier favicon par défaut.
- N'active `jaeger` que si tu as un collecteur de traces OTLP configuré.
- Réserve `fmt` et `minecraft-src` au développement et à la validation du code généré, pas aux builds de production normaux.
