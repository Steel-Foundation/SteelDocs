---
title: Enregistrement des commandes
description: Comment les commandes de SteelMC sont construites, enregistrées et reliées aux permissions.
---

SteelMC utilise un graphe de nœuds littéraux et de nœuds d'arguments, à la manière de Brigadier. Un `CommandRegistration` distinct donne à chaque graphe une identité stable avec namespace, ses alias et sa politique de permissions.

## Modules de commandes

Les commandes intégrées vivent dans `steel-core/src/command/builtins/`. Chaque module expose une fonction d'enregistrement et construit son graphe de commande séparément :

```rust
use steel_utils::Identifier;

use super::super::{
    brigadier::{CommandNodeBuilder, CommandSyntaxError},
    execution::{
        CommandSource, SteelCommandContext, SteelCommandRuntime, literal,
    },
    registration::CommandRegistration,
};

pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::vanilla_static("example"), |_| command())
}

fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("example").executes(run)
}

fn run(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    context.source().send_success(&"Example ran".into());
    Ok(1)
}
```

Ajoute le module et son appel à `registration()` dans `steel-core/src/command/builtins/mod.rs`. L'enregistrement est explicite : le build script ne découvre plus les modules de commandes.

L'identifiant d'enregistrement fait autorité. Son chemin doit être identique au littéral racine (`minecraft:example` a pour racine `example`), et son namespace détermine la permission par défaut.

## Construire un graphe de commande

Utilise `literal(...)` pour les mots fixes et `argument(...)` pour les valeurs analysées :

```rust
fn command() -> CommandNodeBuilder<CommandSource, SteelCommandRuntime> {
    literal("example")
        .then(literal("reload").executes(reload))
        .then(
            literal("inspect").then(
                argument("target", SteelArgumentType::players())
                    .executes(inspect),
            ),
        )
}
```

Les méthodes de construction les plus courantes sont :

| Méthode | Rôle |
| --- | --- |
| `.then(child)` | Ajoute un nœud enfant |
| `.executes(handler)` | Ajoute un exécuteur synchrone |
| `.executes_suspended(handler)` | Ajoute un exécuteur pouvant se terminer de façon asynchrone |
| `.requires(requirement)` | Remplace la condition du nœud |
| `.also_requires(requirement)` | Combine une condition supplémentaire avec l'existante |
| `.redirects(target)` | Redirige l'analyse sans changer la source |
| `.redirects_with_modifier(...)` | Redirige avec une transformation de la source, ou un fork |

Les exécuteurs reçoivent `&SteelCommandContext<CommandSource>` et renvoient `Result<i32, CommandSyntaxError>`. L'entier est le résultat de la commande, utilisé par des fonctionnalités comme `/execute store` et la propagation des valeurs de retour.

## Arguments

Les parseurs intégrés qui connaissent Minecraft sont exposés par `SteelArgumentType` ; les parseurs Brigadier primitifs passent par `ArgumentType` :

```rust
literal("rate").then(
    argument("rate", ArgumentType::float(1.0, 10_000.0))
        .executes(set_rate),
)
```

Lis les valeurs analysées via les accesseurs typés de `SteelCommandContext` :

```rust
fn inspect(
    context: &SteelCommandContext<CommandSource>,
) -> Result<i32, CommandSyntaxError> {
    let targets = context.players("target")?;
    i32::try_from(targets.len())
        .map_err(|_| CommandSyntaxError::dynamic("Too many targets"))
}
```

Utilise le même nom d'argument dans le graphe et dans l'accesseur. Certains accesseurs renvoient une `Option` : convertis une valeur absente en `CommandSyntaxError` plutôt que de supposer qu'elle existe.

Les types d'arguments fournissent l'analyse côté serveur, les métadonnées de parseur pour le client, et les suggestions. Les charges utiles d'arguments keyées appartenant à Steel permettent de garder des valeurs d'arguments personnalisées extensibles, sans dépendre de l'identité des `TypeId` de Rust.

## Permissions racines automatiques

Sauf surcharge, un enregistrement dérive sa permission de son identifiant :

```text
<namespace>.command.<chemin>
```

Par exemple, `minecraft:give` dérive `minecraft.command.give`, et `steel:fly` dérive `steel.command.fly`. La condition racine contrôle l'analyse, l'arbre de commandes du client et les suggestions.

Les permissions non définies sont normalement refusées. Pour une commande accessible à tous, utilise `.default_access()` :

```rust
pub(super) fn registration() -> CommandRegistration<CommandSource> {
    CommandRegistration::new(Identifier::vanilla_static("list"), |_| command())
        .default_access()
}
```

L'accès par défaut autorise une permission non définie, mais respecte tout de même un refus explicite. Ce n'est pas la même chose que contourner les vérifications de permissions.

Utilise `.permission(expression)` quand une commande a besoin d'une politique racine personnalisée ou composée :

```rust
let permission = PermissionExpr::key(PermissionKey::parse("plugin.command.inspect")?);
CommandRegistration::new(Identifier::new_static("plugin", "inspect"), |_| command())
    .permission(permission)
```

Une expression de permission explicite ne peut pas être combinée avec des permissions de sous-commandes dérivées sur le même enregistrement.

## Alias et collisions

Le chemin de l'identifiant est la racine canonique. Ajoute des alias sans namespace avec `.alias(...)` :

```rust
CommandRegistration::new(Identifier::vanilla_static("teleport"), |_| command())
    .alias("tp")
```

`/teleport` et `/tp` utilisent tous deux `minecraft.command.teleport` : les alias ne créent pas de nouvelles clés de permission.

Les identifiants de commandes doivent être uniques. En cas de collision sur une racine ou un alias sans namespace, c'est le premier enregistrement qui l'emporte. Si une commande subit une collision, Steel enregistre aussi son identifiant avec namespace (par exemple `/minecraft:teleport`) comme solution de repli. Les alias avec namespace sont réservés à ces replis de collision et ne peuvent pas être déclarés manuellement.

## Permissions de sous-commandes

Déclare sur l'enregistrement les chemins littéraux pouvant être accordés indépendamment :

```rust
CommandRegistration::new(Identifier::vanilla_static("tick"), |_| command())
    .subcommand_permission(["rate"])
    .subcommand_permission(["step"])
    .subcommand_permission(["freeze"])
```

Cela publie `minecraft.command.tick.rate`, `minecraft.command.tick.step` et `minecraft.command.tick.freeze`. Un utilisateur peut détenir soit la permission racine, soit la permission fille correspondante. Un refus sur une fille précise peut surcharger une autorisation racine large, car chaque nœud utilise une expression de permission portée.

Les chemins ne contiennent que des noms littéraux. L'enregistrement traverse les nœuds d'arguments en cherchant les correspondances, si bien qu'une déclaration comme `["user", "info"]` peut correspondre à `/perms user <cibles> info`. Un chemin absent, dupliqué, ambigu, vide ou invalide fait échouer la construction du dispatcher.

Les permissions liées à des valeurs dynamiques s'expriment directement dans la politique de l'enregistrement et sont vérifiées par l'exécuteur. `/gamemode` en est l'exemple intégré : sa politique racine visible est une expression `Any` sur des permissions portées comme `minecraft.command.gamemode.creative`, et l'exécution revérifie le mode sélectionné.

## Expressions de permission

`PermissionExpr` compose l'autorisation des commandes :

| Expression | Signification |
| --- | --- |
| `PermissionExpr::key(key)` | Vérifie une clé |
| `PermissionExpr::scoped_key(parent, key)` | Permet au parent d'accorder une fille tout en conservant une règle fille plus spécifique |
| `left & right` | Exige toutes les expressions |
| `left \| right` | Exige au moins une expression |

Les règles de configuration et les arguments de règle de `/perms` ne sont pas des expressions de commande composées. Ils contiennent une clé de permission et un sélecteur de contexte optionnel, par exemple `minecraft.command.gamemode{domain=lobby}`.

## Validation et découverte

`CommandDispatcherBuilder` valide et construit le dispatcher complet de façon atomique. Il rejette les identifiants et alias invalides, les identifiants dupliqués, les racines incohérentes ou non littérales, les chemins de sous-commandes invalides et les clés de permission explicites invalides. Une construction échouée n'expose jamais un dispatcher partiellement enregistré.

Le builder collecte également les clés de permission racines et de sous-commandes pour les suggestions de `/perms`. Enregistre explicitement les permissions hors commandes avec `declare_permission(...)` quand elles doivent être découvrables.

Le graphe filtré est utilisé de façon cohérente pour l'analyse, l'arbre de commandes du client et les suggestions côté serveur. Les nœuds dont les conditions d'autorisation échouent sont omis. Le contexte de permission provient de la source de la commande, y compris son monde et son domaine ; les sources console et RCON contournent les règles de permissions des joueurs.
