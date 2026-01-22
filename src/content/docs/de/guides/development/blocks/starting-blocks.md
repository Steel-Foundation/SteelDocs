---
title: Einen neuen Block hinzufügen (Grundlegende Einrichtung)
description: Grundlegende Anleitung zum Hinzufügen eines neuen Blocks ohne Verhalten mit Hinweisen für Verhaltensimplementierung
---

> ⚠️ Dies ist nur die grundlegende Einrichtung und **bietet noch keine Funktionalität**.

---

## 1. Wähle aus, welchen Block du hinzufügen möchtest

Wähle zunächst aus, welchen Block du zum Projekt hinzufügen möchtest.

**Beispiel:** In dieser Anleitung möchten wir **IronBars** und **CopperBars** hinzufügen.

---

## 2. Überprüfe den Klassennamen in `classes.json`

Bevor wir unser Struct erstellen können, müssen wir überprüfen, wie wir es richtig benennen müssen.

Gehe zur Datei:

```
steel-core/build/classes.json
```

Suche in dieser Datei nach deinem Block. In unserem Beispiel:
- Wir finden `IronBarsBlock`
- Wir finden `WeatheringCopperBarsBlock`

Das bedeutet, dass wir bereits **zwei verschiedene Structs** benötigen, um beide zu verwalten.

---

## 3. Erstelle deine Block-Klassendatei

Erstelle nun deine Klasse in:

```
steel-core/src/behavior/blocks/
```

Sei **so beschreibend wie möglich** mit dem Dateinamen. Für unser Beispiel:
- `iron_bars_block.rs`
- `copper_bars_block.rs`

---

## 4. Füge die Struct-Definition hinzu

Füge das Struct so zu deiner Datei hinzu:

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
    /// Creates a new bar block behavior for the given block.
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehaviour for IronBarsBlock {}
```

> ⚠️ Dies ist nur die grundlegende Einrichtung und **bietet noch keine Funktionalität!**

---

## 5. Block-Modul registrieren

Füge dein Block-Modul hinzu zu:

```
steel-core/src/behavior/blocks/mod.rs
```

Es sollte so aussehen:

```rust
// /steel-core/src/behavior/blocks/mod.rs
mod iron_bars_block;
pub use iron_bars_block::IronBarsBlock;
```

---

## 6. Struct-Namen überprüfen

Jetzt wäre es **ein guter Zeitpunkt zu überprüfen**, ob dein Struct-Name wirklich korrekt ist!

Überprüfe nochmals, dass dein **Struct-Name** mit dem übereinstimmt, was du in `classes.json` gefunden hast.

---

## 7. Struct zu den generierten Blöcken hinzufügen

Jetzt müssen wir das Struct zur generierten Block-Liste hinzufügen.
Dies geschieht in:

```
steel-core/build/blocks.rs
```

Wenn du verstehen möchtest, was intern passiert, kann die Funktion
`generate_registrations` interessant sein — aber **es ist nicht erforderlich**, um deinen Block zum Laufen zu bringen.

---

## 8. Fokus auf die Build-Funktion

Wir konzentrieren uns nun auf die `build`-Funktion in der geöffneten Datei.

⚠️ **Wichtig:**
Nur **neuen Code hinzufügen**.
**Keinen bestehenden Code entfernen oder ändern**, da dies Blöcke anderer Mitwirkender beschädigen könnte.

---

## 9. Einen veränderbaren Vektor erstellen

Erstelle zunächst einen veränderbaren Vektor mit einem beschreibenden Namen:

```rust
// /steel-core/build/blocks.rs
let mut iron_bar_blocks = Vec::new();
```

---

## 10. Match-Statement erweitern

Füge deinen Block-Struct-Namen zum `match`-Statement hinzu.
Nochmals: **nur deine Zeile hinzufügen**, keine anderen entfernen.

```rust
// /steel-core/build/blocks.rs
for block in blocks {
    let const_ident = to_const_ident(&block.name);
    match block.class.as_str() {
        ...
        "IronBarsBlock" => iron_bar_blocks.push(const_ident),
        _ => {}
    }
}
```

---

## 11. Block-Typ definieren

Definiere nun den Block-Typ-Identifier:

```rust
// /steel-core/build/blocks.rs
let iron_bar_type = Ident::new("IronBarsBlock", Span::call_site());
```

---

## 12. Registrierungen generieren

Als Nächstes die Registrierungen generieren:

```rust
// /steel-core/build/blocks.rs
let iron_bar_registrations =
    generate_registrations(iron_bar_blocks.iter(), &iron_bar_type);
```

---

## 13. Registrierungen zur Ausgabe hinzufügen

⚠️ **Sei hier sehr vorsichtig!**

* Das `#` vor dem Registrierungsnamen ist **erforderlich**
* Es verhindert Namenskollisionen mit Rust-Keywords
* Füge **kein** abschließendes Komma hinzu — dieser Code wird in eine andere Datei generiert

Beispiel:

```rust
// /steel-core/build/blocks.rs
let output = quote! {
    //! Generated block behavior assignments.

    use steel_registry::vanilla_blocks;
    use crate::behavior::BlockBehaviorRegistry;
    use crate::behavior::blocks::{
        CraftingTableBlock,
        CropBlock,
        EndPortalFrameBlock,
        FarmlandBlock,
        FenceBlock,
        RotatedPillarBlock,
        BarBlock
    };

    pub fn register_block_behaviors(registry: &mut BlockBehaviorRegistry) {
        ...
        #iron_bar_registrations
    }
};
```

---

## 14. Projekt kompilieren

Drücke nun auf **kompilieren** und lass Rust (und unsere Konfiguration) etwas Magie wirken!

Nach der Kompilierung sollte dein Block erscheinen in:

```
steel-core/src/behavior/generated/blocks.rs
```

Du kannst dort hingehen und mit **Strg + F** nach deinem Blocknamen suchen.

### Fehlerbehebung

Wenn dein Block noch fehlt:

1. Lösche den `generated`-Ordner
2. Führe aus:

   ```
   cargo clean
   ```
3. Kompiliere erneut

Dies sollte das Problem lösen.

---

# Verhalten zum Block hinzufügen

Wie bereits gesagt, **macht der Block an diesem Punkt nichts**.

Um Verhalten hinzuzufügen, musst du die notwendigen Methoden in `BlockBehaviour` in deiner Datei implementieren (z.B. `iron_bars_block.rs`).

👉 **Ich würde empfehlen**, sich andere Block-Implementierungen anzusehen, um zu prüfen, welche ähnliche Block-Funktionalität wie dein Block haben.

Dafür sind hier einige Informationen, um dir ein besseres Verständnis zu geben:

---

## Arbeiten mit Block-States

### Einen Block-State abrufen

Um einen Block-State abzurufen, kannst du etwas wie dies tun:

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

In diesem Block-State sind **alle Informationen** über diesen spezifischen Block gespeichert.

---

### Block-State-Eigenschaften ändern

Dies kann so geändert werden:

```rust
state.set_value(&BlockStateProperties::WEST, true);
```

Einen Wert abzurufen funktioniert umgekehrt.

---

## Nachbarblöcke oder Tags überprüfen

Um zu überprüfen, ob der Nachbar oder der gesetzte Block ein bestimmter Block oder eine Blockgruppe (wie Gitterstäbe oder Mauern) ist, kannst du dies verwenden:

```rust
let walls_tag = Identifier::vanilla_static("walls");
if REGISTRY.blocks.is_in_tag(neighbor_block, &walls_tag) {
    return true;
}
```

---

Das war's — du hast nun die **Grundstruktur** eingerichtet und kannst mit der Implementierung von echtem Verhalten beginnen 🚀

## Weitere nützliche Ressourcen
Derzeit keine verfügbar
