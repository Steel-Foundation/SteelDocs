---
title: Ajouter un nouvel item (mise en place de base)
description: Donne les bases pour ajouter un nouvel item sans comportement, et quelques pistes pour le comportement
---

> ⚠️ Ceci n'est que la mise en place minimale et **n'apporte encore aucune fonctionnalité**.

---

## 1. Choisir l'item à ajouter

Commence par choisir l'item que tu veux ajouter au projet.

**Exemple :** dans ce guide, nous voulons ajouter l'item `Shovel` (la pelle).

---

## 2. Vérifier le nom de classe dans `classes.json`

Avant de créer notre structure, il faut vérifier comment la nommer correctement.

Ouvre le fichier :

```
steel-core/build/classes.json
```

Cherche dans ce fichier des chaînes proches du nom de l'item que tu veux implémenter. Dans notre exemple :
- On trouve `ShovelItem`

Cela veut dire qu'il nous faut **deux structures différentes** pour gérer les deux items.

---

## 3. Créer le fichier de ta classe d'item

Crée maintenant ta classe dans :

```
steel-core/src/behavior/items/
```
TODO: Si tu lis ceci, va voir dans #terminology s'il y a quelque chose de figé
Sois **le plus descriptif possible** dans le nom du fichier. Pour notre exemple :
- `shovel.rs`

---

## 4. Ajouter la définition de la structure

Ajoute la structure comme ceci dans ton fichier :

```rust
// /steel-core/src/behavior/items/shovel.rs
pub struct ShovelBehavior;

impl ItemBehavior for ShovelBehavior {}
```

> ⚠️ Ceci n'est que la mise en place de base et **n'apporte encore aucune fonctionnalité !**

---

## 5. Enregistrer le module de l'item

Pour enregistrer l'item, il faut ajouter l'attribut `item_behavior` !

```rust
// /steel-core/src/behavior/items/shovel.rs
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;

impl ItemBehavior for ShovelBehavior {}
```

> ⚠️ Les items plus complexes que la pelle ont des propriétés. Tu trouveras plus d'informations [ici](../../block_item_registration/).

---

## 6. Compiler le projet

Lance maintenant la **compilation** et laisse Rust (et notre configuration) opérer sa magie !

Après compilation, ton item devrait apparaître dans :

```
steel-core/src/behavior/generated/items.rs
```

Tu peux t'y rendre et faire **Ctrl + F** pour chercher le nom de ton item.

### Dépannage

Si ton item est toujours absent :

1. Supprime le dossier `generated`
2. Lance :

   ```
   cargo clean
   ```
3. Recompile

Cela devrait régler le problème.

---

# Ajouter un comportement à l'item

Comme déjà dit, à ce stade l'item **ne fait rien**.

Pour ajouter un comportement, tu dois implémenter les méthodes nécessaires de `ItemBehavior` dans ton fichier (par exemple `shovel.rs`).

👉 **Je te conseille** de regarder d'autres implémentations d'items pour repérer celles dont la fonctionnalité ressemble à la tienne.

---

## Autres ressources utiles

- pour utiliser les propriétés des blocs et des items, tu trouveras des informations [ici](../../block_item_registration)
