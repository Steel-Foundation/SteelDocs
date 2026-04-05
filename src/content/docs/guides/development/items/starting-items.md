---
title: Adding a New Item (Basic Setup)
description: Gives a basic guidance of how to add a new item without a behaviour and gives hints for behaviour
---

> ⚠️ This is only the very basic setup and **does not provide any functionality yet**.

---

## 1. Select Which Item to Add

At first, select which item you want to add to the project.

**Example:** In this guide, we want to add the `Shouvel` item.

---

## 2. Check the Class Name in `classes.json`

Before we can create our struct, we need to check how to name it properly.

Go to the file:

```
steel-core/build/classes.json
```

Search for strings similar to the name of the Item you want to implement in this file. In our example:
- We find `ShovelItem`

This means we need **two different structs** to manage both items.

---

## 3. Create Your Item Class File

Now create your class in:

```
steel-core/src/behavior/items/
```
TODO: If you read it please read in #termonology if there is something fixed
Be **as descriptive as possible** with the file name. For our example:
- `shovel.rs

---

## 4. Add the Struct Definition

Add the struct like this to your file:

```rust
// /steel-core/src/behavior/items/shovel.rs
pub struct ShovelBehavior;

impl ItemBehavior for ShovelBehavior {}
```

> ⚠️ This is only the basic setup and **doesn't give any functionality yet!**

---

## 5. Register the Item Module
To register the item, there needs to be the attribute `item_behavior added!

```rust
// /steel-core/src/behavior/items/shovel.rs
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;

impl ItemBehavior for ShovelBehavior {}
```

> ⚠️ More complex items than the shovel have properties, which are not covered here, you find [here](../block_item_registration) more information!


---

## 6. Compile the Project

Now press **compile** and let Rust (and our configuration) do some magic!

After compilation, your item should appear in:

```
steel-core/src/behavior/generated/items.rs
```

You can go there and use **Ctrl + F** to search for your item name.

### Troubleshooting

If your item is still missing:

1. Delete the `generated` folder
2. Run:

   ```
   cargo clean
   ```
3. Compile again

This should solve the problem.

---

# Adding Behavior to the Item

Like already said, at this point the item **does nothing**.

To add behavior, you need to implement the necessary methods in `ItemBehavior` in your file (e.g. `shovel.rs`).

👉 **I would recommend** looking at other item implementations to check which have similar item functionality as your item.

---

## Other useful resources
- using properties for blocks and items, you can find information [here](../block_item_registration)
