---
title: Konfiguration
description: Wie du deinen Steel-Server konfigurierst.
---

Steel verwendet eine JSON5-Konfigurationsdatei, die Kommentare und nachgestellte Kommata unterstützt.

## Konfigurationsdatei

Beim ersten Start erstellt Steel `config/steel_config.json5` mit Standardwerten.

## Konfigurationsoptionen

### Server-Einstellungen

```json5
{
  // Port, auf dem der Server lauscht (1-65000)
  server_port: 25565,

  // Seed (leerer String bedeutet zufällig)
  seed: "",

  // Maximale erlaubte Zahl an Spielern
  max_players: 20,

  // Sichtweite (1-32)
  view_distance: 10,

  // Simulationsdistanz (1-32, muss ≤ view_distance sein)
  simulation_distance: 10,

  // Mojang-Authentifizierung erzwingen
  online_mode: true,

  // Client-Server-Verschlüsselung aktivieren
  encryption: true,

  // Serverlisten-Nachricht
  motd: "Ein Steel Server :O)",

  // Kryptografische Chat-Signaturen erzwingen
  // Benötigt online_mode und encryption auf true
  enforce_secure_chat: false,
}
```

### Favicon

```json5
{
  // Eigenes Server-Icon aktivieren
  use_favicon: true,

  // Pfad zum Favicon (muss 64x64 PNG sein)
  favicon: "config/favicon.png",
}
```

Lege ein 64x64 PNG-Bild unter `config/favicon.png` ab, um ein eigenes Icon in der Serverliste anzuzeigen.

### Kompression

```json5
{
  compression: {
    // Minimale Paketgröße zum Komprimieren (mindestens 256 Bytes)
    threshold: 256,

    // Zlib-Kompressionslevel (0-9, höher = kleiner aber langsamer)
    level: 6,
  },
}
```

### Server-Links

Server-Links erscheinen im Pausenmenü des Spielers:

```json5
{
  server_links: {
    enable: true,
    links: [
      // Eingebaute Label-Typen
      {
        label: "bug_report",
        url: "https://github.com/Steel-Foundation/SteelMC/issues",
      },

      // Benutzerdefinierte, gestylte Labels
      {
        label: { text: "Discord", color: "blue", bold: true },
        url: "https://discord.gg/MwChEHnAbh",
      },
    ],
  },
}
```

## Vollständiges Beispiel

```json5
{
  server_port: 25565,
  seed: "my_world_seed",
  max_players: 50,
  view_distance: 12,
  simulation_distance: 10,
  online_mode: true,
  encryption: true,
  motd: "Welcome to my Steel server!",
  enforce_secure_chat: false,
  use_favicon: true,
  favicon: "config/favicon.png",
  compression: {
    threshold: 256,
    level: 6,
  },
  server_links: {
    enable: true,
    links: [
      {
        label: "bug_report",
        url: "https://github.com/Steel-Foundation/SteelMC/issues",
      },
    ],
  },
}
```

## Validierungsregeln

Steel prüft deine Konfiguration beim Start:

| Einstellung             | Einschränkung                                      |
| ----------------------- | -------------------------------------------------- |
| `server_port`           | 1-65000                                            |
| `view_distance`         | 1-32                                               |
| `simulation_distance`   | 1-32, muss ≤ `view_distance` sein                  |
| `compression.threshold` | ≥ 256                                              |
| `compression.level`     | 0-9                                                |
| `enforce_secure_chat`   | Benötigt `online_mode` und `encryption` auf `true` |

Wenn die Validierung fehlschlägt, wird der Server mit einer Fehlermeldung beendet.

## Nächste Schritte

Nachdem dein Server konfiguriert ist, kannst du ihn [starten](/getting-started/running/).
