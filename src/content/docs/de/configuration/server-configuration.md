---
title: Server-Konfiguration
description: Vollständige Referenz aller Server-Konfigurationsoptionen in SteelMC
sidebar:
  order: 2
---

SteelMC wird über eine JSON5-Konfigurationsdatei unter `config/steel_config.json5` konfiguriert. Diese Seite dokumentiert alle verfügbaren Optionen.

## Grundeinstellungen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `server_port` | u16 | `25565` | Der Port, auf dem der Server lauscht (1-65535) |
| `seed` | String | `""` | Weltgenerierungs-Seed (leer = zufällig) |
| `max_players` | u32 | `20` | Maximale gleichzeitige Spieleranzahl |
| `view_distance` | u8 | `10` | Maximale Sichtweite in Chunks (1-32) |
| `simulation_distance` | u8 | `10` | Maximale Simulationsdistanz in Chunks (1-32) |
| `motd` | String | `"A Steel Server"` | Nachricht in der Serverliste |

## Sicherheitseinstellungen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `online_mode` | bool | `true` | Mojang-Authentifizierung für Spielerverifizierung verwenden |
| `encryption` | bool | `true` | Verschlüsselung für Client-Server-Kommunikation aktivieren |
| `enforce_secure_chat` | bool | `false` | Sicheren Chat erzwingen (erfordert online_mode und encryption) |

:::caution
Das Deaktivieren von `online_mode` erlaubt gecrackten Clients die Verbindung. Nur für private Netzwerke oder Entwicklung deaktivieren.
:::

## Favicon-Einstellungen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `use_favicon` | bool | `true` | Ob ein eigenes Favicon verwendet werden soll |
| `favicon` | String | `"config/favicon.png"` | Pfad zur Favicon-Datei (64x64 PNG) |

## Komprimierungseinstellungen

Netzwerkkomprimierung reduziert die Bandbreitennutzung auf Kosten der CPU.

| Option | Typ | Standard | Gültiger Bereich | Beschreibung |
|--------|-----|----------|------------------|--------------|
| `compression.threshold` | u32 | `256` | ≥256 | Paketgrößen-Schwellenwert für Komprimierung |
| `compression.level` | u8 | `4` | 1-9 | Komprimierungsstufe (1=schnell, 9=beste) |

## Server-Links

Server-Links werden im Multiplayer-Menü angezeigt.

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `server_links.enable` | bool | `true` | Server-Links-Funktion aktivieren |
| `server_links.links` | Array | Siehe unten | Liste der anzuzeigenden Links |

Siehe [Server-Links-Anleitung](../server-links) für detaillierte Konfiguration.

## Beispielkonfiguration

```json5
// /config/steel_config.json5
{
  server_port: 25565,
  seed: "mein_toller_seed",
  max_players: 50,
  view_distance: 12,
  simulation_distance: 10,
  online_mode: true,
  encryption: true,
  motd: "Willkommen auf meinem Steel-Server!",
  use_favicon: true,
  favicon: "config/favicon.png",
  enforce_secure_chat: false,
  compression: {
    threshold: 256,
    level: 4
  },
  server_links: {
    enable: true,
    links: [
      {
        label: { text: "Discord" },
        url: "https://discord.gg/beispiel"
      }
    ]
  }
}
```

## Validierungsregeln

Der Server validiert die Konfiguration beim Start:

- `view_distance` muss zwischen 1 und 64 liegen
- `simulation_distance` muss zwischen 1 und 32 liegen
- `compression.threshold` muss mindestens 256 sein
- `compression.level` muss zwischen 1 und 9 liegen
- Wenn `enforce_secure_chat` true ist, müssen sowohl `online_mode` als auch `encryption` true sein
