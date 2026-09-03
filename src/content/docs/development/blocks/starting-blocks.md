---
title: Adding a New Block (Basic Setup)
description: A basic guide on adding a new block and modifying it's behavior
---

> Note that this is only a basic setup and **does not provide functionality yet**.

---

## 1. Select Which Block to Add

At first, select which block you want to add to the project.

**Example:** In this guide, we want to add **Iron Bars**.

---

## 2. Check the Class Name in `classes.json`

Before we can create our struct, we need to check how to name it properly.

Go to the file:

```
steel-core/build/classes.json
```

Search for your block in this file. In our example:
- We find `IronBarsBlock`

This means we need **one struct** to manage this block.

---

## 3. Create Your Block Class File

Now create your class in:

```
steel-core/src/behavior/blocks/
```

Be **as descriptive as possible** with the file name. For our example:
- `iron_bars_block.rs`

---

## 4. Add the Struct Definition

Add the struct like this to your file:

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
     /// Creates a new instance of IronBarsBlock
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehavior for IronBarsBlock {}
```

> Like mentioned above, we are only covering a basic setup, so this does not provide behavior or functionality.

---

## 5. Register the Block Module
To register the block, we need to give it the attribute block_behavior. Notice how at the top of the code the line <span style="background-color: #003f6f">#[block_behavior]</span> was added.
```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
#[block_behavior]
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
    /// Creates a new instance of IronBarsBlock
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehavior for IronBarsBlock {}
```

> More complex blocks than iron bars have properties. You can find more information [here](../../block_item_registration/).


---

## 6. Compile the Project

Now **compile your code** (instructons may be different between different IDEs) and let Rust (and our configuration) do some magic!

After compilation, your block should appear in:

```
steel-core/src/behavior/generated/blocks.rs
```

You can go there and use **Ctrl + F** to search for your block name.

### Troubleshooting

If your block is still missing:

1. Delete the `generated` folder
2. In your terminal, run:

   ```
   cargo clean
   ```
3. Compile again

This should solve the problem.

---

# Adding Behavior to the Block

Like already said, at this point the block **does nothing**.

To add behavior, you need to implement the necessary functions in `BlockBehavior` in your file (e.g. `iron_bars_block.rs`).

I would recommend looking at other block implementations to check which have similar block functionality as your block.

For that, here is some information to give you a better understanding:

---

## Working with Block States

### Getting a Block State

To get a block state, you can do something like this:

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

In this example, the position of the block west of our own has been saved inside `west_pos` and the state of the block at position `west_pos` has been saved inside `west_state`.

---

### Modifying Block State Properties

Block state properties can be changed like this:

```rust
state.set_value(&BlockStateProperties::WEST, true); 
```
This sets the `BoolProperty` saved in `state` to `true`, modifying the block state property.

---

## Checking Neighbor Blocks or Tags

To check if the neighbor or the block set is a specific block or block group (like iron bars), you can use this:

```rust
let neighbor_block = neighbor_state.get_block();
let excluded = is_excluded_for_connection(neighbor_block);
    (!excluded && world.is_face_sturdy(neighbor_state, neighbor_pos, direction.opposite()))
    || neighbor_block.has_tag(&BlockTag::BARS)
    || neighbor_block.has_tag(&BlockTag::WALLS)
    || neighbor_block.has_tag(&BlockTag::C_GLASS_PANES)
```

This checks the state of the block and stores it in `neighbor_block`. Next, it checks if the iron bars can connect to that block before saving that in `excluded`. Finally, it makes a list of blocks that are not full blocks but that can be connected to.
> Note that this only works for iron bars, and this needs to be evaluated and changed on a case-by-case basis if necessary. 
---

Now that all of that is finished, you are able to make a pull request (PR) and get it reviewed by maintainers on GitHub. Make sure to double-check your work to make sure it is satisfactory!

In addition, please ensure you stick to our coding and AI guidelines to ensure quality and comprehensible code!
___
## Other useful resources
- using properties for blocks and items, you can find information [here](../../block_item_registration)
