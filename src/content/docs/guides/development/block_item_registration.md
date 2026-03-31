---
title: Block/Item registration
description: Gives a full guidance of how to register a new item or block behavior to steel.
---

## Registration

To register a block you need to add to that struct the attribute `block_behavior` and for items `item_behavior`.
like this:
```rust
#[block_behavior]
pub struct CactusBlock {
    block: BlockRef,
}
```

> ⚠️ The generation script expects the block property for the block behavior. For item behavior this is not needed!

If the written block or item name is different then in `classes.json` then the class type needs to be used in `block_behavior` and `item_behavior`. where you add the class name from `classes.json`.

As an example here:
```rust
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;
```

> ⚠️ If you define multiple class arguments, then only the last one will be used!

## json_arg: Attributes for the registration

Not all blocks and items are simple to implement, so some of them need information.

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

there are now three more properties: `ticks_to_stay_pressed`, `sound_click_on`, `sound_click_off`
Now check all information which we have in `classes.json`

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

> ⚠️ All types order needs to be the same in the new function as the order in the properties!

so we need different types now, so starting with the first one
### value

it looks like this: `#[json_arg(value)]`
so the name of the property in the struct will be searched in the json and then the found value will be added in the new function! The type will be also correct selected from the data type of the json.

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

For the case the property name is not equal the name of the json attribute the json argument can be used.
Displayed in this example:
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
From the example the values are in the registry so it needs to be defined in which registry it will be found:

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

The registry has no name like value, so every other arguement without a name is registry entry execpt for value!
This can be also other values, more to that in the ref part.


### enum

for enums it get's a bit more complicated so here an example code with CopperBlock

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

As shown the new has the parameter which consumes an enum, which comes from the json file.
```json
    {
      "name": "copper_block",
      "class": "WeatheringCopperFullBlock",
      "weather_state": "unaffected"
    },
```

To pass now the enum in the new function of the CopperBlock the code needs to look like this:
```rust
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

the new argument `r#enum` was added which defines the enum name. This will work in that case because the enum is in the same file then WeatheringCopperFullBlock and is public. Otherwise a module would be needed.

Here is the example with a module:
```rust
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", module = "steel_core::behavior::blocks::building", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

The module argument, is the path to the enum, so it will be combined with the enum name to form the `use` definition.

### optinal

If for the same class different properties are needed.

### ref