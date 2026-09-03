---
title: Wie man Minecraft dekompiliert
description: Anleitung zum Dekompilieren von Minecraft für die Entwicklung.
---

Vor Version 1.21.11 war der Code verschleiert und Mappings waren erforderlich, aber dieser Server zielt auf >=1.21.11 ab. Diese Dokumentation hilft dir nur mit diesen Versionen.

## Voraussetzungen

Unten findest du einen Befehl für 1.21.11 und für 26.1 Snapshot 3, aber du kannst jede Version damit verwenden.
Nutze den Minecraft Launcher (auch Prism, etc.), erstelle eine Instanz mit deiner Zielversion und starte sie. Dies wird die JAR-Datei herunterladen. Der Speicherort hängt vom Launcher und Betriebssystem ab. Sobald du die JAR-Datei hast, kannst du eine der unten stehenden Optionen ausführen.

## Es gibt mehrere Möglichkeiten

- Das repo bietet ein script an `update-minecraft-src.sh`, welches alles für dich macht, wenn du den code lokal haben möchtest

- Du kannst online dir den decompilten code anschauen, und somit links verschicken. Die Seite ist: you can use https://mcsrc.dev/#1/1.21.11_unobfuscated as an alternative

- Um den Minecraft-Quellcode anzusehen, kannst du [gitcraft](https://github.com/WinPlay02/GitCraft) klonen und
  `./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"` ausführen. Dies erstellt
  `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` mit dem gesamten Quellcode.

- Oder du kannst die [vinflower.jar](https://github.com/Vineflower/vineflower/releases) herunterladen und dann diesen Befehl ausführen:
  `java -jar vineflower-1.11.2.jar ./minecraft-26.1-snapshot-3-client.jar --folder minecraft_26.1`. Das erstellt einen
  Ordner namens `minecraft_26.1`.

## Weitere nützliche Ressourcen
- Videos auf YouTube, die dir ebenfalls eine gute Anleitung geben
