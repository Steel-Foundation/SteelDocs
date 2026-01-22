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

Add your block module to:

```
steel-core/src/behavior/blocks/mod.rs
```

It should look like this:

```rust
// /steel-core/src/behavior/blocks/mod.rs
mod iron_bars_block;
pub use iron_bars_block::IronBarsBlock;
```

---

## 6. Verify the Struct Name

Now it would be **a good time to check** if your struct name is really correct!

Double-check that your **struct name** matches what you found in `classes.json`.

---

## 7. Add the Struct to the Generated Blocks

Now we need to add the struct to the generated block list.
This happens in:

```
steel-core/build/blocks.rs
```

If you want to understand what is happening internally, the function
`generate_registrations` can be interesting — but **it is not required** to get your block working.

---

## 8. Focus on the Build Function

We will now focus on the `build` function in the opened file.

⚠️ **Important:**
Only **add** new code.
Do **not remove or modify existing code**, as this could break blocks from other contributors.

---

## 9. Create a Mutable Vector

First, create a mutable vector with a descriptive name:

```rust
// /steel-core/build/blocks.rs
let mut iron_bar_blocks = Vec::new();
```

---

## 10. Extend the Match Statement

Add your block struct name to the `match` statement.
Again: **only add your line**, do not remove others.

```rust
// /steel-core/build/blocks.rs
for block in blocks {
    let const_ident = to_const_ident(&block.name);
    match block.class.as_str() {
        ...
        "IronBarsBlock" => iron_bar_blocks.push(const_ident),
        _ => {}
    }
}
```

---

## 11. Define the Block Type

Now define the block type identifier:

```rust
// /steel-core/build/blocks.rs
let iron_bar_type = Ident::new("IronBarsBlock", Span::call_site());
```

---

## 12. Generate Registrations

Next, generate the registrations:

```rust
// /steel-core/build/blocks.rs
let iron_bar_registrations =
    generate_registrations(iron_bar_blocks.iter(), &iron_bar_type);
```

---

## 13. Add the Registrations to the Output

⚠️ **Be very careful here!**

* The `#` before the registration name is **required**
* It prevents name collisions with Rust keywords
* Do **not** add a trailing comma — this code is generated into another file

Example:

```rust
// /steel-core/build/blocks.rs
let output = quote! {
    //! Generated block behavior assignments.

    use steel_registry::vanilla_blocks;
    use crate::behavior::BlockBehaviorRegistry;
    use crate::behavior::blocks::{
        CraftingTableBlock,
        CropBlock,
        EndPortalFrameBlock,
        FarmlandBlock,
        FenceBlock,
        RotatedPillarBlock,
        BarBlock
    };

    pub fn register_block_behaviors(registry: &mut BlockBehaviorRegistry) {
        ...
        #iron_bar_registrations
    }
};
```

---

## 14. Compile the Project

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
