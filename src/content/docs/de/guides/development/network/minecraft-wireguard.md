---
title: Minecraft-Netzwerkverkehr debuggen
description: Wie man Minecraft-Netzwerkverkehr mit Wireshark debuggt
---

Dieses Dokument beschreibt, wie man Minecraft-Netzwerkverkehr debuggt, um zu überprüfen, wie Pakete gesendet werden mit Wireguard.

Wenn man nicht wireguard nutzen möchtest, dann gibt es noch dieses Projekt: [https://github.com/adepierre/SniffCraft](https://github.com/adepierre/SniffCraft)

## Voraussetzungen

Zunächst müssen **Verschlüsselung und Komprimierung deaktiviert** sein.
Der Komprimierungsschwellenwert sollte auf **1024** gesetzt sein.
Du findest dies in der Datei `config/config.json5`, die nach dem ersten Start generiert wird.

Du benötigst:

* Einen **lokalen Minecraft-Server**
* **Wireshark** mit Root-Rechten (oder entsprechenden Berechtigungen), um Traffic auf `localhost` zu erfassen

Erfasste Pakete können mit der offiziellen Protokolldokumentation verglichen werden:
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

Dies hilft, alle Pakettypen und deren Bedeutung zu verstehen.

## Wireshark-Einrichtung

Du kannst Wireshark sofort starten und die Pakete beobachten, aber für bessere Lesbarkeit wird empfohlen, ein **Wireshark-Dissector-Plugin** zu kompilieren und zu verwenden.

### Minecraft Wireshark Dissector

Repository:
[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)

Anforderungen:

* **Wireshark 4.6** (empfohlen)

Die beste Empfehlung ist, das Plugin selbst zu kompilieren, indem du die Anweisungen in der `ci.yaml`-Datei des Repositorys befolgst.

Nach der Kompilierung kopiere die generierte `.so`-Datei nach:

```bash
~/.local/lib/wireshark/plugins/4.6/epan
```

Passe den Pfad entsprechend deiner Wireshark-Version an.

### Protokolldaten-Repository

Klone das Protokolldaten-Repository:

[https://github.com/Nickid2018/MC_Protocol_Data](https://github.com/Nickid2018/MC_Protocol_Data)

## Wireshark-Konfiguration

Starte Wireshark (für Loopback-Erfassung muss dein Benutzer in der `wireshark`-Gruppe sein).

Navigiere dann zu:

**Preferences → Protocols → MCJE**

Wähle das Protokoll aus und setze den Pfad zum geklonten `MC_Protocol_Data`-Repository.
Danach **starte Wireshark neu**.

## Nützlicher Anzeigefilter

Um eine bessere Übersicht über den Minecraft-Traffic zu erhalten, verwende diesen Filter:

```
tcp.port == 25565 || udp.port == 25565
```

## Ergebnis

Am Ende werden die Pakete **deutlich lesbarer** sein als rohe Netzwerkdaten, was das Protokoll-Debugging erheblich erleichtert.

![Wireshark view](../../../../../../assets/wireshark_output.webp "Minecraft packet dissector output")

## Weitere nützliche Ressourcen

Diese Ressourcen können dir helfen, ein tieferes Verständnis zu erlangen:

- [Dekompiliertes Minecraft](../../../getting-started/decompile-minecraft)
- [https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)
