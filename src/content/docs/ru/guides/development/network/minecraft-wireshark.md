---
title: Отладка сетевого трафика Minecraft
description: Как отлаживать сетевой трафик Minecraft с помощью Wireshark
---

В этом документе описывается, как отлаживать сетевой трафик Minecraft для проверки отправки пакетов с помощью Wireshark.

Если вы не хотите использовать Wireshark, вам может пригодиться этот проект: [https://github.com/adepierre/SniffCraft](https://github.com/adepierre/SniffCraft)

## Подготовка

Во-первых, **шифрование и сжатие должны быть отключены**.
Порог сжатия следует установить в **1024**.
Это можно сделать в файле `config/steel_config.json5`, который будет создан после первого запуска.

Вам понадобятся:

* **Локальный сервер Minecraft**
* **Wireshark**, запущенный с правами root (или соответствующими разрешениями) для захвата трафика на `localhost`

Захваченные пакеты можно сравнивать с официальной документацией протокола:
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

Это помогает понять все типы пакетов и их назначение.

## Настройка Wireshark

Вы можете запустить Wireshark и сразу наблюдать пакеты, но для лучшей читаемости рекомендуется скомпилировать и использовать **плагин-диссектор Wireshark**.

### Диссектор Minecraft для Wireshark

Репозиторий:
[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)

Требования:

* **Wireshark 4.6** (рекомендуется)

Лучшая рекомендация - скомпилировать плагин самостоятельно, следуя инструкциям из файла `ci.yaml` репозитория.

**Для Linux:**\
После компиляции скопируйте полученный файл `.so` в:

```bash
~/.local/lib/wireshark/plugins/<версия Wireshark>/epan
```

**Для Windows:**\
После компиляции скопируйте полученный файл `.dll` в:
```bash
plugins/<версия Wireshark>/epan
```

Подставьте вашу версию Wireshark.

### Репозиторий данных протокола

Клонируйте репозиторий данных протокола:

[https://github.com/Nickid2018/MC_Protocol_Data](https://github.com/Nickid2018/MC_Protocol_Data)

## Конфигурация Wireshark

Запустите Wireshark от непривилегированного пользователя! (в Linux для захвата на loopback ваш пользователь должен быть в группе `wireshark`).

Затем перейдите:

**Preferences → Protocols → Minecraft**

Выберите протокол и укажите путь к клонированному репозиторию `MC_Protocol_Data`.
После этого **перезапустите Wireshark**.

## Полезный фильтр отображения

Чтобы видеть только трафик Minecraft, используйте фильтр:

```
mcje
```

## Результат

В итоге пакеты станут **гораздо более читаемыми**, чем сырые сетевые данные, что значительно упростит отладку протокола.

![Вид Wireshark](../../../../../../assets/wireshark_output.webp "Вывод диссектора пакетов Minecraft")

## Другие полезные ресурсы

Эти ресурсы помогут вам углубить понимание:

- [Декомпилированный Minecraft](../../../getting-started/decompile-minecraft)
- [https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)