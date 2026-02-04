---
title: Reflection in Extractors
description: How to use Java reflection to access private Minecraft internals in Steel Extractor.
sidebar:
  order: 1
---

Many Minecraft internals (fields, methods) are `private` or `protected` and cannot be accessed directly. The Steel Extractor uses **Java Reflection** to read these values at runtime.

This guide demonstrates the reflection patterns used in the project, using the **Tag Extractor** as a reference.

---

## The Tag Extractor

The `Tags` extractor iterates over the built-in registries and extracts block and item tags. It uses registry API methods that internally rely on `Holder` objects, which wrap registry entries.

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

        // Same pattern for items...
        return topLevelJson
    }
}
```

The key method here is `holder.unwrapKey()`, which extracts the `ResourceKey` from a `Holder<T>` so we can get the registry identifier. The `getTags()` method returns named holder sets that group registry entries by tag.

---

## Reading Private Fields

When a value is not exposed through any public API, you can read it via reflection. This pattern is used heavily in the `Blocks` and `Fluids` extractors to read `BlockBehaviour.Properties`:

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

Usage example from the `Blocks` extractor:

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

## Looking Up Constant Names

Sometimes you have a reference to an object (e.g. a `SoundType` instance) and want to find which static constant it corresponds to. This is done by scanning all public static fields and comparing by reference equality:

```kotlin
fun getConstantName(clazz: Class<*>, value: Any?): String? {
    for (f in clazz.getFields()) {
        try {
            val fieldValue = f.get(null)
            if (fieldValue === value) {  // Reference equality
                return f.getName()
            }
        } catch (e: IllegalAccessException) {
            // ignore
        }
    }
    return null
}
```

Usage:

```kotlin
val soundType = getPrivateFieldValue<SoundType>(behaviourProps, "soundType")
val soundTypeName = getConstantName(SoundType::class.java, soundType)
// Returns e.g. "STONE", "WOOD", "METAL"
```

---

## Invoking Protected Methods

The `Fluids` extractor needs to call protected methods. Since protected methods are not visible outside the class hierarchy, reflection is used to traverse the superclass chain:

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

## Scanning Static Constants

The `LevelEvents` and `SoundTypes` extractors scan a class for all `public static final` fields using modifier checks:

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

This pattern is useful when a class defines a large number of constants (like event IDs or sound types) and you want to extract all of them automatically without listing each one manually.

---

## Other useful resources

- [Steel Extractor Overview](../steel_extractor) - General overview and list of all extractors
