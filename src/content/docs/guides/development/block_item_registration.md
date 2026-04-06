---
title: Block/Item registration
description: A full guide on how to register a new item or block behavior in Steel.
---

## Registration

To register a block, add the attribute `block_behaviour`. In order to register an item instead, add the attribute `item_behaviour`, like this:
```rust
#[block_behavior]
pub struct CactusBlock {
    block: BlockRef,
}
```

> ⚠️ The generation script expects the block property for the block behavior. For item behavior this is not needed!

If the written block or item name is different than in `classes.json`, the class type needs to be used in `block_behavior` and `item_behavior`, where you add the class name from `classes.json`.

Here is an example:
```rust
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;
```

> ⚠️ If you define multiple class arguments, then only the last one will be used!

## json_arg: Attributes for the registration

Not all blocks and items are straightforward to implement, so some of them need information.

For example the button:

```rust
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    ticks_to_stay_pressed: i32,
    sound_click_on: i32,
    sound_click_off: i32,
}
```

There are now three more properties: `ticks_to_stay_pressed`, `sound_click_on`, `sound_click_off`.
Now check all the information we have in `classes.json`:

```json
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

> ⚠️ The order of all types in the new function needs to be the same as the order of the properties!

So we need different types now, starting with the first one:
### value

It looks like this: `#[json_arg(value)]`
So the name of the property in the struct will be searched in the JSON and the found value will be added in the new function. The type will also be correctly selected from the data type of the JSON.

This is the code from the example above:

```rust
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value)]
    ticks_to_stay_pressed: i32,
    sound_click_on: i32,
    sound_click_off: i32,
}
```

If the property name does not equal the name of the JSON attribute, the `json` argument can be used here.
As shown in this example:
```rust
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value, json="ticks_to_stay_pressed")]
    ticks: i32,
    sound_click_on: i32,
    sound_click_off: i32,
}
```

### Registry
As seen in the example, the values are in the registry, so it needs to be defined in which registry they will be found:

```rust
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    #[json_arg(value, json="ticks_to_stay_pressed")]
    ticks: i32,
    #[json_arg(sound_events, json = "type_button_click_on")]
    sound_click_on: i32,
    #[json_arg(sound_events, json = "type_button_click_off")]
    sound_click_off: i32,
}
```

The registry has no name like value, so every other argument without a name is a registry entry!
These can also be other values; more on that in the ref section.


### enum

For enums it gets a bit more complicated, so here is an example with CopperBlock:

```rust
pub enum WeatherState {
    /// Fresh copper, no oxidation.
    Unaffected = 0,
    /// First stage of oxidation.
    Exposed = 1,
    /// Second stage of oxidation.
    Weathered = 2,
    /// Fully oxidized, will not advance further.
    Oxidized = 3,
}

#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    weathering: WeatheringCopper,
}

impl WeatheringCopperFullBlock {
    /// Creates a new `WeatheringCopperFullBlock` behavior.
    #[must_use]
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
    {
      "name": "copper_block",
      "class": "WeatheringCopperFullBlock",
      "weather_state": "unaffected"
    },
```

To now pass the enum into the `new` function of CopperBlock, the code needs to look like this:
```rust
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
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", module = "steel_core::behavior::blocks::building", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

The module argument is the path to the enum, so it will be combined with the enum name to form the `use` definition.

### optional

If for the same class different properties are needed, a field can be made optional with `optional = "sentinel"`. When the JSON value equals the sentinel string the field becomes `None`, otherwise it is wrapped in `Some(...)`.

```rust
#[item_behavior]
pub struct BucketItem {
    #[json_arg(vanilla_blocks, json = "content", optional = "empty")]
    fluid_block: Option<BlockRef>,
}
```

```json
{ "name": "bucket",       "class": "BucketItem", "content": "empty" },
{ "name": "water_bucket", "class": "BucketItem", "content": "water" }
```

`bucket` becomes `None` because `"empty"` matches the sentinel. `water_bucket` gets `Some(vanilla_blocks::WATER)`.

### ref

Adding `ref` to a registry argument generates a reference (`&T`) to the entry instead of an owned value. This is needed when the constructor expects a reference.

```rust
#[block_behavior]
pub struct LiquidBlock {
    block: BlockRef,
    #[json_arg(vanilla_fluids, ref)]
    fluid: FluidRef,
}
```

```json
{ "name": "water", "class": "LiquidBlock", "fluid": "water" },
{ "name": "lava",  "class": "LiquidBlock", "fluid": "lava"  }
```

Without `ref`, the build script would generate `vanilla_fluids::WATER`. With `ref` it generates `&vanilla_fluids::WATER`.