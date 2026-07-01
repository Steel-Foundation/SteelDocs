---
title: Block/Item registration
description: A full guide on how to register a new item or block behavior in Steel.
---

## Registration

To register a block, add the attribute `block_behaviour`. Here is an example:

```rust
// steel-core/src/behavior/blocks/vegetation/cactus_block.rs
#[block_behavior]
pub struct CactusBlock {
    block: BlockRef,
}
```

:::caution
The generation script expects the block property for the block behavior. For item behavior this is not needed!
:::

In order to register an item instead, add the attribute `item_behaviour`, like this:

```rust
// steel-core/src/behavior/items/shovel.rs
#[item_behavior]
pub struct ShovelItem;
```

If the defined block or item name is different than in `classes.json`, the class type name needs to be specified in `block_behavior` and `item_behavior`. Following the last example you could do this:

```rust
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;
```

:::caution
If you define multiple class arguments, then only the last one will be used!
:::

## `json_arg`: Attributes for the registration

Not all blocks and items are straightforward to implement, some of them need extra information.

For example the button:

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

There are now three more properties: `ticks_to_stay_pressed`, `sound_click_on`, `sound_click_off`.
Now check all the information we have in `classes.json`:

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
The order of all types in the new function needs to be the same as the order of the properties!
:::

So we need different types of `json_arg` now, starting with the first one:

### `value`

It looks like this: `#[json_arg(value)]`
So the name of the property in the struct will be searched in the JSON and the found value will be added in the new function. The type will also be correctly selected from the data type of the JSON.

This is the code from the example above:

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

If the property name it's not equal as the name of the JSON attribute, the `json` argument can be used here.
As shown in this example:

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

### Value of a registry

As seen in the example, the values are in the registry, so it needs to be defined in which registry they will be found:

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

The registry has no name like value, so every other argument without a name is a registry entry!
These can also be other values; more on that in the [ref section](#ref).

### Enums

For enums it gets a bit more complicated, so here is an example with CopperBlock:

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

As shown, the `new` function has a parameter that consumes an enum, which comes from the JSON file.

```json
// steel-core/build/classes.json
{
  "name": "copper_block",
  "class": "WeatheringCopperFullBlock",
  "weather_state": "unaffected"
}
```

Now pass the enum into the `new` function of CopperBlock, the code needs to look like this:

```rust
// steel-core/src/behavior/blocks/building/weathering_block.rs
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

The new argument `r#enum` was added, which defines the enum name. This will work in that case because the enum is in the same file as `WeatheringCopperFullBlock` and is public. Otherwise a module would be needed.

Here is the example with a module:

```rust
// steel-core/src/behavior/blocks/building/weathering_block.rs
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", module = "steel_core::behavior::blocks::building", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

The `module` argument is the path to the enum, so it will be combined with the enum name to form the `use` definition.

### Optionals

If for the same class different properties are needed, a field can be made optional with `optional = "sentinel"`. When the JSON value equals the sentinel string the field becomes `None`, otherwise it is wrapped in `Some(...)`.

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

The value in `bucket` becomes `None` because `"empty"` matches the sentinel. `water_bucket` gets `Some(vanilla_blocks::WATER)`.

### `ref`

Adding `ref` to a registry argument generates a reference (`&T`) to the entry instead of an owned value. This is needed when the constructor expects a reference.

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

Without `ref`, the build script would generate `vanilla_fluids::WATER`. With `ref` it generates `&vanilla_fluids::WATER`.
