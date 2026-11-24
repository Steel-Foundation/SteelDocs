---
title: Как работают реестры
description: Глубокое погружение в изучение использования и написания реестра
sidebar:
  order: 5
---

## Что такое реестр?

Реестр - это источник истины Steel для категории именованных игровых данных: блоков, предметов, типов сущностей, биомов, типов чата, узоров знамён, жидкостей и многих других ванильных систем. Он хранит определения этих записей, а не их экземпляры во время выполнения. Например, реестр блоков хранит определение блока камня, но не каждый размещённый в чанке каменный блок.

Реестры важны, потому что протоколы Minecraft и игровая логика требуют стабильных идентификаторов, имён и общих определений. Steel использует реестры для сопоставления `Identifier`, такого как `minecraft:stone`, с числовым ID, предоставления типизированных ссылок Rust, группировки записей с помощью тегов и синхронизации реестров, которые нужны ванильному клиенту при входе. Большинство ванильных записей генерируется из извлечённых JSON или данных датапаков, а не пишется вручную.

В этом руководстве последовательно используются следующие термины:

- **Запись реестра**: одно определение, хранящееся в реестре, например, блок, предмет, тип сущности, биом или узор знамени.
- **Ссылочный тип записи**: специфичный для реестра псевдоним типа для статической ссылки на запись, например `BannerPatternRef = &'static BannerPattern`.
- **Идентификатор**: стабильный ключ с пространством имён для записи, например `minecraft:stone`.
- **Числовой ID**: `usize`, назначаемый при регистрации записи. Реестры используют его для быстрого поиска и данных протокола.
- **Тег**: именованная группа идентификаторов записей, например `minecraft:fence_gates`.

## Как работают реестры?

На высоком уровне поток данных проходит следующие этапы:

```
build_assets/*.json
        │   (сборочный скрипт)
        ▼
src/generated/*.rs   ── статические записи + функция register
        │   (запуск сервера)
        ▼
Registry::new_vanilla()       ── наполняет каждый реестр
        │
        ▼
registry.freeze()             ── дальнейшие изменения запрещены
        │
        ▼
REGISTRY.init(registry)       ── предоставляет глобальный замороженный реестр
        │
        ▼
RegistryCache::new()          ── создаёт пакеты реестров и тегов
        │
        ▼
Отправка кэшированных пакетов ── во время фазы конфигурации входа
```

Все реестры находятся в пакете `steel-registry`, который содержит код для генерации, инициализации, доступа и заморозки данных реестров.

Можно выделить три полезные категории:

- **Простые реестры** сопоставляют ключ записи с числовым ID и обратно.
- **Тегированные реестры** делают то же самое, но также группируют записи под идентификаторами тегов, такими как `minecraft:fence_gates`.
- **Сложные реестры** имеют дополнительное поведение, специфичное для предметной области. Блоки и предметы - основные примеры, поскольку их записи связаны с состояниями, компонентами, поведением и другими системами.

Это руководство посвящено простым и тегированным реестрам. После его прочтения у вас должно быть достаточно контекста, чтобы разобраться в более сложных реестрах. Конкретный пример для блоков и предметов см. в [Регистрация блоков/предметов](./block_item_registration).

## Структура папок

Краткий обзор важных путей в пакете `steel-registry`. Они перечислены в порядке сборочного потока: исходные данные, сборочные скрипты, написанный вручную исходный код, затем сгенерированный исходный код.

### build_assets

Эта папка содержит только JSON и NBT данные, извлечённые экстрактором или из jar-файла Minecraft.
Папка `builtin_datapacks` содержит данные из jar-файла Minecraft, что необходимо только при обновлении версии Minecraft - руководство можно найти [здесь](../upgrade-minecraft).
Все JSON-файлы в этом каталоге извлечены из ванилы с помощью [SteelExtractor](../tools/steel_extractor).

### build

Этот каталог содержит сборочные файлы, которые преобразуют JSON-файлы в код Rust для загрузки реестров.
Большинство реестров имеют собственный сборочный файл - например, реестр вариантов кур имеет сборочный файл `chicken_variants`.
Поскольку это руководство сосредоточено только на том, как работают реестры, сборочные скрипты здесь не рассматриваются.

### src

Здесь хранятся все реестры, и это основная тема руководства.

### src/generated

Содержит все файлы Rust, сгенерированные сборочными скриптами; их не следует редактировать вручную.

## Рабочий процесс

Краткий контрольный список того, как данные реестра проходят через Steel:

1. Сборочный скрипт проверяет, изменились ли JSON или исходные файлы датапаков.
2. Сборочный скрипт перегенерирует файлы Rust в `steel-registry/src/generated`.
3. `Registry::new_vanilla` создаёт пустые реестры и регистрирует все сгенерированные данные Steel.
4. Регистрация плагинов и модов будет происходить до заморозки, когда эта система будет готова.
5. `Registry::freeze` блокирует реестры, чтобы никакой последующий код не мог изменить идентификаторы или теги.
6. Процесс входа синхронизирует реестры и теги, которые нужны клиенту Minecraft.

### Определение записи реестра

Файл реестра объявляет тип записи, который содержит реестр, а также публичный ссылочный тип для этого реестра. Реальный пример из `steel-registry/src/banner_pattern.rs`:

```rust
pub struct BannerPattern {
    pub key: Identifier,
    pub asset_id: Identifier,
    pub translation_key: &'static str,
}

pub type BannerPatternRef = &'static BannerPattern;
```

Ссылочный тип записи (`BannerPatternRef`) - это то, что код передаёт, когда нужно сослаться на запись узора знамени. Это также указывает на способ хранения данных: каждая запись реестра указывает на статические данные. В Steel большинство ванильных статических данных находится в `steel-registry/src/generated`.

Сгенерированный файл `steel-registry/src/generated/vanilla_banner_patterns.rs` содержит такие записи:

```rust
pub static RHOMBUS: BannerPattern = BannerPattern {
    key: Identifier::vanilla_static("rhombus"),
    asset_id: Identifier {
        namespace: Cow::Borrowed("minecraft"),
        path: Cow::Borrowed("rhombus"),
    },
    translation_key: "block.minecraft.banner.rhombus",
};
```

Сгенерированная функция регистрации затем вставляет ссылки на записи в реестр:

```rust
pub fn register_banner_patterns(registry: &mut BannerPatternRegistry) {
    registry.register(&RHOMBUS);
}
```

Это означает, что записи реестра являются глобально уникальными статическими значениями. Если две ссылки указывают на одну и ту же запись реестра, они указывают на одну и ту же статическую память. Сравнение указателей для ссылок реестра возможно, но обычный код всё равно должен предпочитать явные реализации равенства, чтобы `==` имел ожидаемую семантику.

### Создание реестра

Каждый реестр хранит записи по числовому ID и по идентификатору. Тегированные реестры также хранят членство в тегах. Реальный реестр узоров знамён выглядит так в `steel-registry/src/banner_pattern.rs`:

```rust
pub struct BannerPatternRegistry {
    banner_patterns_by_id: Vec<BannerPatternRef>,
    banner_patterns_by_key: FxHashMap<Identifier, usize>,
    tags: FxHashMap<Identifier, Vec<Identifier>>,
    allows_registering: bool,
}
```

Макросы в конце того же файла связывают это хранилище с общими трейтами реестра:

```rust
crate::impl_standard_methods!(
    BannerPatternRegistry,
    BannerPatternRef,
    banner_patterns_by_id,
    banner_patterns_by_key,
    allows_registering
);

crate::impl_registry!(
    BannerPatternRegistry,
    BannerPattern,
    banner_patterns_by_id,
    banner_patterns_by_key,
    banner_patterns
);

crate::impl_tagged_registry!(
    BannerPatternRegistry,
    banner_patterns_by_key,
    "banner pattern"
);
```

В `steel-registry/src/lib.rs` структура `Registry` содержит все реестры Steel. Она доступна через статику `REGISTRY` в крейте `steel-registry`. Макросы будут описаны подробнее далее в этом руководстве.

### Регистрация записей в реестре

#### Steel

В `steel-registry/src/lib.rs` у структуры `Registry` есть функция `new_vanilla`, которая наполняет все реестры. Для узоров знамён она вызывает сгенерированные функции регистрации:

```rust
vanilla_banner_patterns::register_banner_patterns(&mut registry.banner_patterns);
vanilla_banner_pattern_tags::register_banner_pattern_tags(&mut registry.banner_patterns);
```

#### Расширения (Плагины/Моды)
Это TODO и в процессе разработки.

### Заморозка реестра

У `Registry` есть метод `freeze`, который проверяет перекрёстные ссылки реестров, а затем замораживает каждый отдельный реестр. После этого попытка регистрации вызовет панику вместо изменения реестра:

```rust
pub fn freeze(&mut self) {
    self.validate_references();

    self.attributes.freeze();
    self.blocks.freeze();
    self.items.freeze();
    self.banner_patterns.freeze();
    // ...
}
```

### Синхронизация реестров

Клиенту Minecraft требуется синхронизация определённых реестров; это обрабатывается в
`steel-core/src/server/registry_cache.rs`.
Сначала записи реестра синхронизируются в функции `build_registry_packets` с помощью макроса `add_registry`.
Этот макрос требует, чтобы реестр реализовывал трейт `ToNbtTag`. Важно, что реестр должен реализовывать трейт для ссылки, как в реестре узоров знамён: `impl ToNbtTag for &BannerPattern`.

Реальный список синхронизации в `steel-core/src/server/registry_cache.rs` включает узоры знамён так:

```rust
add_registry!(BANNER_PATTERN_REGISTRY, banner_patterns);
```

После синхронизации реестров на клиент отправляются теги; это делается в том же файле в функции
`build_tags_packet`.
Это также делается через макрос `add_tags`. Для использования этого макроса в реестре должны быть корректно реализованы теги:

```rust
add_tags!(BANNER_PATTERN_REGISTRY, banner_patterns);
```

Обе синхронизации подготавливаются после сборки и заморозки реестра при запуске, а затем отправляются во время входа. Ванильный клиент поддерживает синхронизированные записи, поэтому моддинг на стороне сервера в Steel возможен уже сейчас.

## Как использовать реестр

В этом разделе описаны распространённые шаблоны чтения, которые вы будете использовать при работе с реестрами Steel.

### Доступ к реестрам

Доступ к реестрам осуществляется через `REGISTRY`, но сначала его нужно импортировать:
```rust
use steel_registry::{RegistryEntry, REGISTRY, RegistryExt};
```

### Получение числового ID из записи

Для лучшей иллюстрации будут показаны как длинное, так и короткое решения, но, пожалуйста, ИСПОЛЬЗУЙТЕ короткое!

Это длинная версия, которая более наглядно демонстрирует общее использование реестра.
```rust
REGISTRY.chat_types.id_from_key(vanilla_chat_types::CHAT.key()).unwrap_or(0);
```
Поясним пример: сначала выбирается целевой реестр - здесь это `chat_types` - а затем извлекается id по ключу. Ключ - это идентификатор, состоящий из пространства имён и пути. Пространство имён по умолчанию `minecraft`, а путь, например, `stone`.

Ключ извлекается из определения `CHAT`, где есть функция `key()`, возвращающая идентификатор записи. Возвращаемое значение - `Option`, так что если для этого идентификатора ничего нет в реестре, возвращается `None`.

Возможно, вы уже заметили функцию `id()` у записи, которая выполняет длинную версию за вас. Таким образом, того же можно добиться так:
```rust
let registry_id = vanilla_chat_types::CHAT.id() as i32;
```
Он запаникует, если запись не зарегистрирована! Если нужна непаникующая альтернатива, используйте `try_id()` - она генерируется макросом `impl_registry_entry` и возвращает `Option<usize>`.

Пример здесь взят из плеера (`steel-core/src/player/mod.rs`), в методе `handle_chat`.

### Получение записи из реестра

Для этого реестры Steel предоставляют две функции: `by_id` и `by_key`. Обе возвращают `Option`.
ID - это `usize`, который можно получить через функцию `id` или `id_from_key` - подробнее см. [здесь](#получение-числового-id-из-записи).
Ключ можно получить через функцию `key()` у записи.

### Проверка, входит ли запись в тег

Во-первых, реестр должен быть тегированным, что даёт доступ ко многим другим функциям. Функция, важная для этой задачи, - `is_in_tag()`.

Пример:
```rust
let block = state.get_block();
REGISTRY.blocks.is_in_tag(block, &vanilla_block_tags::FIRE_TAG)
```
Этот пример проверяет, входит ли блок в `FIRE_TAG`. Первый параметр - проверяемая запись, второй - тег, по которому проверяется.

Другой пример - проверка, является ли соседний блок определённым блоком. Вместо проверки каждого варианта деревянной калитки можно использовать тег, и все деревянные варианты будут включены в эту проверку.

```rust
if REGISTRY.blocks.is_in_tag(neighbor_block, &FENCE_GATES_TAG){
    // Соседний блок - калитка любого типа дерева
}
else
{
    // Соседний блок - не калитка
}
```

## Макросы реестра

Макросы:
- `impl_registry_entry`
- `impl_registry_ext`
- `impl_registry`
- `impl_standard_methods`
- `impl_tagged_registry`

Дополнительная информация [здесь](https://steel-foundation.github.io/SteelMC/steel_registry/index.html#macros)

### impl_registry_entry

Генерирует только две функции:
- `key`
- `try_id`

из трейта `RegistryEntry`. Подробнее [здесь](https://steel-foundation.github.io/SteelMC/steel_registry/trait.RegistryEntry.html)

### impl_registry_ext

Реализует трейт `RegistryExt` со всеми функциями:
- `freeze`
- `by_id`
- `by_key`
- `id_from_key`
- `len`
- `is_empty`

Подробнее о каждой функции [здесь](https://steel-foundation.github.io/SteelMC/steel_registry/trait.RegistryExt.html)

### impl_registry

Этот макрос просто реализует макросы `impl_registry_ext` и `impl_registry_entry`.

### impl_standard_methods

Этот макрос генерирует код для функций:
- `register`
- `iter`
- `default` из трейта Default

Этот макрос можно использовать, если не требуется особая логика регистрации. Функция `iter` перечисляет только поле `id`, а `default` использует функцию `new` реестра.

### impl_tagged_registry

Реализует трейт `TaggedRegistryExt` и все его функции. `TaggedRegistryExt` требует `RegistryExt`, поэтому если используется этот макрос, макрос `impl_registry_ext` также должен быть применён или написан вручную!
Подробнее о трейте `TaggedRegistryExt` [здесь](https://steel-foundation.github.io/SteelMC/steel_registry/trait.TaggedRegistryExt.html)

## Создание собственного реестра

Реестры бывают разных видов; некоторые требуют больше логики, как реестр блоков, но это руководство даёт лишь базовое понимание написания реестра.

### Создание простого реестра

**ОГОВОРКА: импорт типов не рассматривается!**

Перед началом работы вот список файлов, которые вы затронете:

- Создать `steel-registry/src/<ваш_реестр>.rs` - сам реестр и его тип записи
- Редактировать `steel-registry/src/lib.rs` - добавить поле в `Registry`, подключить в `new_empty` и `freeze`, добавить константу идентификатора реестра
- Создать `steel-registry/build/<ваш_реестр>.rs` - сборочный скрипт (рассматривается в следующем разделе)
- Редактировать `steel-registry/build/build.rs` - зарегистрировать сборочную функцию

Для нашего примера мы вместе разработаем реестр, который будет хранить типы пива (руководство написано баварцем).
Сначала создайте файл в `steel-registry/src`.

В начале определим нашу структуру со всеми данными, которые хотим хранить:
```rust
#[derive(Debug)]
pub struct BeerType {
    pub key: Identifier,
    pub beer_type: &'static str,
    pub min_l: u32, // минимальный объём напитка в литрах
    pub max_l: u32, // максимальный объём напитка в литрах
}
```
Единственное обязательное поле здесь - `key`; это идентификатор записи. Все остальные поля - фиктивные и далее не важны!

Всегда рекомендуется реализовывать `ToNbtTag` для ссылки на запись, потому что это нужно для синхронизации. Это может выглядеть так:
```rust
impl ToNbtTag for &BeerType {
    fn to_nbt_tag(self) -> NbtTag {
        use simdnbt::owned::{NbtCompound, NbtTag};
        let mut compound = NbtCompound::new();
        let beer_type = self.beer_type.to_string();
        compound.insert("beer_type", beer_type.as_str());
        let min_l = self.min_l.to_string();
        compound.insert("min_l", min_l.as_str());
        let max_l = self.max_l.to_string();
        compound.insert("max_l", max_l.as_str());
        NbtTag::Compound(compound)
    }
}
```

Теперь нужно определить ссылочный тип записи - статическую ссылку на запись. Подробнее об этом выше!

```rust
pub type BeerTypeRef = &'static BeerType;
```

Как только это сделано, предварительные условия для типа выполнены, и можно приступать к самому реестру.

Для реестра требуются три поля: одно для хранения записей по числовому ID (`beer_type_by_id`); одно для связи `Identifier` записи с её числовым ID (`beer_type_by_key`); и последнее поле, чтобы сделать реестр замораживаемым (`allows_registering`). Это будет выглядеть так:

```rust
pub struct BeerTypeRegistry {
    beer_type_by_id: Vec<BeerTypeRef>,
    beer_type_by_key: FxHashMap<Identifier, usize>,
    allows_registering: bool,
}
```

Не волнуйтесь, мы уже на полпути! Следующий шаг - определить функцию `new` реестра, которая будет выглядеть так:
```rust
impl BeerTypeRegistry {
    #[must_use]
    pub fn new() -> Self {
        Self {
            beer_type_by_id: Vec::new(),
            beer_type_by_key: FxHashMap::default(),
            allows_registering: true,
        }
    }
}
```

Прежде чем закончить, нужно добавить наш реестр в несколько других мест. В файле `steel-registry/src/lib.rs` есть структура `Registry`.

Добавляем в неё наш реестр:
```rust
pub struct Registry {
    pub attributes: AttributeRegistry,
    pub blocks: BlockRegistry,
    pub items: ItemRegistry,
    pub data_components: DataComponentRegistry,
    pub beer_types: BeerTypeRegistry,
    ...
}
```

Далее подключаем реестр в двух соответствующих методах `Registry`: `new_empty` (который создаёт каждый реестр) и `freeze` (который блокирует их после регистрации).

Добавьте в функцию `new_empty`:
```rust
#[must_use]
pub fn new_empty() -> Self {
    Self {
        attributes: AttributeRegistry::new(),
        blocks: BlockRegistry::new(),
        data_components: DataComponentRegistry::new(),
        entity_data_serializers: EntityDataSerializerRegistry::new(),
        items: ItemRegistry::new(),
        beer_types: BeerTypeRegistry::new(),
        ...
    }
}
```

И в функцию `freeze`:
```rust
pub fn freeze(&mut self) {
        self.attributes.freeze();
        self.blocks.freeze();
        self.data_components.freeze();
        self.entity_data_serializers.freeze();
        self.items.freeze();
        self.biomes.freeze();
        self.beer_types.freeze();
        ...
}
```

В качестве последнего шага в файле `steel-registry/src/lib.rs` нужно добавить идентификатор для нашего реестра. Этот идентификатор используется для ссылки на сам реестр при синхронизации или обращении к нему из другого кода (например, из кода пакетов/синхронизации):
```rust
pub const BEER_TYPE_REGISTRY: Identifier = Identifier::vanilla_static("beer_type");
```

Теперь мы закончили с написанным вручную кодом! Остались только макросы. Подробнее о том, что делает каждый макрос, можно узнать [здесь](registry-macros).
Вернитесь к файлу вашего реестра.

Итак, первый макрос:
```rust
crate::impl_standard_methods!(
    BeerTypeRegistry,
    BeerTypeRef,
    beer_type_by_id,
    beer_type_by_key,
    allows_registering
);
```
Первый параметр - это реестр, который мы пишем; второй - определённый ранее тип; затем идут три поля нашего реестра в порядке: id, key, allow.

И второй макрос:
```rust
crate::impl_registry!(
    BeerTypeRegistry,
    BeerType,
    beer_type_by_id,
    beer_type_by_key,
    beer_types
);
```
Здесь первые четыре параметра те же, что и раньше, но последний параметр - это имя поля этого реестра в структуре `Registry`.

Теперь всё готово, и у нас есть работающий реестр! Но не удивляйтесь, что ваш реестр будет пуст - для этого написано руководство [по сборочным скриптам](create-your-own-build-script-for-a-registry).

### Расширение до тегированного реестра

Это гораздо проще, чем писать новый реестр!

Всего три шага!

#### 1. Добавление тегов

Добавьте поле `tags` в реестр следующим образом:
```rust
pub struct BeerTypeRegistry {
    beer_type_by_id: Vec<BeerTypeRef>,
    beer_type_by_key: FxHashMap<Identifier, usize>,
    tags: FxHashMap<Identifier, Vec<Identifier>>,
    allows_registering: bool,
}
```

#### 2. Инициализация
Инициализируйте его в функции `new`.
```rust
pub fn new() -> Self {
    Self {
        tags: FxHashMap::default(),
        ...
    }
}
```

#### 3. Добавление макроса
Теперь добавьте этот макрос (подробнее о макросах Rust можно узнать [здесь](https://doc.rust-lang.org/book/ch20-05-macros.html)):
```rust
crate::impl_tagged_registry!(
    BeerTypeRegistry,
    beer_type_by_key,
    "beer type"
);
```
Первый параметр - реестр, второй - поле `key`, а последний - строка с информацией о том, какой это реестр, для сообщений об ошибках!
Этот макрос зависит от поля `tags` в вашем реестре; если вы назвали его иначе, вам придётся написать все функции самостоятельно!

## Создание собственного сборочного скрипта для реестра

Каждый сборочный скрипт реестра немного отличается, потому что каждый файл данных ванилы имеет свою форму. Самый безопасный способ добавить новый - начать с существующего реестра с похожими данными. Пивной реестр ниже остаётся учебным примером; `steel-registry/build/banner_patterns.rs` - реальный сборочный скрипт SteelMC, по образцу которого построен этот пример.

Сборочный скрипт начинается с определения JSON-формы, ожидаемой от файла датапака:

```rust
#[derive(Deserialize, Debug)]
pub struct BeerTypeJson {
    beer_type: String,
    min_l: u32,
    max_l: u32,
}
```

Затем он читает все JSON-файлы из каталога ванильного датапака. Строка `cargo:rerun-if-changed` указывает Cargo, когда этот сгенерированный файл нужно пересобрать:

```rust
pub(crate) fn build() -> TokenStream {
    println!("cargo:rerun-if-changed=build_assets/builtin_datapacks/minecraft/beer_type/");

    let beer_type_dir = "build_assets/builtin_datapacks/minecraft/beer_type";
    let mut beer_types = Vec::new();

    for entry in fs::read_dir(beer_type_dir).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();

        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let beer_type_name = path.file_stem().unwrap().to_str().unwrap().to_string();
            let content = fs::read_to_string(&path).unwrap();
            let beer_type: BeerTypeJson = serde_json::from_str(&content)
                .unwrap_or_else(|e| panic!("Failed to parse {}: {}", beer_type_name, e));

            beer_types.push((beer_type_name, beer_type));
        }
    }

    // Генерация токенов продолжается ниже.
}
```

Затем та же функция генерирует код Rust для каждой статической записи и для сгенерированной функции регистрации:

```rust
let mut stream = TokenStream::new();

stream.extend(quote! {
    use crate::beer_type::{BeerType, BeerTypeRegistry};
    use steel_utils::Identifier;
});

let mut register_stream = TokenStream::new();
for (beer_type_name, beer_type) in &beer_types {
    let beer_type_ident = Ident::new(
        &beer_type_name.to_shouty_snake_case(),
        Span::call_site(),
    );
    let beer_type_name_str = beer_type_name.clone();
    let beer_type_kind = beer_type.beer_type.as_str();
    let min_l = beer_type.min_l;
    let max_l = beer_type.max_l;

    let key = quote! { Identifier::vanilla_static(#beer_type_name_str) };

    stream.extend(quote! {
        pub static #beer_type_ident: BeerType = BeerType {
            key: #key,
            beer_type: #beer_type_kind,
            min_l: #min_l,
            max_l: #max_l,
        };
    });

    register_stream.extend(quote! {
        registry.register(&#beer_type_ident);
    });
}

stream.extend(quote! {
    pub fn register_beer_types(registry: &mut BeerTypeRegistry) {
        #register_stream
    }
});
```

После создания сборочного файла подключите его в `steel-registry/build/build.rs`. Константа определяет имя сгенерированного файла в `steel-registry/src/generated`:

```rust
const BEER_TYPES: &str = "beer_types";

let vanilla_builds = [
    (attributes::build(), ATTRIBUTES),
    (blocks::build(), BLOCKS),
    (block_tags::build(), BLOCK_TAGS),
    (items::build(), ITEMS),
    (item_tags::build(), ITEM_TAGS),
    (beer_types::build(), BEER_TYPES),
    // ...
];
```

Наконец, откройте сгенерированный модуль и зарегистрируйте его в `Registry::new_vanilla` в `steel-registry/src/lib.rs`:

```rust
#[expect(warnings)]
#[rustfmt::skip]
#[path = "generated/vanilla_beer_types.rs"]
pub mod vanilla_beer_types;

pub fn new_vanilla() -> Self {
    let mut registry = Self::new_empty();

    // Здесь также регистрируются другие ванильные реестры.
    vanilla_beer_types::register_beer_types(&mut registry.beer_types);
    // Если у BeerTypeRegistry есть теги:
    // vanilla_beer_type_tags::register_beer_type_tags(&mut registry.beer_types);

    registry
}
```

Для нового реестра замените названия типов пива на ваш тип реестра, имя сгенерированного модуля, исходный каталог и JSON-структуру. Если исходные данные берутся из Steel Extractor, а не из `builtin_datapacks`, читайте из соответствующего файла в `steel-registry/build_assets`; подробнее о Steel Extractor можно узнать [здесь](../tools/steel_extractor).