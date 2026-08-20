---
title: La réflexion dans les extracteurs
description: Comment utiliser la réflexion Java pour accéder aux internes privés de Minecraft dans le Steel Extractor.
sidebar:
  order: 2
---

De nombreux internes de Minecraft (champs, méthodes) sont `private` ou `protected` et ne sont pas accessibles directement. Le Steel Extractor utilise la **réflexion Java** pour lire ces valeurs à l'exécution.

Ce guide présente les motifs de réflexion utilisés dans le projet, en prenant l'**extracteur de tags** comme référence.

---

## L'extracteur de tags

L'extracteur `Tags` parcourt les registres intégrés et extrait les tags de blocs et d'items. Il s'appuie sur des méthodes de l'API de registre qui reposent en interne sur des objets `Holder`, lesquels enveloppent les entrées de registre.

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

        // Même motif pour les items...
        return topLevelJson
    }
}
```

La méthode clé ici est `holder.unwrapKey()`, qui extrait la `ResourceKey` d'un `Holder<T>` afin d'obtenir l'identifiant de registre. La méthode `getTags()` renvoie des ensembles de holders nommés, qui regroupent les entrées de registre par tag.

---

## Lire des champs privés

Quand une valeur n'est exposée par aucune API publique, tu peux la lire par réflexion. Ce motif est très utilisé dans les extracteurs `Blocks` et `Fluids` pour lire `BlockBehaviour.Properties` :

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

Exemple d'utilisation, tiré de l'extracteur `Blocks` :

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

## Retrouver le nom d'une constante

Il arrive que tu aies une référence vers un objet (une instance de `SoundType`, par exemple) et que tu veuilles savoir à quelle constante statique elle correspond. Cela se fait en parcourant tous les champs statiques publics et en comparant par identité de référence :

```kotlin
fun getConstantName(clazz: Class<*>, value: Any?): String? {
    for (f in clazz.getFields()) {
        try {
            val fieldValue = f.get(null)
            if (fieldValue === value) {  // Égalité de référence
                return f.getName()
            }
        } catch (e: IllegalAccessException) {
            // on ignore
        }
    }
    return null
}
```

Utilisation :

```kotlin
val soundType = getPrivateFieldValue<SoundType>(behaviourProps, "soundType")
val soundTypeName = getConstantName(SoundType::class.java, soundType)
// Renvoie par exemple "STONE", "WOOD", "METAL"
```

---

## Appeler des méthodes protégées

L'extracteur `Fluids` a besoin d'appeler des méthodes protégées. Comme celles-ci ne sont pas visibles en dehors de la hiérarchie de classes, on utilise la réflexion pour remonter la chaîne des superclasses :

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

## Parcourir les constantes statiques

Les extracteurs `LevelEvents` et `SoundTypes` parcourent une classe à la recherche de tous les champs `public static final`, en vérifiant les modificateurs :

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

Ce motif est utile quand une classe définit un grand nombre de constantes (identifiants d'événements, types de sons) et que tu veux toutes les extraire automatiquement, sans les lister une par une.

---

## Autres ressources utiles

- [Vue d'ensemble du Steel Extractor](../steel_extractor) - Présentation générale et liste de tous les extracteurs
