---
title: Añadir un nuevo bloque (Guía básica)
description: Una guía básica de cómo añadir un nuevo bloque sin comportamiento y preparación para añadir comportamientos
sidebar:
    label: Añadir un nuevo bloque
---

> ⚠️ Esta es solo una guía muy básica y **no implementa ninguna funcionalidad todavía**.

---

## 1. Elige qué bloque implementar

Lo primero es seleccionar qué bloque quieres añadir al proyecto.

**Ejemplo:** En esta guía, queremos añadir los **Barrotes de hierro** y los **Barrotes de cobre**.

---

## 2. Encuentra el nombre de la clase en `classes.json`

Antes de crear nuestro `struct`, necesitamos saber cómo llamarlo correctamente.

Dirígete al archivo:

```
steel-core/build/classes.json
```

Busca tu bloque en este archivo (en inglés). En nuestro caso:
- Encontramos `IronBarsBlock`
- Y también `WeatheringCopperBarsBlock`

Esto significa que **necesitamos dos `structs` diferentes** para implementar estos bloques.

---

## 3. Crea tu archivo de clase de bloque

Ahora crearemos un par de ficheros en:

```
steel-core/src/behavior/blocks/
```

Tienes que ser **tan descriptivo como puedas** con el nombre.\
En nuestro caso serán:
- `iron_bars_block.rs`
- `copper_bars_block.rs`

---

## 4. Añade la definición del `struct`

Añade un `struct` como este en tu código:

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
    /// Esto crea un nuevo comportamiento para el bloque elegido.
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehaviour for IronBarsBlock {}
```

> ⚠️ Esta es solo una guía muy básica y **no implementa ninguna funcionalidad todavía**.

---

## 5. Registra el módulo del bloque

Añade el módulo de tu bloque a:

```
steel-core/src/behavior/blocks/mod.rs
```

Debería quedar tal que así:

```rust
// /steel-core/src/behavior/blocks/mod.rs
mod iron_bars_block;
pub use iron_bars_block::IronBarsBlock;
```

---

## 6. Verifica el nombre del `struct`

¡Este parece **un buen punto para comprobar** si el nombre del `struct` es correcto!

Comprueba una vez más que **el nombre de tu `struct`** sea igual al encontrado en `classes.json`.

---

## 7. Añade el ´struct´ a los bloques generados

Ahora queremos añadir nuestro bloque a la lista de los ya generados.\
Para eso, dirígete a:

```
steel-core/build/blocks.rs
```

Entender lo que hace internamente la función `generate_registrations` puede ser interesante, pero esto **no es necesario** para que tu bloque funcione.

---

## 8. Concentración en las funciones de compilado

Ahora es momento de cambiar de foco a la función `build` en el archivo actual.

> ⚠️ **Importante:**
> Solo **añade** codigo nuevo.
> **No quites o modifiques el codigo existente**, pues podrias romper bloques de otros contribuidores.

---

## 9. Crea un vector mutable

Primero tienes que crear un vector mutable con un nombre apropiado:

```rust
// /steel-core/build/blocks.rs
let mut iron_bar_blocks = Vec::new();
```

---

## 10. Extiende el `match`

Añade el nombre de tu bloque al `match`.\
Recuerda: **Solo añadir**, no quitar.

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

## 11. Define el tipo de bloque

Ahora define el identificador del tipo de bloque:

```rust
// /steel-core/build/blocks.rs
let iron_bar_type = Ident::new("IronBarsBlock", Span::call_site());
```

---

## 12. Genera los registros

Ahora, añadiremos los registros:

```rust
// /steel-core/build/blocks.rs
let iron_bar_registrations =
    generate_registrations(iron_bar_blocks.iter(), &iron_bar_type);
```

---

## 13. Añade tus registros a la salida

⚠️ **¡Aquí andate con ojo!**

* El `#` anterior al nombre de tu variable es **necesario**
* Esto evita que la variable colisione con palabras clave de Rust
* **NO** añadas una coma al final; este código se implementará en otro archivo.

Ejemplo:

```rust
// /steel-core/build/blocks.rs
let output = quote! {
    //! Asignamientos de comportamientos de bloque generados

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

## 14. Compila el proyecto

¡Ahora dale a **compilar** y deja que Rust (y tu maravilloso trabajo) haga su magia!

Tras compilarse, tu bloque debería aparecer en:

```
steel-core/src/behavior/generated/blocks.rs
```

Puedes ir y usar **Ctrl + F** para buscar el nombre de tu bloque.

### Solución de problemas

Si aun así no encuentras tu bloque:

1. Borra la carpeta `generated`
2. Ejecuta:

   ```
   cargo clean
   ```
3. Compila una vez más

Eso debería solucionar el problema.

---

# Añadiendo comportamientos al bloque

Como ya ha sido indicado, el bloque actualmente **no hace nada**.

Para darle comportamientos, tienes que implementar los métodos requeridos en `BlockBehaviour` en tu archivo (ej. `iron_bars_block.rs`).

> 👉 **Recomendamos** echarle un vistazo a otras implementaciones de bloques con funcionalidad similar al tuyo.

Para ello, aquí tienes alguna información para que lo entiendas mejor:

---

## Trabajando con block states

### Obteniendo un block state

Para hacerte con un block state, puedes hacer algo como esto:

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

En dicho block state, **toda la información del bloque** específico es almacenada.

---

### Modificando las propiedades de un block state

Esto puede ser hecho así:

```rust
state.set_value(&BlockStateProperties::WEST, true);
```

Puedes hacerlo al contrario para obtener el block state.

---

## Comprobando bloques vecinos o tags

Para comprobar si el bloque colindante se trata de uno específico o pertenece a un grupo (como barrotes o muros), puedes usar esto:

```rust
let walls_tag = Identifier::vanilla_static("walls");
if REGISTRY.blocks.is_in_tag(neighbor_block, &walls_tag) {
    return true;
}
```

---

Eso sería todo; con esto ya tendrías la **estructura básica** en su sitio para implementar su comportamiento 🚀

## Recursos adicionales

No disponibles 😅
