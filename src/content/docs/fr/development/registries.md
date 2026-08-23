---
title: Comment fonctionnent les registres
description: Plongée dans l'utilisation et l'écriture d'un registre
---

## Qu'est-ce qu'un registre ?

Un registre est la source de vérité de Steel pour une catégorie de données de jeu nommées : blocs, items, types d'entités, biomes, types de chat, motifs de bannière, fluides et bien d'autres systèmes vanilla. Il stocke les définitions de ces entrées, pas les instances à l'exécution. Le registre des blocs stocke par exemple la définition du bloc de pierre, mais pas chaque bloc de pierre posé dans un chunk.

Les registres sont importants parce que les protocoles et la logique de jeu de Minecraft ont besoin d'identifiants stables, de noms et de définitions partagées. Steel utilise les registres pour associer un `Identifier` comme `minecraft:stone` à un identifiant numérique, exposer des références Rust typées, regrouper les entrées avec des tags, et synchroniser les registres dont le client vanilla a besoin à la connexion. La plupart des entrées vanilla sont générées à partir de JSON extraits ou de données de datapack, plutôt qu'écrites à la main.

Ce guide emploie ces termes de façon cohérente :

- **Entrée de registre** : une définition stockée dans un registre, par exemple un bloc, un item, un type d'entité, un biome ou un motif de bannière.
- **Type de référence d'entrée** : un alias de type propre au registre pour une référence statique vers une entrée, par exemple `BannerPatternRef = &'static BannerPattern`.
- **Identifier** : la clé stable avec namespace d'une entrée, par exemple `minecraft:stone`.
- **Identifiant numérique** : le `usize` attribué au moment de l'enregistrement. Les registres s'en servent pour les recherches rapides et pour les données de protocole.
- **Tag** : un groupe nommé d'identifiants d'entrées, par exemple `minecraft:fence_gates`.

## Comment fonctionnent les registres ?

Vu de haut, les données passent par les étapes suivantes :

```
build_assets/*.json
        │   (build script)
        ▼
src/generated/*.rs   ── entrées statiques + fonction d'enregistrement
        │   (démarrage du serveur)
        ▼
Registry::new_vanilla()       ── remplit chaque registre
        │
        ▼
registry.freeze()             ── plus aucune modification possible
        │
        ▼
REGISTRY.init(registry)       ── expose globalement le registre gelé
        │
        ▼
RegistryCache::new()          ── construit les paquets de registres et de tags
        │
        ▼
Envoi des paquets en cache    ── pendant la configuration de connexion
```

Tous les registres se trouvent dans le paquet cargo `steel-registry`, qui contient le code pour générer, initialiser, consulter et geler les données de registre.

Trois catégories sont utiles à garder en tête :

- Les **registres simples** associent une clé d'entrée à un identifiant numérique, et inversement.
- Les **registres à tags** font la même chose, mais regroupent en plus les entrées sous des identifiants de tags comme `minecraft:fence_gates`.
- Les **registres complexes** ont un comportement supplémentaire propre à leur domaine. Les blocs et les items en sont les principaux exemples, car leurs entrées se relient aux états, aux composants, aux comportements et à d'autres systèmes.

Ce guide se concentre sur les registres simples et à tags. Après l'avoir lu, tu devrais avoir assez de contexte pour suivre aussi les registres plus complexes. Pour une explication concrète des blocs et des items, voir [Enregistrement des blocs et des items](../block_item_registration/).

## Structure des dossiers

Voici un rapide aperçu des chemins importants du paquet `steel-registry`. Ils sont listés dans l'ordre du flux de build : données sources, build scripts, sources écrites à la main, puis sources générées.

### build_assets

Ce dossier ne contient que des données JSON et NBT, extraites via l'extracteur ou depuis le jar de Minecraft.
Le dossier `builtin_datapacks` est l'endroit où vont les données du jar de Minecraft, nécessaires uniquement pour
une montée de version de Minecraft, dont le guide se trouve [ici](../upgrade-minecraft).
Tous les fichiers JSON de ce dossier sont extraits de vanilla via le [SteelExtractor](../tools/steel_extractor).

### build

Ce dossier contient les fichiers de build, qui convertissent les fichiers JSON en code Rust chargeant les registres.
La plupart des registres ont leur propre fichier de build : le registre des variantes de poule a par exemple le fichier `chicken_variants`.
Comme ce guide se concentre sur le fonctionnement des registres, il ne couvre pas les build scripts.

### src

C'est là que sont rangés tous les registres, et c'est le sujet principal de ce guide.

### src/generated

Ce dossier contient tous les fichiers Rust générés par les build scripts et ne doit pas être modifié à la main.

## Déroulement

Sers-toi de ceci comme aide-mémoire du parcours des données de registre dans Steel :

1. Le build script vérifie si les fichiers sources JSON ou de datapack ont changé.
2. Le build script régénère les fichiers Rust dans `steel-registry/src/generated`.
3. `Registry::new_vanilla` crée les registres vides et enregistre toutes les données Steel générées.
4. L'enregistrement des plugins et des mods se fera avant le gel, une fois ce système prêt.
5. `Registry::freeze` verrouille les registres pour qu'aucun code ultérieur ne puisse modifier les identifiants ou les tags.
6. Le flux de connexion synchronise les registres et les tags dont le client Minecraft a besoin.

### Définir une entrée de registre

Le fichier de registre déclare le type d'entrée qu'il contient, ainsi qu'un type public de référence d'entrée pour ce registre. Voici un exemple réel tiré de `steel-registry/src/banner_pattern.rs` :

```rust
pub struct BannerPattern {
    pub key: Identifier,
    pub asset_id: Identifier,
    pub translation_key: &'static str,
}

pub type BannerPatternRef = &'static BannerPattern;
```

Le type de référence d'entrée (`BannerPatternRef`) est ce que le code fait circuler quand il a besoin de référencer une entrée de motif de bannière. Cela indique aussi comment les données sont stockées : chaque entrée de registre pointe vers des données statiques. Dans Steel, la plupart des statiques vanilla vivent dans `steel-registry/src/generated`.

Le fichier généré `steel-registry/src/generated/vanilla_banner_patterns.rs` contient des entrées comme celle-ci :

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

La fonction d'enregistrement générée insère ensuite les références d'entrées dans le registre :

```rust
pub fn register_banner_patterns(registry: &mut BannerPatternRegistry) {
    registry.register(&RHOMBUS);
}
```

Cela signifie que les entrées de registre sont des valeurs statiques globalement uniques. Si deux références pointent vers la même entrée de registre, elles pointent vers la même mémoire statique. L'égalité de pointeurs est donc possible pour les références de registre, mais le code ordinaire devrait tout de même privilégier des implémentations d'égalité explicites, pour que `==` ait le sens attendu.

### Créer le registre

Chaque registre stocke les entrées par identifiant numérique et par identifiant. Les registres à tags stockent aussi l'appartenance aux tags. Le vrai registre des motifs de bannière ressemble à ceci dans `steel-registry/src/banner_pattern.rs` :

```rust
pub struct BannerPatternRegistry {
    banner_patterns_by_id: Vec<BannerPatternRef>,
    banner_patterns_by_key: FxHashMap<Identifier, usize>,
    tags: FxHashMap<Identifier, Vec<Identifier>>,
    allows_registering: bool,
}
```

Les macros en bas du même fichier relient ce stockage aux traits de registre partagés :

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

Dans `steel-registry/src/lib.rs`, une structure nommée `Registry` contient tous les registres de Steel. Elle est exposée via la statique `REGISTRY` du crate `steel-registry`. D'autres macros seront décrites plus loin dans ce guide.

### Enregistrer des entrées dans le registre

#### Steel

Dans `steel-registry/src/lib.rs`, la structure `Registry` possède une fonction `new_vanilla` qui remplit tous les registres. Pour les motifs de bannière, elle appelle les fonctions d'enregistrement générées :

```rust
vanilla_banner_patterns::register_banner_patterns(&mut registry.banner_patterns);
vanilla_banner_pattern_tags::register_banner_pattern_tags(&mut registry.banner_patterns);
```

#### Extensions (plugins et mods)

C'est encore un TODO, le travail est en cours.

### Geler le registre

`Registry` a une méthode `freeze` qui valide les références entre registres puis gèle chaque registre individuellement. Ensuite, tout enregistrement provoque une panique au lieu de modifier le registre :

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

### Synchroniser les registres

Le client Minecraft exige que certains registres soient synchronisés ; cela se gère dans
`steel-core/src/server/registry_cache.rs`.
D'abord, les entrées de registre sont synchronisées dans la fonction `build_registry_packets`, via la macro `add_registry`.
Cette macro exige que le registre implémente le trait `ToNbtTag`. Le point important est que le registre
doit implémenter ce trait sur la référence, comme dans le registre des motifs de bannière : `impl ToNbtTag for &BannerPattern`.

La vraie liste de synchronisation, dans `steel-core/src/server/registry_cache.rs`, inclut les motifs de bannière ainsi :

```rust
add_registry!(BANNER_PATTERN_REGISTRY, banner_patterns);
```

Après la synchronisation des registres, les tags sont envoyés au client ; cela se fait dans le même fichier, dans la
fonction `build_tags_packet`.
Là encore, via une macro nommée `add_tags`. Pour l'utiliser, le registre doit avoir des tags correctement
implémentés :

```rust
add_tags!(BANNER_PATTERN_REGISTRY, banner_patterns);
```

Les deux synchronisations sont préparées après la construction et le gel du registre au démarrage, puis envoyées à la connexion. Le client vanilla prend en charge les entrées synchronisées, ce qui rend le modding côté serveur possible dès aujourd'hui avec Steel.

## Comment utiliser un registre

Cette section couvre les usages de lecture les plus courants avec les registres de Steel.

### Accéder aux registres

Les registres sont accessibles via `REGISTRY`, mais il faut d'abord l'importer :

```rust
use steel_registry::{RegistryEntry, REGISTRY, RegistryExt};
```

### Obtenir un identifiant numérique depuis une entrée

Pour mieux illustrer le concept, la version longue et la version courte sont présentées, mais utilise la version courte !

Voici la version longue, qui montre plus directement comment se servir d'un registre en général.

```rust
REGISTRY.chat_types.id_from_key(vanilla_chat_types::CHAT.key()).unwrap_or(0);
```

Pour expliquer cet exemple : on sélectionne d'abord le registre visé, ici `chat_types`, puis on récupère l'identifiant depuis la clé. La clé est un identifiant composé d'un namespace et d'un chemin. Le namespace vaut `minecraft` par défaut, et le chemin est par exemple `stone`.

La clé est extraite de la définition de `CHAT`, où se trouve la fonction `key()` qui donne l'identifiant de cette entrée. La valeur de retour est une `Option` : quand rien ne correspond à cet identifiant dans le registre, elle vaut `None`.

Tu as peut-être déjà remarqué la fonction `id()` sur l'entrée, qui fait la version longue à ta place. On obtient donc le même résultat ainsi :

```rust
let registry_id = vanilla_chat_types::CHAT.id() as i32;
```

Elle panique si l'entrée n'est pas enregistrée ! S'il te faut une alternative qui ne panique pas, utilise `try_id()` : elle est générée par `impl_registry_entry` et renvoie une `Option<usize>`.

L'exemple provient du joueur (`steel-core/src/player/mod.rs`), dans la méthode `handle_chat`.

### Obtenir une entrée depuis un registre

Pour cela, les registres de Steel fournissent deux fonctions : `by_id` et `by_key`. Toutes deux renvoient une `Option`.
L'identifiant est un `usize`, que tu peux obtenir via la fonction `id` ou via `id_from_key` : plus d'informations [ici](#obtenir-un-identifiant-numérique-depuis-une-entrée).
La clé s'obtient via la fonction `key()` sur l'entrée.

### Vérifier si une entrée est dans un tag

Il faut d'abord que le registre soit un registre à tags, ce qui donne accès à bien plus de fonctions. Celle qui nous intéresse ici est `is_in_tag()`.

Voici un exemple :

```rust
let block = state.get_block();
REGISTRY.blocks.is_in_tag(block, &vanilla_block_tags::FIRE_TAG)
```

Cet exemple vérifie si un bloc appartient à `FIRE_TAG`. Le premier paramètre est l'entrée à vérifier, le second est le tag de référence.

Autre exemple : vérifier si le bloc voisin est un bloc précis. Plutôt que de tester chaque variante de bois de la barrière, tu peux utiliser le tag, et toutes les variantes de bois sont incluses dans la vérification.

```rust
if REGISTRY.blocks.is_in_tag(neighbor_block, &FENCE_GATES_TAG){
    // Le bloc voisin est une barrière, quel que soit son type de bois
}
else
{
    // Le bloc voisin n'est pas une barrière
}
```

## Macros de registre

Les macros sont :
- `impl_registry_entry`
- `impl_registry_ext`
- `impl_registry`
- `impl_standard_methods`
- `impl_tagged_registry`

Tu trouveras aussi des informations [ici](https://steel-foundation.github.io/SteelMC/steel_registry/index.html#macros).

### impl_registry_entry

Seules deux fonctions sont générées :
- `key`
- `try_id`

issues du trait `RegistryEntry`. Plus d'informations à ce sujet [ici](https://steel-foundation.github.io/SteelMC/steel_registry/trait.RegistryEntry.html).

### impl_registry_ext

Implémente le trait `RegistryExt` avec toutes ses fonctions :
- `freeze`
- `by_id`
- `by_key`
- `id_from_key`
- `len`
- `is_empty`

Plus d'informations sur chaque fonction [ici](https://steel-foundation.github.io/SteelMC/steel_registry/trait.RegistryExt.html).

### impl_registry

Cette macro implémente seulement les macros `impl_registry_ext` et `impl_registry_entry`.

### impl_standard_methods

Cette macro génère le code des fonctions :
- `register`
- `iter`
- `default`, issue du trait `Default`

Elle s'utilise quand aucune logique particulière n'est nécessaire à l'enregistrement. La fonction `iter` ne fait qu'énumérer le champ `id`, et la fonction `default` utilise la fonction `new` du registre.

### impl_tagged_registry

Implémente le trait `TaggedRegistryExt` et toutes ses fonctions. `TaggedRegistryExt` requiert `RegistryExt` : si cette macro est utilisée, il faut aussi envisager la macro `impl_registry_ext`, ou écrire l'implémentation à la main !
Plus d'informations sur le trait `TaggedRegistryExt` [ici](https://steel-foundation.github.io/SteelMC/steel_registry/trait.TaggedRegistryExt.html).

## Créer son propre registre

Les registres existent en plusieurs variantes, certains demandent plus de logique, comme le registre des blocs, mais ce guide se contente de te donner une compréhension de base de l'écriture d'un registre.

### Créer un registre simple

**AVERTISSEMENT : l'import des types n'est pas traité ici !**

Avant de commencer, voici la liste des fichiers que tu vas toucher :

- Créer `steel-registry/src/<ton_registre>.rs` : le registre lui-même et son type d'entrée
- Modifier `steel-registry/src/lib.rs` : ajouter le champ à `Registry`, le brancher dans `new_empty` et `freeze`, et ajouter la constante d'identifiant du registre
- Créer `steel-registry/build/<ton_registre>.rs` : le build script (traité dans la section suivante)
- Modifier `steel-registry/build/build.rs` : enregistrer la fonction de build

Pour notre exemple, le registre que nous allons développer ensemble stockera des types de bière (guide écrit par une personne bavaroise).
Commence donc par créer un fichier dans `steel-registry/src`.

Pour commencer, on définit notre structure avec toutes les données que l'on veut stocker :

```rust
#[derive(Debug)]
pub struct BeerType {
    pub key: Identifier,
    pub beer_type: &'static str,
    pub min_l: u32, //minimal liter of drink size
    pub max_l: u32, //maximum liter of drink size
}
```

Le seul champ qui compte ici est `key`, l'identifiant de l'entrée. Tous les autres champs sont factices et n'ont plus d'importance à partir de maintenant !

Il est toujours recommandé d'implémenter `ToNbtTag` pour la référence d'entrée, car c'est nécessaire à la synchronisation. Cela peut ressembler à ceci :

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

Il faut maintenant définir le type de référence d'entrée, qui est une référence statique vers l'entrée. Plus d'informations à ce sujet plus haut !

```rust
pub type BeerTypeRef = &'static BeerType;
```

Une fois cela fait, les prérequis du type sont réglés et nous pouvons attaquer le registre lui-même.

Le registre a besoin de trois champs : un champ pour stocker les entrées par identifiant numérique (`beer_type_by_id`) ; un champ pour relier l'`Identifier` d'une entrée à son identifiant numérique (`beer_type_by_key`) ; et un dernier champ pour rendre le registre gelable (`allows_registering`). Cela donne ceci :

```rust
pub struct BeerTypeRegistry {
    beer_type_by_id: Vec<BeerTypeRef>,
    beer_type_by_key: FxHashMap<Identifier, usize>,
    allows_registering: bool,
}
```

Pas d'inquiétude, nous sommes déjà à mi-chemin ! L'étape suivante est de définir la fonction `new` du registre, qui ressemble à ceci :

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

Avant de terminer, il faut ajouter notre registre à quelques autres endroits. Dans le fichier `steel-registry/src/lib.rs` se trouve la structure `Registry`.

On y ajoute notre registre :

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

Ensuite, branche le registre dans les deux méthodes concernées de `Registry` : `new_empty` (qui construit chaque registre) et `freeze` (qui les verrouille après enregistrement).

Ajoute-le à la fonction `new_empty` :

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

Puis à la fonction `freeze` :

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

Dernière étape, dans le fichier `steel-registry/src/lib.rs`, il faut ajouter un identifiant pour notre registre. Cet identifiant sert à désigner le registre lui-même lors de la synchronisation ou depuis d'autres parties du code (par exemple depuis le code de paquets ou de synchronisation) :

```rust
pub const BEER_TYPE_REGISTRY: Identifier = Identifier::vanilla_static("beer_type");
```

Voilà, le code écrit à la main est terminé ! Il ne reste que des macros. Tu trouveras plus d'informations sur le rôle de chacune [ici](#macros-de-registre).
Retourne dans le fichier de ton registre.

Première macro :

```rust
crate::impl_standard_methods!(
    BeerTypeRegistry,
    BeerTypeRef,
    beer_type_by_id,
    beer_type_by_key,
    allows_registering
);
```

Le premier paramètre est le registre que nous écrivons ; le deuxième est le type défini plus haut ; viennent ensuite les trois champs de notre registre, dans l'ordre : id, clé, autorisation.

Et la seconde macro :

```rust
crate::impl_registry!(
    BeerTypeRegistry,
    BeerType,
    beer_type_by_id,
    beer_type_by_key,
    beer_types
);
```

Ici les quatre premiers paramètres sont les mêmes que précédemment, mais le dernier est le nom du champ de ce registre dans la structure `Registry`.

Nous en avons fini, le registre fonctionne ! Ne sois pas surpris qu'il soit vide : c'est pour cela que le guide [sur les build scripts](#écrire-son-propre-build-script-de-registre) a été écrit.

### Passer à un registre à tags

C'est bien plus facile que d'écrire un nouveau registre !

Trois étapes seulement !

#### 1. Ajouter les tags

Ajoute un champ `tags` au registre, comme ceci :

```rust
pub struct BeerTypeRegistry {
    beer_type_by_id: Vec<BeerTypeRef>,
    beer_type_by_key: FxHashMap<Identifier, usize>,
    tags: FxHashMap<Identifier, Vec<Identifier>>,
    allows_registering: bool,
}
```

#### 2. Initialiser

Initialise-le dans la fonction `new`.

```rust
pub fn new() -> Self {
    Self {
        tags: FxHashMap::default(),
        ...
    }
}
```

#### 3. Ajouter la macro

Ajoute maintenant cette macro (pour approfondir les macros Rust, c'est [ici](https://doc.rust-lang.org/book/ch20-05-macros.html)) :

```rust
crate::impl_tagged_registry!(
    BeerTypeRegistry,
    beer_type_by_key,
    "beer type"
);
```

Le premier paramètre est le registre, le deuxième est le champ `key`, et le dernier est une chaîne où tu indiques de quel registre il s'agit, pour les messages d'erreur !
Cette macro dépend du champ `tags` de ton registre ; si tu l'as nommé autrement, il te faudra écrire toutes les fonctions toi-même !

## Écrire son propre build script de registre

Chaque build script de registre est un peu différent, parce que chaque fichier de données vanilla a sa propre forme. Le plus sûr, pour en ajouter un, est de partir d'un registre existant aux données similaires. Le registre de bières reste l'exemple pédagogique ; `steel-registry/build/banner_patterns.rs` est le vrai build script de SteelMC dont cet exemple s'inspire.

Le build script commence par définir la forme JSON qu'il attend du fichier de datapack :

```rust
#[derive(Deserialize, Debug)]
pub struct BeerTypeJson {
    beer_type: String,
    min_l: u32,
    max_l: u32,
}
```

Il lit ensuite tous les fichiers JSON du dossier de datapack vanilla. La ligne `cargo:rerun-if-changed` indique à Cargo quand ce fichier généré doit être reconstruit :

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

    // La génération des tokens continue plus bas.
}
```

La même fonction émet ensuite du code Rust pour chaque entrée statique et pour la fonction d'enregistrement générée :

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

Une fois le fichier de build en place, branche-le dans `steel-registry/build/build.rs`. La constante détermine le nom du fichier généré dans `steel-registry/src/generated` :

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

Enfin, expose le module généré et enregistre-le dans `Registry::new_vanilla`, dans `steel-registry/src/lib.rs` :

```rust
#[expect(warnings)]
#[rustfmt::skip]
#[path = "generated/vanilla_beer_types.rs"]
pub mod vanilla_beer_types;

pub fn new_vanilla() -> Self {
    let mut registry = Self::new_empty();

    // Les autres registres vanilla sont aussi enregistrés ici.
    vanilla_beer_types::register_beer_types(&mut registry.beer_types);
    // Si BeerTypeRegistry a des tags :
    // vanilla_beer_type_tags::register_beer_type_tags(&mut registry.beer_types);

    registry
}
```

Pour un nouveau registre, remplace les noms liés aux types de bière par ton type de registre, ton nom de module généré, ton dossier source et ta structure JSON. Si les données sources viennent de l'extracteur Steel plutôt que de `builtin_datapacks`, lis le fichier correspondant dans `steel-registry/build_assets` ; tu trouveras plus d'informations sur l'extracteur Steel [ici](../tools/steel_extractor).
