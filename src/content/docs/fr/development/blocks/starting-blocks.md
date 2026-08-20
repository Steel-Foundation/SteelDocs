---
title: Ajouter un nouveau bloc (mise en place de base)
description: Donne les bases pour ajouter un nouveau bloc sans comportement, et quelques pistes pour le comportement
---

> ⚠️ Ceci n'est que la mise en place minimale et **n'apporte encore aucune fonctionnalité**.

---

## 1. Choisir le bloc à ajouter

Commence par choisir le bloc que tu veux ajouter au projet.

**Exemple :** dans ce guide, nous voulons ajouter les **barreaux de fer** et les **barreaux de cuivre**.

---

## 2. Vérifier le nom de classe dans `classes.json`

Avant de créer notre structure, il faut vérifier comment la nommer correctement.

Ouvre le fichier :

```
steel-core/build/classes.json
```

Cherche ton bloc dans ce fichier. Dans notre exemple :
- On trouve `IronBarsBlock`
- On trouve `WeatheringCopperBarsBlock`

Cela veut dire qu'il nous faut **deux structures différentes** pour gérer les deux blocs.

---

## 3. Créer le fichier de ta classe de bloc

Crée maintenant ta classe dans :

```
steel-core/src/behavior/blocks/
```

Sois **le plus descriptif possible** dans le nom du fichier. Pour notre exemple :
- `iron_bars_block.rs`
- `copper_bars_block.rs`

---

## 4. Ajouter la définition de la structure

Ajoute la structure comme ceci dans ton fichier :

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

> ⚠️ Ceci n'est que la mise en place de base et **n'apporte encore aucune fonctionnalité !**

---

## 5. Enregistrer le module du bloc

Pour enregistrer le bloc, il faut ajouter l'attribut `block_behavior` !

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
#[block_behavior]
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

> ⚠️ Les blocs plus complexes que les barreaux de fer ont des propriétés. Tu trouveras plus d'informations [ici](../../block_item_registration/).

---

## 6. Compiler le projet

Lance maintenant la **compilation** et laisse Rust (et notre configuration) opérer sa magie !

Après compilation, ton bloc devrait apparaître dans :

```
steel-core/src/behavior/generated/blocks.rs
```

Tu peux t'y rendre et faire **Ctrl + F** pour chercher le nom de ton bloc.

### Dépannage

Si ton bloc est toujours absent :

1. Supprime le dossier `generated`
2. Lance :

   ```
   cargo clean
   ```
3. Recompile

Cela devrait régler le problème.

---

# Ajouter un comportement au bloc

Comme déjà dit, à ce stade le bloc **ne fait rien**.

Pour ajouter un comportement, tu dois implémenter les méthodes nécessaires de `BlockBehaviour` dans ton fichier (par exemple `iron_bars_block.rs`).

👉 **Je te conseille** de regarder d'autres implémentations de blocs pour repérer celles dont la fonctionnalité ressemble à la tienne.

Pour t'aider, voici quelques informations complémentaires :

---

## Travailler avec les états de bloc

### Récupérer un état de bloc

Pour récupérer un état de bloc, tu peux faire quelque chose comme ceci :

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

Cet état de bloc contient **toutes les informations** du bloc concerné.

---

### Modifier les propriétés d'un état de bloc

Cela se modifie ainsi :

```rust
state.set_value(&BlockStateProperties::WEST, true);
```

La lecture d'une valeur se fait de la même manière, dans l'autre sens.

---

## Vérifier les blocs voisins ou les tags

Pour vérifier si le voisin, ou l'ensemble de blocs, correspond à un bloc ou à un groupe de blocs précis (comme les barreaux ou les murets), tu peux utiliser ceci :

```rust
let walls_tag = Identifier::vanilla_static("walls");
if REGISTRY.blocks.is_in_tag(neighbor_block, &walls_tag) {
    return true;
}
```

---

Et voilà, tu as maintenant la **structure de base** en place et tu peux commencer à implémenter le vrai comportement 🚀

## Autres ressources utiles

- pour utiliser les propriétés des blocs et des items, tu trouveras des informations [ici](../../block_item_registration)
