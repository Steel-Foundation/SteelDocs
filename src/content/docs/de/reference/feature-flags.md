---
title: Feature Flags
description: Vollständige Referenz aller Compile-Zeit Feature Flags in SteelMC
sidebar:
  order: 1
---

SteelMC verwendet Rusts Feature-Flag-System, um bestimmte Funktionen zur Kompilierzeit zu aktivieren oder deaktivieren. Dies ermöglicht es dir, deinen Build für spezifische Anwendungsfälle anzupassen.

## steel (Hauptpaket)

Diese Flags steuern die Haupt-Server-Executable.

| Feature | Standard | Beschreibung |
|---------|----------|--------------|
| `mimalloc` | ✅ Aktiviert | MiMalloc als Speicherallokator für verbesserte Performance verwenden |
| `deadlock_detection` | ❌ Deaktiviert | Deadlock-Erkennung mit parking_lot aktivieren (für Debugging) |
| `dhat-heap` | ❌ Deaktiviert | DHAT Heap-Profiler für Speicheranalyse aktivieren |

### Verwendungsbeispiel

```bash
# Build mit Deadlock-Erkennung
cargo build --features deadlock_detection

# Build ohne mimalloc
cargo build --no-default-features
```

## steel-core

Diese Flags steuern die Kern-Spiellogik.

| Feature | Standard | Beschreibung |
|---------|----------|--------------|
| `stand-alone` | ❌ Deaktiviert | Stand-Alone-Modus mit eingebettetem Standard-Favicon aktivieren |
| `debug_measurement_output` | ✅ Aktiviert | Debug-Ausgabe für Chunk-Generierung und Tick-Messungen aktivieren |

### stand-alone Modus

Wenn aktiviert, enthält der Server ein Standard-Favicon als eingebettete Bytes. Dies ist nützlich für die Verteilung einer einzelnen Binary ohne externe Assets.

### debug_measurement_output

Gibt detaillierte Timing-Informationen aus für:
- Chunk-Generierungs-Performance
- Tick-Messungen
- Performance-Profiling-Daten

## steel-registry

Diese Flags steuern das Game-Registry-System.

| Feature | Standard | Beschreibung |
|---------|----------|--------------|
| `fmt` | ❌ Deaktiviert | Formatierungsfunktionen aktivieren |
| `minecraft-src` | ❌ Deaktiviert | Minecraft-Source-Mappings verwenden |

## Features kombinieren

Du kannst mehrere Features kombinieren:

```bash
# Build mit mehreren Features
cargo build --features "deadlock_detection,debug_measurement_output"

# Build für Standalone-Distribution
cargo build --release --features stand-alone
```

## Produktionsempfehlungen

Für Produktionsserver empfehlen wir:

- **`mimalloc` aktiviert lassen** - Bietet signifikante Verbesserungen bei der Speicherallokation
- **`deadlock_detection` deaktivieren** - Nur für Debugging benötigt
- **`dhat-heap` deaktivieren** - Nur für Speicheranalyse benötigt
- **`stand-alone` in Betracht ziehen** - Wenn als einzelne Binary verteilt wird
