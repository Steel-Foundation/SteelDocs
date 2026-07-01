---
title: Code Konvention
description: Die Konvention für den Aufbau des Projektes für den Source Code
---

- # Code-Standard

  ## Allgemein

  - Normalerweise ist Vanilla bei der Benennung von Dingen recht gut, daher macht es das Lesen für die nächste Person einfacher, wenn man sich an dieselben Namen hält. Manchmal muss jedoch davon abweichen, wenn Namen schlecht oder nicht aussagekräftig sind, oder wenn eine völlig andere Lösung für das betreffende System gewünscht wird. In diesem Fall sollte ein Dokumentationskommentar über der Struct, Methode oder dem Modul hinzugefügt werden, der die Unterschiede klar beschreibt, damit jemand Neues beim nächsten Mal das System leicht verstehen kann.
  - Code-Duplizierung sollte minimiert werden, aber ein paar Zeilen sind normalerweise in Ordnung.
  - Bei der Arbeit an Fundamenten muss besonders sichergestellt werden, dass keine Abkürzungen genommen oder Dinge ausgelassen werden. Dies kann später Probleme verursachen, wenn ein grundlegendes System komplett neu gestaltet werden muss. Fundamentaler Code ist Code wie ein System oder Interface, von dem anderer Code abhängt. Ein Beispiel ist das Block-Behavior-Trait – wenn das von Anfang an schlecht designed ist und 100 Block-Implementierungen darauf aufbauen, viel Glück dabei, es zu ändern. Das schließt aber zukünftige fundamentale Änderungen nicht aus, wenn das erste System mit Langlebigkeit im Sinn designed wurde. Ein Beispiel für diese Art von Fundament ist unser Chunk-Scheduler, bei dem die Chunk-Stufen und Regeln für deren Ausführung bereits designed sind. Das bedeutet, dass das Austauschen des Schedulers den Generierungscode nicht kaputt macht.
  - Keine Workarounds. Nicht faul sein und das Erstellen einer Hilfsfunktion überspringen, nur weil sie für den eigenen Anwendungsfall nur einmal gebraucht wurde.
  - Versuchen, nicht tief in der Einrückung zu gehen. Guard-Clauses sind dafür nützlich und Rust hat einige wirklich schöne `if let` und `let Some() = x else {return}`
  - Panics nur verwenden, wenn der Fall niemals eintritt oder fatal für das Programm ist. Ansonsten Results verwenden.
  - Multithreading sollte nicht genutzt werden, es sei denn, es kann erklärt werden, warum Multithreading benötigt wird, und mit Benchmarks bewiesen werden kann, dass es besser ist.
  - Async nur verwenden, wenn Festplatten- oder Netzwerk-I/O benötigt wird, oder Massennutzung von rechenarmen Tasks, die Awaiting benötigen (Chunk-Abhängigkeiten, aber die Generierung läuft auf Rayon). Immer sicherstellen, dass rechenintensiver Code niemals in einer Async-Runtime ausgeführt wird – die Lücke mit spawn_blocking oder dem Spawnen eines Rayon-Tasks überbrücken.
  - [samply](https://github.com/mstange/samply) oder [jaeger](https://www.jaegertracing.io/docs/latest/getting-started/) für Profiling verwenden. Jaeger ist am besten für Timing mit Tracing-Spans und das Erfassen von Kontext und Durchschnittswerten. Samply ist am besten, wenn ein einfacher Flamegraph gewünscht wird, um zu sehen, welche interne Funktion die meisten Ressourcen verbraucht, zum Beispiel für Weltgenerierung.
  - Keine unnötigen Dependencies hinzufügen. Das hier ist nicht JavaScript, is-even und left-pad werden nicht gebraucht.
  - Wenn ein Feature nicht vollständig implementiert wurde, sicherstellen, dass ein // TODO: Kommentar hinzugefügt wird.

  ## Registries

  - Nur das generieren, was benötigt wird. Verwendet Minecraft eine hardcodierte Kollisions-Transformation für Entities in verschiedenen Zuständen? Dann sollte das hier auch so sein, anstatt sie zu extrahieren.
  - Registries mit komplexer Logik sollten von Hand geschrieben werden, es sei denn, sie haben viele Einträge (30+). Etwas wie Data-Components und Entity-Serializer beinhalten viel manuelle Arbeit, um die Serializer richtig hinzubekommen, und sie haben nur wenige Einträge, also kein Grund, es mit Generierung zusätzlich zu verkomplizieren.
  - Die Extraktionsdaten aus dem Minecraft-Datapack sollten verwendet werden, anstatt ein benutzerdefiniertes Format zu generieren, wenn sie dort existieren. Das gilt normalerweise für das, was Mojang Reloadable Registries nennt, einschließlich Tags, Worldgen-Daten und solche Sachen. Vanilla BuiltIn-Registries müssen extrahiert werden.
  - Alles sollte mit Modding und ABI-Kompatibilität für die Zukunft im Hinterkopf designed werden. Keine Anforderung, ein Other-Enum-Attribut hinzuzufügen, aber es muss sichergestellt werden, dass es designed ist, dies in Zukunft zu handhaben. Dieselben Standards wie NeoForge sollten beim Modding eingehalten werden, also sollten sogar Block-Registries (Vanilla BuiltIn-Registries) dies im Hinterkopf behalten.

  ## Testing

  - Tests für fortgeschrittene Systeme hinzufügen, Code der unsafe verwendet (immer // SAFETY Kommentare verwenden) oder Code, der mit Vanilla-Determinismus übereinstimmen muss (ItemComponent-Hashing oder Worldgen).
  - Clippy-Lints nur mit einem Begründungskommentar #[allow]en, es sei denn, es ist offensichtlich. Falsch-Positive und absichtliche Abweichungen (z.B. Funktionslänge für bessere Lesbarkeit) sind akzeptabel, wenn sie erklärt werden.