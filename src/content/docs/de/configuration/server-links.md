---
title: Server-Links hinzufügen
description: Grundlegendes Verständnis über Server-Links und deren Konfiguration
---

Zunächst einmal: Was sind Server-Links? Sie geben dir die Möglichkeit, im Pausenmenü des Spielers Links hinzuzufügen, die er anklicken kann. Zum Beispiel den eigenen Marktplatz, die Website des Servers, etc.

Es gibt zwei Varianten: Eingebaute Optionen, die schnell einzurichten sind, aber wenige Konfigurationsmöglichkeiten bieten. Die andere Option sind TextComponents, mit denen du nach Belieben erstellen und stylen kannst.

## Server-Links aktivieren

Zuerst müssen Server-Links aktiviert werden. Dies erfolgt durch Hinzufügen dieses Textes zu deiner steel_config.json5:

```json5
// /config/steel_config.json5
server_links: {
  // Server-Links-Funktion aktivieren
  enable: true,
},
```

Dies muss im Root-Teil der Konfiguration hinzugefügt werden. Um es vorübergehend zu deaktivieren, kannst du enable auf false setzen.

## Eingebaute Server-Links

Es gibt 10 eingebaute Typen für Server-Links:

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

Der einzige Sonderfall ist `bug_report` - dieser wird auch angezeigt, wenn der Server abstürzt, eine Exception wirft oder fehlerhafte Daten an den Client sendet.

Dies kann so verwendet werden:
```json5
// /config/steel_config.json5
{
  label: "bug_report",
  url: "https://github.com/4lve/SteelMC/issues"
}
```

und ein vollständiges Beispiel:
```json5
// /config/steel_config.json5
server_links: {
  // Server-Links-Funktion aktivieren
  enable: true,
  // Liste der Links, die im Servermenü angezeigt werden
  links: [
    // Eingebauter Link-Typ (einfaches String-Label)
    {
      label: "bug_report",
      url: "https://github.com/4lve/SteelMC/issues"
    }
  ]
},
```

## Benutzerdefinierte Server-Links
Dies sind TextComponents, daher hast du viel mehr Funktionalität für das Design mit benutzerdefiniertem Text und Farbe.
Das sieht so aus:
```json5
// /config/steel_config.json5
{
    label: {
        text: "Visit the SteelMC Discord",
        color: "blue",
        bold: true
    },
    url: "https://discord.gg/suSXXNdVSf"
}
```
### Zusätzliche Ressourcen
Im Internet findest du viele weitere Tutorials über TextComponent und deren korrekte Verwendung.

<details>
<summary>Vollständiges Beispiel-Konfiguration</summary>

```json5
// /config/steel_config.json5
{
    $schema: "https://raw.githubusercontent.com/4lve/SteelMC/refs/heads/master/package-content/schema.json5",
    // Server-Port
    server_port: 25565,
    // Welt-Seed für die Generierung der Welt, leerer String bedeutet zufälliger Seed
    seed: "",
    // Maximale Anzahl der erlaubten Spieler auf dem Server
    max_players: 20,
    // Maximale Sichtweite in Chunks
    view_distance: 10,
    // Maximale Simulationsdistanz in Chunks
    simulation_distance: 10,
    // Ob Mojangs Authentifizierungsdienst verwendet werden soll
    online_mode: true,
    // Ob Verschlüsselung für Client-Server-Kommunikation aktiviert werden soll
    encryption: true,
    // Nachricht des Tages, die in Serverlisten angezeigt wird
    motd: "A Steel Server",
    // Ob ein benutzerdefiniertes Favicon für den Server verwendet werden soll
    use_favicon: true,
    // Pfad zur Favicon-Datei (PNG-Format, 64x64 Pixel)
    favicon: "config/favicon.png",
    // Ob sicherer Chat erzwungen werden soll
    enforce_secure_chat: false,
    // Komprimierungseinstellungen
    compression: {
        threshold: 256,
        level: 4,
    },
    // Server-Links-Konfiguration
    server_links: {
        // Server-Links-Funktion aktivieren
        enable: true,
        // Liste der Links, die im Servermenü angezeigt werden
        links: [
            // Eingebauter Link-Typ (einfaches String-Label)
            {
                label: "bug_report",
                url: "https://github.com/4lve/SteelMC/issues"
            },
            // Ein weiterer eingebauter Typ
            {
                label: "website",
                url: "https://github.com/4lve/SteelMC"
            },
            // Der News-Kanal auf Discord
            {
                label: "announcements",
                url: "https://discord.com/channels/1428487339759370322/1428487584966774795"
            },
            // Benutzerdefinierte TextComponent (Objekt-Label mit Formatierung)
            {
                label: {
                    text: "Visit the SteelMC Discord",
                    color: "blue",
                    bold: true
                },
                url: "https://discord.gg/suSXXNdVSf"
            }
        ]
    },
}
```
</details>
