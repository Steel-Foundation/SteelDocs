---
title: Menu Builder Tutorial
description: Implementing a custom crafting command with the menu builder and the grid builder.
---

This is a tutorial for using the menu builder and the grid builder to implement a custom crafting command. If you want more information beyond that, the doc comments for the types contained in the [prelude](https://rustdoc.steelmc.dev/steel_core/inventory/prelude/index.html) can definitely help you with that.

First of all when we create our command, we can import the prelude, it already contains all of the most important imports that you could need when working on menus.

```rust
use steel_core::inventory::prelude::*;
```

Then register your command using the already existing tutorial on commands. After doing that you create an executor
and get the player that you want to open the menu. You don't actually need an `Arc<Player>` since open_menu actually only takes `&self`.

---

You can open a menu by calling [`Player::open_menu`](https://rustdoc.steelmc.dev/steel_core/player/struct.Player.html#method.open_menu) and passing the function a title and a closure(or a function) that takes a [`MenuOpenContext`](https://rustdoc.steelmc.dev/steel_core/player/player_inventory/struct.MenuOpenContext.html) (giving you the container id, the player and the world) and returns a Menu.

```rust
player.open_menu("Crafting", |context| {
    custom_crafting(context.container_id, context.player) // returns a Menu
});
```

---

In the `custom_crafting` function you create the Menu by first creating a mutable [`MenuBuilder`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.MenuBuilder.html) and passing it the type of menu you want it to open and the container id you have been passed. All of the vanilla menu types you can choose from are contained in [`steel_registry::vanilla_menu_types`](https://rustdoc.steelmc.dev/steel_registry/vanilla_menu_types/index.html).

Then you create a struct that implements the [`MenuKind`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/trait.MenuKind.html) trait. This is what is going to bring life to your menu and implement the different behaviors the `Menu` should have. Lastly you call [`MenuBuilder::build`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.MenuBuilder.html#method.build) and give it your struct. `build` accepts any `impl MenuKind`.

There is also the [`DowncastType`](https://rustdoc.steelmc.dev/steel_utils/downcast/trait.DowncastType.html) trait that you have to implement here. This is so that when you get a `dyn MenuKind` you can downcast it back to your concrete own `CustomCraftingMenuKind`. Although it says `unsafe` here, you don't have to worry, as long as you choose the TYPE_KEY uniquely, that means that to your knowledge your key is not the same as any of the other keys in the steel crates, you will be fine.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    b.build(CustomCraftingMenuKind {})
}

struct CustomCraftingMenuKind {}

impl MenuKind for CustomCraftingMenuKind {}

/// SAFETY: This key is uniquely chosen
unsafe impl DowncastType for CustomCraftingMenuKind {
    const TYPE_KEY: steel_utils::DowncastTypeKey = DowncastTypeKey::new("steel:command/craft");
}
```

---

Then we can create a new grid builder and tell it that we are going to carve up the next 6 rows (all of the rows). The
grid function then lets you do your work on the [`GridPlacer`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.GridPlacer.html) inside of the closure you pass it.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    b.grid(6, |g| {
        g.paint_all(ItemStack::new(&vanilla_items::GRAY_STAINED_GLASS_PANE));
    });

    b.build(CustomCraftingMenuKind {})
}
```

The grid builder is for your convenience, because normally the MenuBuilder forces you to add slots in order that they appear in the menu. The grid builder can only be created on the start of a row and it allows you to then place [`Rect`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.Rect.html) (Rectangles) without having to do the manual math. When you place a rect in the grid, you however cannot overlap with another placement. For more rules on the grid placement, refer to the [module docs of the grid placer](https://rustdoc.steelmc.dev/steel_core/inventory/menu/grid/index.html).

The invariant of a menu is, that **every** index in the menu is handled by something that implements [`Slot`](https://rustdoc.steelmc.dev/steel_core/inventory/slots/slot/trait.Slot.html). The `MenuBuilder` enforces this invariant through an append only vec, because when you can only append, there can never be holes in the menu and we always know that the previous indices are already handled. Anything that would break the menu panics while you build it, instead of you having to discover a broken menu at runtime.

Calling [`b.grid(2, ...)`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.MenuBuilder.html#method.grid) tells the menu builder: "the next 2 rows (18 slots) are mine, and when my closure returns they will all be handled". The grid builder enforces this promise by panicking if any cell isn't "placed" or "painted" on. This is also why [`paint_all`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.GridPlacer.html#method.paint_all) exists: every painted cell that no placement claims is handled by becoming a display slot.

When we paint all of the menu with gray stained glass panes, every slot that is not handled by a container will then just become a display slot inside of an **anonymous** container that the builder creates for us when exiting the closure.

A grid always has to start on a multiple of 9 and assumes that the previous rows have been fully handled. It assumes that its 0th position is also the start of a row on the screen, because otherwise the placing of rectangles wouldn't work due to the offsets being wrong.

The grid placer can even extend into the player inventory slots (see [`MenuBuilder::override_player_slots`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.MenuBuilder.html#method.override_player_slots) if you want to paint over them). So you as the user are required to decide how many rows of the menu you actually want to handle in it.

---

Inside of the builder we can then create a new [`CraftingContainer`](https://rustdoc.steelmc.dev/steel_core/inventory/container/struct.CraftingContainer.html) and call [`into_shared`](https://rustdoc.steelmc.dev/steel_core/inventory/prelude/trait.IntoShared.html) on it, which just wraps the container in an `Arc<Mutex<>>`. We then use the place function to tell the grid placer that we want this container to be placed on a rectangle spanning from the 1st (2nd row remember zero indexing) to the third (so actually the fourth row, inclusive because of the **=** in the range). We pass it the crafting container we created and then call `.region()` to actually place it on the canvas. We save the created region for later because it will become relevant.

:::caution
If you don't call region your slots won't be placed. This is also why there is a must_use warning!
:::

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

There is a lot happening here so try to understand. We create a result container and then also a [`CraftingHandler`](https://rustdoc.steelmc.dev/steel_core/inventory/slots/struct.CraftingHandler.html). A crafting handler implements [`ResultHandler`](https://rustdoc.steelmc.dev/steel_core/inventory/slots/trait.ResultHandler.html) and deals with calculating the result item from the given input container. Then we place the result container on the canvas at the index `(6,2)` (a Rect::cell is just a short way to write a Rect of size one). Then we call `.result(handler)` on the [`PlacementBuilder`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/struct.PlacementBuilder.html) we just got from placing the result container. This tells the grid builder that we want this slot to be a [`ResultSlot`](https://rustdoc.steelmc.dev/steel_core/inventory/slots/struct.ResultSlot.html) which is a fake slot that you can only take items out of, but not place anything in them. The only way anything *should* get placed in a `ResultSlot` is as the result of a `ResultHandler` computing it.

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

Then we return the two regions we just created from our closure so we can use them outside of it to declare shift clicking routes. We also return the handler because our MenuKind is going to need it later. Since `.result()` consumes the handler we give it a clone (`.result(handler.clone())`) and return the original.

```rust
fn custom_crafting(container_id: u8, player: &Player) -> Menu {
    let mut b = MenuBuilder::new(&vanilla_menu_types::GENERIC_9X6, container_id);

    let (crafting, result, handler) = b.grid(6, |g| {
        // <folded for better overview>

        (crafting, result, handler)
    });

    let inventory = b.player_inventory(&player.inventory);

    b.build(CustomCraftingMenuKind { handler })
}
```

Then we also place the player inventory in the menu so that we can interact with it.

---

Now we can add the shift clicking routes simply by describing exactly what we want to happen. The [`FillDirection`](https://rustdoc.steelmc.dev/steel_core/inventory/menu/enum.FillDirection.html) enum dictates in which direction the container is traversed. Usually the "menu containers" fill the player inventory backwards while the player inventory fills the "menu containers" forwards (if you don't do it this way the client prediction will be wrong and for a split second the item will be in the wrong place on the client side. this is nothing bad and you can do it however you want).

And then we tell the Menu to drain the contents of the crafting region into the player inventory so that no items get deleted when we close the menu.

```rust
b.route(&crafting, [inventory.all()], FillDirection::Backward);
b.route(result, [inventory.all()], FillDirection::Backward);

b.drain(&crafting);
```

---

And then finally we store the handler we returned from the closure in our menu kind and tell it to recompute its result whenever the slots in the Menu change.

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

/// SAFETY: This key is uniquely chosen
unsafe impl DowncastType for CustomCraftingMenuKind {
    const TYPE_KEY: steel_utils::DowncastTypeKey = DowncastTypeKey::new("steel:command/craft");
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

    b.build(CustomCraftingMenuKind { handler })
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

/// SAFETY: This key is uniquely chosen
unsafe impl DowncastType for CustomCraftingMenuKind {
    const TYPE_KEY: steel_utils::DowncastTypeKey = DowncastTypeKey::new("steel:command/craft");
}
```

---

If you want to build a more advanced menu you can take a look at the `invsee` command, and the `domain` command if you want an example for a click menu with buttons. You can also take a look at the different slot types in [`steel_core::inventory::slots`](https://rustdoc.steelmc.dev/steel_core/inventory/slots/index.html) and read the other doc comments in the rustdoc
