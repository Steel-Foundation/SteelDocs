---
title: How to create menu
description: Guide for how to create a menu
---

# Menu Builder Tutorial

This is the tutorial for using the menu builder and the grid builder to implement a custom crafting command.

First of all when we create our command, we can import

```rust
use steel_core::inventory::prelude::*;
```

... this already has all of the most important imports that you could need when working on menus.

Then register your command using the already existing tutorial on commands. After doing that you create an executor
and get the player that you want to open the menu. You don't actually need an `Arc<Player>` since open_menu actually only takes `&self`.

---

You can open a menu by calling `Player::open_menu` and passing the function a title and a closure(or a function) that takes the container id and the world and returns a Menu.

```rust
player.open_menu("Crafting", |container_id, world| {
    custom_crafting(container_id, player) // returns a Menu
});
```

---

In the `custom_crafting` function you create the Menu by first creating a mutable `MenuBuilder` and passing it the type of menu you want it to open and the container id you have been passed. All of the vanilla menu types you can choose from are contained in `steel_registry::vanilla_menu_types`.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    b.build(MenuKindType::custom(CustomCraftingMenuKind {}))
}

struct CustomCraftingMenuKind {}

impl MenuKind for CustomCraftingMenuKind {}
```

Then you create a struct that implements the `MenuKind` trait. This is what is going to bring life to your menu and implement the different behaviors the `Menu` should have. Lastly you call `MenuBuilder::build` and give it a `MenuKindType::custom(<your struct>)`. This is needed because MenuKindType allows you to add your own custom MenuKinds alongside the already implemented vanilla ones.

---

Then we can create a new grid builder and tell it that we are going to carve up the next 6 rows (all of the rows). The
grid function then lets you do your work on the `GridPlacer` inside of the closure you pass it.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    b.grid(6, |g| {
        g.paint_all(ItemStack::new(&vanilla_items::GRAY_STAINED_GLASS_PANE));
    });

    b.build(MenuKindType::custom(CustomCraftingMenuKind {}))
}
```

We paint all all of the menu with gray stained glass panes, because this way every slot that is not handled by a container will then just become a display slot inside of an anonymous container that the builder handily creates for you upon carving.

---

Inside of the builder we can then create a new `CraftingContainer` and call `into_shared` on it, which just wraps the container in an `Arc<Mutex<>>`. We then use the place function to tell the grid placer that we want this container to be placed on a rectangle spanning from the 1st (2nd row remember zero indexing) to the third row (inclusive because of the = in the range). We pass it the crafting container we created and then call `.region()` to actually place it on the canvas. We save the created region for later because it will be come relevant.

> IMPORTANT: if you don't call region your slots won't be placed. This is also why there is a must_use warning!

```rust
b.grid(6, |g| {
    g.paint_all(ItemStack::new(&vanilla_items::GRAY_STAINED_GLASS_PANE));

    let crafting_container = CraftingContainer::new(3, 3).into_shared();

    let crafting = g
        .place(Rect::cols(1..=3).rows(1..=3), crafting_container.clone())
        .region();
});
```

---

There is a lot happening here so try to understand. We create a result container and then also a `CraftingHandler`. A crafting handler implements `RecipeHandler` and deals with calculating the result item from the given input container. Then we place the result container on the canvas at the index `(6,2)` (a Rect::cell is just a short way to write a Rect of size one). Then we call `.result(handler)` on the `PlacementBuilder` we just got from placing the result container. This tells the grid builder that we want this slot to be a `ResultSlot` which is a fake slot that you can only take items out of, but not place anything in them. The only way anything *should* gets placed in a `ResultSlot` is as the result of a `RecipeHandler` computing it.

```rust
b.grid(6, |g| {
    g.paint_all(ItemStack::new(&vanilla_items::GRAY_STAINED_GLASS_PANE));

    let crafting_container = CraftingContainer::new(3, 3).into_shared();

    let crafting = g
        .place(Rect::cols(1..=3).rows(1..=3), crafting_container.clone())
        .region();

    let result_container = ResultContainer::new().into_shared();

    let handler = CraftingHandler::new(crafting_container, result_container.clone(), 3);

    let result = g
        .place(Rect::cell(6, 2), result_container.clone())
        .result(handler);
});
```

---

Then we return the two regions we just created from our closure so we can use them outside of it to declare shift clicking routes.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);
    
    let (crafting, result) = b.grid(6, |g| {
        // <folded for better overview>
    
        (crafting, result)
    });

    let inventory = b.player_inventory(&player.inventory);
    
    b.build(MenuKindType::custom(CustomCraftingMenuKind {}))
}
```

Then we also place the player inventory in the menu so that we can interact with it.

---

Now we can add the shift clicking routes simply by describing exactly what we want to happen. The `FillDirection` enum dictates in which direction the container is traversed. Usually the "menu containers" fill the player inventory backwards while the player inventory fills the "menu containers" forwards (if you dont do it this way the client prediction will be wrong and for a split second the item will be in the wrong place on the client side. this is nothing bad and you can do it however you want).

And then we tell the Menu to drain the contents of the crafting region into the player inventory so that no items get deleted when we close the menu.

```rust
b.route(&crafting, [inventory.all()], FillDirection::Backward);
b.route(result, [inventory.all()], FillDirection::Backward);

b.drain(&crafting);
```

---

And then finally we can just tell the handler to recompute it's result whenever the slots in the Menu change.

```rust
struct CustomCraftingMenuKind {
    handler: CraftingHandler,
}

impl MenuKind for CustomCraftingMenuKind {
    fn slots_changed(
        &mut self,
        _behavior: &mut MenuBehavior,
        guard: &mut ContainerLockGuard,
        _player: &Player,
    ) {
        self.handler.update_result(guard);
    }
}
```

---

So putting it all together we have:

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    let (crafting, result, handler) = b.grid(6, |g| {
        g.paint_all(ItemStack::new(&vanilla_items::GRAY_STAINED_GLASS_PANE));

        let crafting_container = CraftingContainer::new(3, 3).into_shared();

        let crafting = g
            .place(Rect::cols(1..=3).rows(1..=3), crafting_container.clone())
            .region();

        let result_container = ResultContainer::new().into_shared();

        let handler = CraftingHandler::new(crafting_container, result_container.clone(), 3);

        let result = g
            .place(Rect::cell(6, 2), result_container.clone())
            .result(handler.clone());

        (crafting, result, handler)
    });

    let inventory = b.player_inventory(&player.inventory);

    b.route(&crafting, [inventory.all()], FillDirection::Backward);
    b.route(result, [inventory.all()], FillDirection::Backward);

    b.drain(&crafting);

    b.build(MenuKindType::custom(CustomCraftingMenuKind { handler }))
}

struct CustomCraftingMenuKind {
    handler: CraftingHandler,
}

impl MenuKind for CustomCraftingMenuKind {
    fn slots_changed(
        &mut self,
        _behavior: &mut MenuBehavior,
        guard: &mut ContainerLockGuard,
        _player: &Player,
    ) {
        self.handler.update_result(guard);
    }
}
```

---

For if you want to build a more advanced menu you can take a look at the `invsee` command and the `domain` command if you want an example for a click menu with buttons. You can also take a look at the different slot types in `steel_core:: inventory::slots`.