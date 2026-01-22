---
title: Feature Flags
description: Referencia completa de todas las opciones de compilado de SteelMC.
sidebar:
  order: 1
---

SteelMC usa el sistema de feature flags de Rust para habilitar o deshabilitar funcionalidad a tiempo de compilado. Esto te permite personalizar tu ejecutable para usos de casos específicos.

## steel (Paquete principal)

Estas flags controlan el ejecutable principal del servidor.

| Característica | Por defecto | Descripción |
|---------|---------|-------------|
| `mimalloc` | ✅ Habilitada | Usar MiMalloc como el memory allocator para un rendimiento mejorado |
| `deadlock_detection` | ❌ Deshabilitada | Habilita detección de deadlocks mediante parking_lot (para depuramiento) |
| `dhat-heap` | ❌ Deshabilitada | Habilita el depurador de pila DHAT para el depuramiento de memoria |

### Ejemplo de uso

```bash
# Compilado con detección de deadlocks
cargo build --features deadlock_detection

# Compilado sin MiMalloc
cargo build --no-default-features
```

## steel-core

Estas flags controlan la lógica del núcleo del juego.

| Característica | Por defecto | Descripción |
|---------|---------|-------------|
| `stand-alone` | ❌ Deshabilitada | Habilita el modo autónomo con el favicon por defecto incluido |
| `debug_measurement_output` | ✅ Habilitada | Habilita la salida de las medidas de depuración de la generación de chunks y ticks |

### Modo autónomo

Cuando se encuentra habilitado, el servidor incluye el favicon por defecto como parte del ejecutable. Esto es útil para distribuir un binario sin ningún otro recurso.

### debug_measurement_output

Imprime información de tiempos detallados para:
- Rendimiento de la generación de chunks
- Mediciones de ticks
- Datos de análisis del rendimiento

## steel-registry

Estas flags controlan el sistema de registros del juego.

| Característica | Por defecto | Descripción |
|---------|---------|-------------|
| `fmt` | ❌ Deshabilitada | Habilita que se aplique el formato |
| `minecraft-src` | ❌ Deshabilitada | Habilita el uso del mapeado del código fuente de Minecraft |

## Características combinadas

Puedes combinar múltiples características:

```bash
# Compilado con varias características
cargo build --features "deadlock_detection,debug_measurement_output"

# Compilado para la distribución autonoma
cargo build --release --features stand-alone
```

## Recomendaciones de cara a producción

Para servidores estables recomendamos:

- **Mantener `mimalloc` activado** - Provee mejoras significativas en el alojamiento de memoria
- **Deshabilitar `deadlock_detection`** - Solo es necesitado para depuración
- **Deshabilitar `dhat-heap`** - Solo necesario para la depuración de la memoria
- **Considera `stand-alone`** - Si lo quieres tener todo en un solo ejecutable
