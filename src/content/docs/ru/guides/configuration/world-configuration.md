---
title: Конфигурация миров сервера
description: Полный справочник всех параметров конфигурации миров сервера в SteelMC
sidebar:
  order: 3
---

SteelMC настраивает [миры](../../getting-started/terminology#мир) через TOML-файл, расположенный по адресу `config/worlds.toml`. На этой странице описаны все параметры миров, [доменов](../../getting-started/terminology#домен), [генераторов миров](../../getting-started/terminology#генератор-мира) и хранилищ.

## Основные настройки

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `save_path` | String | `"saves"` | Корневая директория для сохранённых [миров](../../getting-started/terminology#мир) |
| `seed` | String | `""` | Сид генерации мира (пустая строка = случайный) |
| `default_gamemode` | String | `"survival"` | Режим игры по умолчанию для новых данных игрока |
| `difficulty` | String | `"normal"` | Сложность для новых данных уровня |
| `storage.type` | Identifier | `"steel:disk"` | Бэкенд хранилища мира по умолчанию |
| `player_storage.type` | Identifier | `"steel:file"` | Бэкенд хранения данных игрока |

Значения `seed`, `default_gamemode`, `difficulty` и `storage` наследуются от корневого уровня к [доменам](../../getting-started/terminology#домен) и от доменов к мирам. Их также можно переопределить на каждом уровне, что даёт гибкую конфигурацию.

Допустимые режимы игры: `survival`, `creative`, `adventure`, `spectator`.
Допустимые уровни сложности: `peaceful`, `easy`, `normal`, `hard`.

:::caution
Прочтите этот раздел, если терминология Steel незнакома.
:::
К сожалению, Mojang непоследовательна в использовании терминов в своей кодовой базе. `World`, `level` и `map` могут означать одно и то же. Steel также добавляет нативную функциональность, подобную [Multiverse](https://modrinth.com/plugin/multiverse-core). Чтобы описать это ясно, Steel вводит новый термин: домены.
Глоссарий также охватывает [измерение](../../getting-started/terminology#измерение) и [генератор мира](../../getting-started/terminology#генератор-мира), используемые ниже.

## Домены

Требуется как минимум один [домен](../../getting-started/terminology#домен), и ровно один домен должен быть основным.

```toml
[domains.minecraft]
default = true
seed = "example seed"
default_gamemode = "survival"
storage.type = "steel:disk"
```

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `domains.<domain>.worlds` | Array | Нет | **[ОБЯЗАТЕЛЬНО]** [Миры](../../getting-started/terminology#мир) внутри этого домена |
| `domains.<domain>.default` | bool | `false` | Является ли этот домен основным |
| `domains.<domain>.seed` | String | наследуется | Переопределение сида домена |
| `domains.<domain>.default_gamemode` | String | наследуется | Переопределение режима игры домена |
| `domains.<domain>.difficulty` | String | наследуется | Переопределение сложности домена |
| `domains.<domain>.storage` | Table | наследуется | Переопределение хранилища домена |

Имя домена должно быть допустимым пространством имён идентификатора. `global` зарезервировано и не может использоваться.

## Миры

Каждый [домен](../../getting-started/terminology#домен) должен содержать хотя бы один [мир](../../getting-started/terminology#мир) и ровно один основной мир.

```toml
[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true
storage.type = "steel:ram"
```

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `name` | String | Нет | **[ОБЯЗАТЕЛЬНО]** Имя мира внутри домена |
| `generator` | Identifier | Нет | **[ОБЯЗАТЕЛЬНО]** Используемый [генератор мира](../../getting-started/terminology#генератор-мира), настройки генератора в следующем разделе |
| `default` | bool | `false` | Является ли этот мир основным в домене |
| `seed` | String | наследуется | Переопределение сида мира |
| `default_gamemode` | String | наследуется | Переопределение режима игры мира |
| `difficulty` | String | наследуется | Переопределение сложности мира |
| `storage` | Table | наследуется | Переопределение хранилища мира |
| `config` | Table | `{}` | Конфигурация, специфичная для генератора |

Имена миров должны быть допустимыми путями идентификатора, не могут содержать `/` и должны быть уникальны в пределах домена. Имена `overworld`, `the_nether` и `the_end` - особые случаи, используемые для связи порталов (Нижний мир и Энд). Это позволяет создавать одиночный игровой процесс для каждого игрока со всеми тремя [измерениями](../../getting-started/terminology#измерение), как в ванильном одиночном режиме.

## Генераторы

Steel имеет следующие встроенные [генераторы миров](../../getting-started/terminology#генератор-мира):

| Генератор | Конфигурация |
|-----------|--------------|
| `minecraft:overworld` | Не принимает таблицу конфигурации |
| `minecraft:the_nether` | Не принимает таблицу конфигурации |
| `minecraft:the_end` | Не принимает таблицу конфигурации |
| `minecraft:flat` | Опциональная конфигурация плоского мира |
| `steel:empty` | Требует `config.dimension_type` |

### Генератор мира Minecraft

Генераторы `minecraft:overworld`, `minecraft:the_nether` и `minecraft:the_end` не имеют конфигурации. Они создают [миры](../../getting-started/terminology#мир) с паритетом ванилы для соответствующих [измерений](../../getting-started/terminology#измерение).

### Генератор плоского мира

Генератор `minecraft:flat` принимает необязательную таблицу `config`. Без неё используется измерение Overworld, ванильный сверхплоский набор слоёв и стандартные переопределения структур.

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `layers[].block` | Identifier | Нет | **[ОБЯЗАТЕЛЬНО]** Блок, используемый этим слоем |
| `layers[].height` | Integer | Нет | **[ОБЯЗАТЕЛЬНО]** Высота этого слоя, должна быть больше `0` |
| `dimension_type` | Identifier | `"minecraft:overworld"` | Тип измерения, используемый плоским [миром](../../getting-started/terminology#мир) |
| `layers` | Array of layer tables | bedrock 1, dirt 2, grass block 1 | Блоки, генерируемые снизу вверх |
| `features` | Boolean | `false` | Генерировать ли декоративные элементы. `true` ещё не реализовано |
| `lakes` | Boolean | `false` | Генерировать ли озёра. `true` ещё не реализовано |
| `structure_overrides` | Identifier array | strongholds и villages | Структуры, разрешённые в этом плоском мире |

Слои по умолчанию: `minecraft:bedrock` высотой `1`, `minecraft:dirt` высотой `2` и `minecraft:grass_block` высотой `1`.
Переопределения структур по умолчанию: `minecraft:strongholds` и `minecraft:villages`.

Пользовательские слои можно задавать с помощью повторяющихся таблиц слоёв или встроенных таблиц слоёв.

#### Повторяющиеся таблицы слоёв

```toml
[domains.dev]
default = true

[[domains.dev.worlds]]
name = "flat"
generator = "minecraft:flat"
default = true

[domains.dev.worlds.config]
features = false
lakes = false
structure_overrides = ["minecraft:villages"]

[[domains.dev.worlds.config.layers]]
block = "minecraft:bedrock"
height = 1

[[domains.dev.worlds.config.layers]]
block = "minecraft:grass_block"
height = 3
```

#### Встроенные таблицы слоёв

```toml
[domains.flat]
default = true

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:blackstone", height = 2 },
  { block = "minecraft:netherrack", height = 1 }
]

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
  { block = "minecraft:bedrock", height = 1 },
  { block = "minecraft:end_stone", height = 3 }
]
```

### Генератор пустого мира

Важная часть пустого [генератора мира](../../getting-started/terminology#генератор-мира) - конфигурация, которая определяет `dimension_type`. Это поле выбирает [измерение](../../getting-started/terminology#измерение) и его свойства, такие как высота Y и туман.

```toml
[domains.empty]
default = true
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "void"
generator = "steel:empty"
default = true

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## Хранилище

Steel имеет следующие встроенные бэкенды хранилищ [миров](../../getting-started/terminology#мир). Хранилище можно задать для всего сервера, для каждого [домена](../../getting-started/terminology#домен) и для каждого мира. Например, весь сервер может использовать хранилище в ОЗУ, один домен - дисковое хранилище с сохранением на диск, а мир внутри этого домена - снова ОЗУ. Это даёт максимальную гибкость.

:::caution
Хранилище в ОЗУ означает, что весь мир будет в памяти и никогда не сохранится. Память может быстро заполниться. Рекомендуется для мини-игр в сочетании с пустым [генератором мира](../../getting-started/terminology#генератор-мира).
:::

| Хранилище | Конфигурация |
|-----------|--------------|
| `steel:disk` | Опциональный `config.path`, относительно `save_path` |
| `steel:ram` | Без конфигурации, чанки не сохраняются |

Хранилище игроков в настоящее время поддерживает только `steel:file`.

Пример переопределения пути на диске:

```toml
[[domains.minecraft.worlds]]
name = "testing"
generator = "minecraft:overworld"

[domains.minecraft.worlds.storage]
type = "steel:disk"

[domains.minecraft.worlds.storage.config]
path = "custom/testing"
```

## Пример конфигурации

В этом разделе сначала показана конфигурация по умолчанию, генерируемая при первом запуске. Вторая конфигурация использует описанные выше концепции для построения системы с тремя [доменами](../../getting-started/terminology#домен), разными режимами игры, настройками хранилищ и конфигурацией [генераторов миров](../../getting-started/terminology#генератор-мира).

### Простая конфигурация

Это конфигурация по умолчанию для `worlds.toml`, создающая обычный [мир](../../getting-started/terminology#мир) выживания.

```toml
# /config/worlds.toml

# Корневые значения по умолчанию, наследуемые доменами и мирами, если не переопределены.
save_path = "saves"
seed = "my_awesome_seed"
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:file"

[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"
```

### Расширенная мультидоменная конфигурация

Здесь много разных настроек, объяснённых выше.
В данный момент [домен](../../getting-started/terminology#домен) `minecraft` использует дисковое хранилище, как и мир `the_nether` из домена `flat`. Домены `empty` и `minecraft` используют режим выживания, а домен `flat` - творческий режим.

```toml
save_path = "saves"
seed = ""
default_gamemode = "survival"
difficulty = "normal"

[storage]
type = "steel:disk"

[player_storage]
type = "steel:file"

[domains.minecraft]
default = true

[[domains.minecraft.worlds]]
name = "overworld"
generator = "minecraft:overworld"
default = true

[[domains.minecraft.worlds]]
name = "the_nether"
generator = "minecraft:the_nether"

[[domains.minecraft.worlds]]
name = "the_end"
generator = "minecraft:the_end"

[domains.flat]
default_gamemode = "creative"
storage.type = "steel:ram"

[[domains.flat.worlds]]
name = "overworld"
generator = "minecraft:flat"
default = true

[[domains.flat.worlds]]
name = "the_nether"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_nether"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:blackstone", height = 2 },
    { block = "minecraft:netherrack", height = 1 }
]
storage.type = "steel:disk"

[[domains.flat.worlds]]
name = "the_end"
generator = "minecraft:flat"
config.dimension_type = "minecraft:the_end"
config.layers = [
    { block = "minecraft:bedrock", height = 1 },
    { block = "minecraft:end_stone", height = 3 }
]

[domains.empty]
default = false
storage.type = "steel:ram"

[[domains.empty.worlds]]
name = "empty"
default = true
generator = "steel:empty"

[domains.empty.worlds.config]
dimension_type = "minecraft:overworld"
```

## Правила валидации

Сервер проверяет конфигурацию миров при запуске:

- неизвестные поля отклоняются
- должен быть объявлен хотя бы один [домен](../../getting-started/terminology#домен)
- ровно один домен должен иметь `default = true`
- каждый домен должен объявить хотя бы один [мир](../../getting-started/terminology#мир)
- в каждом домене должен быть ровно один основной мир
- имена доменов должны быть допустимыми пространствами имён идентификатора
- имя домена `global` зарезервировано
- имена миров должны быть допустимыми путями идентификатора и не могут содержать `/`
- `save_path` и пути хранилищ должны быть чистыми относительными путями
- [генераторы](../../getting-started/terminology#генератор-мира) и бэкенды хранилищ должны быть известны Steel

Если валидация не пройдена, сервер завершит работу с сообщением об ошибке.