---
title: Рефлексия в экстракторах
description: Как использовать Java рефлексию для доступа к приватным внутренностям Minecraft в Steel Extractor.
sidebar:
  order: 2
---

Многие внутренние элементы Minecraft (поля, методы) являются `private` или `protected` и не могут быть доступны напрямую. Steel Extractor использует **Java Reflection** для чтения этих значений во время выполнения.

Это руководство демонстрирует шаблоны рефлексии, используемые в проекте, на примере **экстрактора тегов**.

---

## Экстрактор тегов

Экстрактор `Tags` обходит встроенные реестры и извлекает теги блоков и предметов. Он использует методы API реестров, которые внутри себя полагаются на объекты `Holder`, обёртывающие записи реестра.

```kotlin
class Tags : SteelExtractor.Extractor {

    override fun fileName(): String {
        return "tags.json"
    }

    override fun extract(server: MinecraftServer): JsonElement {
        val topLevelJson = JsonObject()
        val blockTagsJson = JsonObject()

        BuiltInRegistries.BLOCK.getTags().forEach { namedHolderSet ->
            if (namedHolderSet.size() > 0
                && namedHolderSet.key().location().namespace != "minecraft") {
                val entriesArray = JsonArray()
                namedHolderSet.stream().forEach { holder ->
                    holder.unwrapKey().ifPresent { key ->
                        entriesArray.add(key.identifier().toString())
                    }
                }
                blockTagsJson.add(
                    namedHolderSet.key().location().toString(), entriesArray
                )
            }
        }
        topLevelJson.add("block", blockTagsJson)

        // Тот же шаблон для предметов...
        return topLevelJson
    }
}
```

Ключевой метод здесь - `holder.unwrapKey()`, который извлекает `ResourceKey` из `Holder<T>`, чтобы получить идентификатор реестра. Метод `getTags()` возвращает именованные наборы держателей, группирующие записи реестра по тегам.

---

## Чтение приватных полей

Если значение не доступно через публичный API, его можно прочитать с помощью рефлексии. Этот шаблон активно используется в экстракторах `Blocks` и `Fluids` для чтения `BlockBehaviour.Properties`:

```kotlin
inline fun <reified T : Any> getPrivateFieldValue(obj: Any, fieldName: String): T? {
    return try {
        val field: Field = obj.javaClass.getDeclaredField(fieldName)
        field.isAccessible = true
        field.get(obj) as T?
    } catch (e: NoSuchFieldException) {
        null
    } catch (e: IllegalAccessException) {
        null
    } catch (e: ClassCastException) {
        null
    }
}
```

Пример использования из экстрактора `Blocks`:

```kotlin
val behaviourProps = (block as BlockBehaviour).properties()

behaviourJson.addProperty(
    "hasCollision",
    getPrivateFieldValue<Boolean>(behaviourProps, "hasCollision")
)
behaviourJson.addProperty(
    "destroyTime",
    getPrivateFieldValue<Float>(behaviourProps, "destroyTime")
)
behaviourJson.addProperty(
    "explosionResistance",
    getPrivateFieldValue<Float>(behaviourProps, "explosionResistance")
)
```

---

## Поиск имён констант

Иногда у вас есть ссылка на объект (например, экземпляр `SoundType`) и нужно найти, какой статической константе он соответствует. Это делается путём сканирования всех публичных статических полей и сравнения по ссылочному равенству:

```kotlin
fun getConstantName(clazz: Class<*>, value: Any?): String? {
    for (f in clazz.getFields()) {
        try {
            val fieldValue = f.get(null)
            if (fieldValue === value) {  // Сравнение по ссылке
                return f.getName()
            }
        } catch (e: IllegalAccessException) {
            // игнорируем
        }
    }
    return null
}
```

Использование:

```kotlin
val soundType = getPrivateFieldValue<SoundType>(behaviourProps, "soundType")
val soundTypeName = getConstantName(SoundType::class.java, soundType)
// Возвращает, например, "STONE", "WOOD", "METAL"
```

---

## Вызов защищённых методов

Экстрактору `Fluids` требуется вызывать защищённые методы. Поскольку защищённые методы не видны вне иерархии классов, используется рефлексия для обхода цепочки суперклассов:

```kotlin
private fun getProtectedMethod(
    obj: Any,
    methodName: String,
    vararg paramTypes: Class<*>
): Method? {
    var clazz: Class<*>? = obj.javaClass
    while (clazz != null) {
        try {
            val method = clazz.getDeclaredMethod(methodName, *paramTypes)
            method.isAccessible = true
            return method
        } catch (_: NoSuchMethodException) {
            clazz = clazz.superclass
        }
    }
    return null
}
```

---

## Сканирование статических констант

Экстракторы `LevelEvents` и `SoundTypes` сканируют класс на наличие полей `public static final` с помощью проверок модификаторов:

```kotlin
for (field in LevelEvent::class.java.declaredFields) {
    val modifiers = field.modifiers
    if (Modifier.isPublic(modifiers)
        && Modifier.isStatic(modifiers)
        && Modifier.isFinal(modifiers)
        && field.type == Int::class.javaPrimitiveType) {
        // field.name -> field.getInt(null)
    }
}
```

Этот шаблон полезен, когда класс определяет большое количество констант (например, идентификаторы событий или типы звуков) и вы хотите извлечь их все автоматически, не перечисляя вручную.

---

## Другие полезные ресурсы

- [Обзор Steel Extractor](../steel_extractor) - общее описание и список всех экстракторов