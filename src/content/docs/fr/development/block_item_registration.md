---
title: Enregistrement des blocs et des items
description: Un guide complet pour enregistrer un nouveau comportement d'item ou de bloc dans Steel.
---

## Enregistrement

Pour enregistrer un bloc, ajoute l'attribut `block_behaviour`. Voici un exemple :

```rust
// steel-core/src/behavior/blocks/vegetation/cactus_block.rs
#[block_behavior]
pub struct CactusBlock {
    block: BlockRef,
}
```

:::caution
Le script de génération attend la propriété `block` pour un comportement de bloc. Pour un comportement d'item, ce n'est pas nécessaire !
:::

Pour enregistrer un item à la place, ajoute l'attribut `item_behaviour`, comme ceci :

```rust
// steel-core/src/behavior/items/shovel.rs
#[item_behavior]
pub struct ShovelItem;
```

Si le nom du bloc ou de l'item défini diffère de celui de `classes.json`, il faut préciser le nom du type de classe dans `block_behavior` et `item_behavior`. En reprenant l'exemple précédent, tu peux écrire :

```rust
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;
```

:::caution
Si tu définis plusieurs arguments `class`, seul le dernier sera pris en compte !
:::

## `json_arg` : les attributs de l'enregistrement

Tous les blocs et items ne s'implémentent pas de façon directe, certains ont besoin d'informations supplémentaires.

Prenons le bouton :

```rust
// steel-core/src/behavior/blocks/redstone/button_block.rs
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    ticks_to_stay_pressed: i32,
    sound_click_on: SoundEventRef,
    sound_click_off: SoundEventRef,
}

impl ButtonBlock {
    pub const fn new(
        block: BlockRef,
        ticks_to_stay_pressed: i32,
        sound_click_on: SoundEventRef,
        sound_click_off: SoundEventRef,
    ) -> Self {
        Self {
            block,
            ticks_to_stay_pressed,
            sound_click_on,
            sound_click_off,
        }
    }
}
```

Il y a maintenant trois propriétés de plus : `ticks_to_stay_pressed`, `sound_click_on`, `sound_click_off`.
Regardons toutes les informations dont nous disposons dans `classes.json` :

```json
// steel-core/build/classes.json
{
  "name": "oak_button",
  "class": "ButtonBlock",
  "type_name": "oak",
  "type_can_open_by_hand": true,
  "type_can_open_by_wind_charge": true,
  "type_can_button_be_activated_by_arrows": true,
  "type_pressure_plate_sensitivity": "everything",
  "type_door_close": "block.wooden_door.close",
  "type_door_open": "block.wooden_door.open",
  "type_trapdoor_close": "block.wooden_trapdoor.close",
  "type_trapdoor_open": "block.wooden_trapdoor.open",
  "type_pressure_plate_click_off": "block.wooden_pressure_plate.click_off",
  "type_pressure_plate_click_on": "block.wooden_pressure_plate.click_on",
  "type_button_click_off": "block.wooden_button.click_off",
  "type_button_click_on": "block.wooden_button.click_on",
  "ticks_to_stay_pressed": 30
}
```

:::caution
L'ordre de tous les types dans la fonction `new` doit être identique à l'ordre des propriétés !
:::

Il nous faut donc plusieurs types de `json_arg`, en commençant par le premier :

### `value`

Il s'écrit ainsi : `#[json_arg(value)]`.
Le nom de la propriété dans la structure est recherché dans le JSON, et la valeur trouvée est passée à la fonction `new`. Le type est lui aussi déduit correctement du type de donnée du JSON.

Voici le code de l'exemple ci-dessus :

```rust
// steel-core/src/behavior/blocks/redstone/button_block.rs
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value)]
    ticks_to_stay_pressed: i32,
    sound_click_on: SoundEventRef,
    sound_click_off: SoundEventRef,
}
```

Si le nom de la propriété ne correspond pas au nom de l'attribut JSON, l'argument `json` peut être utilisé.
Comme dans cet exemple :

```rust
// steel-core/src/behavior/blocks/redstone/button_block.rs
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value, json="ticks_to_stay_pressed")]
    ticks: i32,
    sound_click_on: SoundEventRef,
    sound_click_off: SoundEventRef,
}
```

### Valeur issue d'un registre

Comme on le voit dans l'exemple, les valeurs se trouvent dans le registre : il faut donc préciser dans quel registre les chercher.

```rust
// steel-core/src/behavior/blocks/redstone/button_block.rs
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value)]
    ticks_to_stay_pressed: i32,
    #[json_arg(sound_events, json = "type_button_click_on")]
    sound_click_on: SoundEventRef,
    #[json_arg(sound_events, json = "type_button_click_off")]
    sound_click_off: SoundEventRef,
}
```

Le registre n'a pas de nom comme `value` : tout autre argument sans nom est donc une entrée de registre !
Ce peut aussi être d'autres valeurs, voir la [section ref](#ref) pour cela.

### Énumérations

Avec les énumérations, cela se complique un peu. Voici un exemple avec CopperBlock :

```rust
// steel-core/src/behavior/blocks/building/weathering_block.rs
pub enum WeatherState {
    Unaffected = 0,
    Exposed = 1,
    Weathered = 2,
    Oxidized = 3,
}

#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    weathering: WeatheringCopper,
}

impl WeatheringCopperFullBlock {
    pub const fn new(block: BlockRef, weather_state: WeatherState) -> Self {
        Self {
            block,
            weathering: WeatheringCopper::new(weather_state),
        }
    }
}
```

Comme on le voit, la fonction `new` a un paramètre qui consomme une énumération, laquelle provient du fichier JSON.

```json
// steel-core/build/classes.json
{
  "name": "copper_block",
  "class": "WeatheringCopperFullBlock",
  "weather_state": "unaffected"
}
```

Pour passer l'énumération à la fonction `new` de CopperBlock, le code doit ressembler à ceci :

```rust
// steel-core/src/behavior/blocks/building/weathering_block.rs
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

Le nouvel argument `r#enum` a été ajouté : il définit le nom de l'énumération. Cela fonctionne ici parce que l'énumération se trouve dans le même fichier que `WeatheringCopperFullBlock` et qu'elle est publique. Sinon, il faudrait indiquer un module.

Voici l'exemple avec un module :

```rust
// steel-core/src/behavior/blocks/building/weathering_block.rs
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", module = "steel_core::behavior::blocks::building", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

L'argument `module` est le chemin vers l'énumération : il sera combiné au nom de l'énumération pour former la déclaration `use`.

### Valeurs optionnelles

Si une même classe a besoin de propriétés différentes selon les cas, un champ peut être rendu optionnel avec `optional = "sentinelle"`. Quand la valeur JSON est égale à la chaîne sentinelle, le champ devient `None`, sinon il est enveloppé dans `Some(...)`.

```rust
// steel-core/src/behavior/items/bucket.rs
#[item_behavior]
pub struct BucketItem {
    #[json_arg(vanilla_blocks, json = "content", optional = "empty")]
    fluid_block: Option<BlockRef>,
}
```

```json
// steel-core/build/classes.json
{ "name": "bucket",       "class": "BucketItem", "content": "empty" },
{ "name": "water_bucket", "class": "BucketItem", "content": "water" }
```

La valeur de `bucket` devient `None`, parce que `"empty"` correspond à la sentinelle. `water_bucket` obtient `Some(vanilla_blocks::WATER)`.

### `ref`

Ajouter `ref` à un argument de registre génère une référence (`&T`) vers l'entrée, au lieu d'une valeur possédée. C'est nécessaire quand le constructeur attend une référence.

```rust
// steel-core/src/behavior/blocks/fluid/liquid_block.rs
#[block_behavior]
pub struct LiquidBlock {
    block: BlockRef,
    #[json_arg(vanilla_fluids, ref)]
    fluid: FluidRef,
}

impl LiquidBlock {
    pub const fn new(block: BlockRef, fluid: FluidRef) -> Self {
        Self { block, fluid }
    }
}
```

```json
// steel-core/build/classes.json
{ "name": "water", "class": "LiquidBlock", "fluid": "water" },
{ "name": "lava",  "class": "LiquidBlock", "fluid": "lava"  }
```

Sans `ref`, le build script générerait `vanilla_fluids::WATER`. Avec `ref`, il génère `&vanilla_fluids::WATER`.
