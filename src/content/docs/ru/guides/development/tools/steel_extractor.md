---
title: Steel Extractor
description: Мод Fabric, извлекающий игровые данные Minecraft в JSON-файлы.
sidebar:
  order: 0
---

**Steel Extractor** — это мод для [Fabric](https://fabricmc.net/), написанный на Kotlin, который работает на сервере Minecraft и извлекает полные игровые данные в JSON-файлы. Это основной инструмент для генерации файлов данных, используемых Steel.

Мод подключается к жизненному циклу запуска сервера и автоматически запускает все экстракторы после полной загрузки сервера. Результат записывается в каталог `steel_extractor_output/` в виде отформатированного JSON.

---

## Как использовать

Сначала нужно создать рабочий каталог.
Это очень просто: соберите проект из командной строки или просто нажмите кнопку Run в вашей среде разработки (например, IntelliJ).
Minecraft запустится, создаст новый мир, и вы сможете в него зайти.

Будет создана папка `steel-extractor`. В ней вы найдёте все сгенерированные JSON-файлы, которые Steel использует как эталон ванильных данных.
Не все JSON-файлы расположены в одном и том же каталоге в Steel. Поэтому обязательно сверяйтесь с маппингом, прежде чем что-то перемещать!

## Как это работает

Экстрактор регистрирует событие `SERVER_STARTED`. Когда сервер завершает загрузку, он обходит все зарегистрированные экстракторы, вызывает их метод `extract()` и записывает результат в JSON-файл.

Каждый экстрактор реализует интерфейс `Extractor`:

```kotlin
interface Extractor {
    fun fileName(): String

    @Throws(Exception::class)
    fun extract(server: MinecraftServer): JsonElement
}
```

---

## Извлекаемые данные

В следующей таблице перечислены все экстракторы и данные, которые они создают:

| Экстрактор            | Выходной файл         | Описание                                                                                                     |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Blocks`              | `blocks.json`         | Все блоки со свойствами поведения, состояниями блоков, значениями по умолчанию, коллизиями и формами контуров |
| `BlockEntities`       | `block_entities.json` | Ключи реестра всех типов блочных сущностей                                                                   |
| `Items`               | `items.json`          | Все предметы с компонентами, ссылками на блоки и именами классов                                             |
| `Packets`             | `packets.json`        | Все пакеты сервера и клиента, сгруппированные по фазам протокола                                             |
| `MenuTypes`           | `menutypes.json`      | Все типы меню/GUI (например, верстак, печь)                                                                  |
| `Entities`            | `entities.json`       | Сущности с размерами, синхронизируемыми данными, атрибутами и флагами поведения                              |
| `Fluids`              | `fluids.json`         | Все жидкости со свойствами поведения и данными состояний                                                     |
| `GameRulesExtractor`  | `game_rules.json`     | Все игровые правила с типами, значениями по умолчанию и границами                                            |
| `Classes`             | `classes.json`        | Имена Java-классов для всех блоков и предметов                                                               |
| `Attributes`          | `attributes.json`     | Атрибуты сущностей со значениями по умолчанию, диапазонами и информацией синхронизации                       |
| `MobEffects`          | `mob_effects.json`    | Эффекты статуса с категориями и цветами                                                                      |
| `Potions`             | `potions.json`        | Зелья с их эффектами, продолжительностью и усилителями                                                       |
| `SoundTypes`          | `sound_types.json`    | Типы звуков блоков с громкостью, тональностью и ссылками на звуковые события                                 |
| `SoundEvents`         | `sound_events.json`   | Сопоставление всех путей звуковых событий с идентификаторами реестра                                         |
| `LevelEvents`         | `level_events.json`   | Все константы событий уровня (частицы, звуки)                                                                |
| `Tags`                | `tags.json`           | Теги блоков и предметов (исключая пространство имён `minecraft`)                                             |

---

## Написание простого экстрактора

Вот минимальный пример создания нового экстрактора. Этот экстрактор выводит все атрибуты сущностей с их значениями по умолчанию:

```kotlin
package com.steelextractor.extractors

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.steelextractor.SteelExtractor
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.server.MinecraftServer

class Attributes : SteelExtractor.Extractor {

    override fun fileName(): String {
        return "attributes.json"
    }

    override fun extract(server: MinecraftServer): JsonElement {
        val attributesArray = JsonArray()

        for (attribute in BuiltInRegistries.ATTRIBUTE) {
            val key = BuiltInRegistries.ATTRIBUTE.getKey(attribute)
            val name = key?.path ?: "unknown"

            val attributeJson = JsonObject()
            attributeJson.addProperty("id", BuiltInRegistries.ATTRIBUTE.getId(attribute))
            attributeJson.addProperty("name", name)
            attributeJson.addProperty("default_value", attribute.defaultValue)

            attributesArray.add(attributeJson)
        }

        return attributesArray
    }
}
```

Чтобы зарегистрировать новый экстрактор, добавьте его в массив `extractors` в `SteelExtractor.kt`:

```kotlin
val extractors = arrayOf(
    Blocks(),
    // ... другие экстракторы ...
    Attributes(),
    MyNewExtractor()  // Добавьте ваш экстрактор сюда
)
```

После запуска сервера результат появится в `steel_extractor_output/attributes.json`.

---

## Другие полезные ресурсы

- [Рефлексия в экстракторах](../tools/reflection_extractor) — как использовать Java-рефлексию для доступа к приватным внутренним частям Minecraft