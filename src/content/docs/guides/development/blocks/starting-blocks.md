---
title: Adding a New Block (Basic Setup)
description: Gives a basic guidance of how to add a new block without a behaviour and gives hints for behaviour
---

> ⚠️ This is only the very basic setup and **does not provide any functionality yet**.

---

## 1. Select Which Block to Add

At first, select which block you want to add to the project.

**Example:** In this guide, we want to add **Iron Bars** and **Copper Bars**.

---

## 2. Check the Class Name in `classes.json`

Before we can create our struct, we need to check how to name it properly.

Go to the file:

```
steel-core/build/classes.json
```

Search for your block in this file. In our example:
- We find `IronBarsBlock`
- We find `WeatheringCopperBarsBlock`

This means we need **two different structs** to manage both blocks.

---

## 3. Create Your Block Class File

Now create your class in:

```
steel-core/src/behavior/blocks/
```

Be **as descriptive as possible** with the file name. For our example:
- `iron_bars_block.rs`
- `copper_bars_block.rs`

---

## 4. Add the Struct Definition

Add the struct like this to your file:

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

> ⚠️ This is only the basic setup and **doesn't give any functionality yet!**

---

## 5. Register the Block Module
To register the block, there needs to be the attribute block_behavior added!
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

> ⚠️ More complex senarious then the block also has properties, you find [here](../block_item_registration) more information!


---

## 6. Compile the Project

Now press **compile** and let Rust (and our configuration) do some magic!

After compilation, your block should appear in:

```
steel-core/src/behavior/generated/blocks.rs
```

You can go there and use **Ctrl + F** to search for your block name.

### Troubleshooting

If your block is still missing:

1. Delete the `generated` folder
2. Run:

   ```
   cargo clean
   ```
3. Compile again

This should solve the problem.

---

# Adding Behavior to the Block

Like already said, at this point the block **does nothing**.

To add behavior, you need to implement the necessary methods in `BlockBehaviour` in your file (e.g. `iron_bars_block.rs`).

👉 **I would recommend** looking at other block implementations to check which have similar block functionality as your block.

For that, here is some information to give you a better understanding:

---

## Working with Block States

### Getting a Block State

To get a block state, you can do something like this:

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

In this block state, **all information** of this specific block is saved.

---

### Modifying Block State Properties

This can be changed like this:

```rust
state.set_value(&BlockStateProperties::WEST, true);
```

Getting a value is vice versa.

---

## Checking Neighbor Blocks or Tags

To check if the neighbor or the block set is a specific block or block group (like bars or walls), you can use this:

```rust
let walls_tag = Identifier::vanilla_static("walls");
if REGISTRY.blocks.is_in_tag(neighbor_block, &walls_tag) {
    return true;
}
```

---

That's it — you now have the **basic structure** in place and can start implementing real behavior 🚀

## Other useful resources
Currently no available
