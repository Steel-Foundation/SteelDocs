---
title: Регистрация блоков/предметов
description: Полное руководство по регистрации нового поведения блока или предмета в Steel.
---

## Регистрация

Чтобы зарегистрировать блок, добавьте атрибут `block_behaviour`. Для регистрации предмета добавьте атрибут `item_behaviour`, например:
```rust
#[block_behavior]
pub struct CactusBlock {
    block: BlockRef,
}
```

> ⚠️ Сборочный скрипт ожидает свойство `block` для поведения блока. Для поведения предмета это не требуется!

Если имя записанного блока или предмета отличается от имени в `classes.json`, необходимо указать тип класса в `block_behavior` или `item_behavior`, передав имя класса из `classes.json`.

Пример:
```rust
#[item_behavior(class = "ShovelItem")]
pub struct ShovelBehavior;
```

> ⚠️ Если определить несколько аргументов `class`, использован будет только последний!

## json_arg: Атрибуты для регистрации

Не все блоки и предметы просты в реализации, некоторым нужна дополнительная информация.

Например, кнопка:

```rust
#[block_behavior]
pub struct ButtonBlock {
    block: BlockRef,
    ticks_to_stay_pressed: i32,
    sound_click_on: i32,
    sound_click_off: i32,
}
```

Здесь три дополнительных свойства: `ticks_to_stay_pressed`, `sound_click_on`, `sound_click_off`.
Проверим информацию в `classes.json`:

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

> ⚠️ Порядок всех типов в функции `new` должен совпадать с порядком свойств!

Разберём нужные типы, начиная с первого:
### value

Выглядит так: `#[json_arg(value)]`
Имя свойства в структуре будет найдено в JSON, а значение подставлено в функцию `new`. Тип также будет корректно выбран из JSON.

Это код из примера выше:

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

Если имя свойства не совпадает с именем атрибута JSON, можно использовать аргумент `json`:
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

### Реестр (Registry)
Как видно из примера, значения находятся в реестре, поэтому нужно указать, в каком реестре их искать:

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

У реестра нет имени, как у `value`, так что любой другой безымянный аргумент считается записью реестра.
Они могут быть и другими значениями; подробнее в разделе `ref`.

### enum

Для перечислений всё немного сложнее. Пример с CopperBlock:

```rust
pub enum WeatherState {
    /// Свежая медь, без окисления.
    Unaffected = 0,
    /// Первая стадия окисления.
    Exposed = 1,
    /// Вторая стадия окисления.
    Weathered = 2,
    /// Полностью окислена, дальнейшее окисление не происходит.
    Oxidized = 3,
}

#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    weathering: WeatheringCopper,
}

impl WeatheringCopperFullBlock {
    /// Создаёт новое поведение `WeatheringCopperFullBlock`.
    #[must_use]
    pub const fn new(block: BlockRef, weather_state: WeatherState) -> Self {
        Self {
            block,
            weathering: WeatheringCopper::new(weather_state),
        }
    }
}
```

Как показано, функция `new` принимает перечисление, которое берётся из JSON.
```json
    {
      "name": "copper_block",
      "class": "WeatheringCopperFullBlock",
      "weather_state": "unaffected"
    },
```

Чтобы передать перечисление в `new` CopperBlock, код должен выглядеть так:
```rust
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

Новый аргумент `r#enum` задаёт имя перечисления. Это сработает, если перечисление находится в том же файле, что и `WeatheringCopperFullBlock`, и является публичным. Иначе потребуется модуль.

Пример с модулем:
```rust
#[block_behavior]
pub struct WeatheringCopperFullBlock {
    block: BlockRef,
    #[json_arg(r#enum = "WeatherState", module = "steel_core::behavior::blocks::building", json = "weather_state")]
    weathering: WeatheringCopper,
}
```

Аргумент `module` - это путь к перечислению, который будет объединён с именем перечисления для формирования `use`.

### optional

Если для одного и того же класса нужны разные свойства, поле можно сделать необязательным с помощью `optional = "sentinel"`. Когда значение JSON совпадает со строкой-стражем, поле становится `None`, иначе - `Some(...)`.

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

`bucket` станет `None`, потому что `"empty"` совпадает со стражем. `water_bucket` получит `Some(vanilla_blocks::WATER)`.

### ref

Добавление `ref` к аргументу реестра генерирует ссылку (`&T`) на запись вместо владеющего значения. Это нужно, когда конструктор ожидает ссылку.

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

Без `ref` сборочный скрипт сгенерировал бы `vanilla_fluids::WATER`. С `ref` генерируется `&vanilla_fluids::WATER`.