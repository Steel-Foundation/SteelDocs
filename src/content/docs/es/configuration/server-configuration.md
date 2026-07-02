---
title: Configuración del servidor
description: Referencia completa de todas las configuraciones del servidor en SteelMC.
sidebar:
  order: 2
---

SteelMC es configurable a través de un archivo JSON5 localizado en `config/steel_config.json5`. Esta página documenta todas las opciones disponibles.

## Ajustes básicos

| Opción | Tipo | Por defecto | Descripción |
|--------|------|---------|-------------|
| `server_port` | u16 | `25565` | Puerto en el que escucha el servidor (1-65535) |
| `seed` | String | `""` | Semilla de la generación del mundo (en blanco = aleatoria) |
| `max_players` | u32 | `20` | Jugadores máximos permitidos simultáneamente |
| `view_distance` | u8 | `10` | Distancia de renderizado máxima en chunks (1-32) |
| `simulation_distance` | u8 | `10` | Distancia de simulación máxima en chunks (1-32) |
| `motd` | String | `"A Steel Server"` | Mensaje mostrado en la lista de servidores |

## Ajustes de seguridad
 
| Opción | Tipo | Por defecto | Descripción |
|--------|------|---------|-------------|
| `online_mode` | bool | `true` | Habilita la autentificación de Mojang para la verificación de jugadores |
| `encryption` | bool | `true` | Habilita la encriptación para la comunicación entre cliente y servidor |
| `enforce_secure_chat` | bool | `false` | Fuerza el chat seguro (requiere `online_mode` y `encryption`) |

:::caution
Deshabilitar `online_mode` permite que los jugadores sin cuenta oficial se conecten. Desactívalo solo si sabes lo que estás haciendo, o para redes internas y/o desarrollo.
:::

## Ajustes del favicon

:::note
El favicon es la imagen que se les muestra a los jugadores en el menú de servidores.
:::

| Opción | Tipo | Por defecto | Descripción |
|--------|------|---------|-------------|
| `use_favicon` | bool | `true` | Habilita la utilización de un favicon personalizado |
| `favicon` | String | `"config/favicon.png"` | Ruta del archivo favicon (PNG 64x64) |

## Ajustes de compresión

La compresión de la red reduce el uso de ancho de banda a costa de más carga en la CPU.

| Opción | Tipo | Por defecto | Rango válido | Descripción |
|--------|------|---------|-------------|-------------|
| `compression.threshold` | u32 | `256` | ≥256 | Tamaño de paquete mínimo para ser comprimido |
| `compression.level` | u8 | `4` | 1-9 | Nivel de compresión (1 = rápido, 9 = menor tamaño) |

## Enlaces del servidor

Los enlaces del servidor son mostrados en el menú de pausa.

| Opción | Tipo | Por defecto | Descripción |
|--------|------|---------|-------------|
| `server_links.enable` | bool | `true` | Habilita la función de enlaces del servidor |
| `server_links.links` | Array | Info abajo | Lista de enlaces a mostrar |

Lee esta [guía de enlaces del servidor](../server-links) para una configuración más detallada.

## Ejemplo de configuración

```json5
// /config/steel_config.json5
{
  server_port: 25565,
  seed: "my_awesome_seed",
  max_players: 50,
  view_distance: 12,
  simulation_distance: 10,
  online_mode: true,
  encryption: true,
  motd: "Welcome to my Steel server!",
  use_favicon: true,
  favicon: "config/favicon.png",
  enforce_secure_chat: false,
  compression: {
    threshold: 256,
    level: 4
  },
  server_links: {
    enable: true,
    links: [
      {
        label: { text: "Discord" },
        url: "https://discord.gg/example"
      }
    ]
  }
}
```

## Reglas de validación

El servidor valida la configuración en su inicialización:

- `view_distance` debe estar entre 1 y 32
- `simulation_distance` debe estar entre 1 y 32
- `compression.threshold` debe ser 256 o mayor
- `compression.level` debe estar entre 1 y 9
- Si `enforce_secure_chat` está activo, tanto `online_mode` como `encryption` deben estarlo también
