---
title: Cómo añadir enlaces del servidor
description: Entendimiento básico de los enlaces del servidor y cómo configurarlos.
---

Los enlaces del servidor son mostrados en el menú de pausa del juego; su utilidad es proporcionar enlaces personalizados que el usuario pueda abrir. Un ejemplo de ellos es un enlace a la tienda o web del servidor, etc.

Hay unos cuantos enlaces predeterminados que pueden ser configurados; son más rápidos de configurar, pero carecen de personalización. Alternativamente, es posible usar `TextComponents` para crear enlaces personalizados.

## Habilitar los enlaces del servidor

Lo primero es encontrar y cambiar este valor en tu archivo `steel_config.json5`:

```json5
// /config/steel_config.json5
server_links: {
  // Activa los enlaces de servidor
  enable: true,
},
```

Si deseas desactivarlo, solo tienes que cambiarlo a `false`.

## Enlaces del servidor predeterminados

Existen 10 tipos de enlaces del servidor:

- `bug_report`
- `community_guidelines`
- `support`
- `status`
- `feedback`
- `community`
- `website`
- `forums`
- `news`
- `announcements`

Entre ellos, hay un caso especial, `bug_report`, este también es mostrado cuando el servidor se rompe, hace que el cliente tenga un error o se le envíe información rota.

Este puede ser configurado así:
```json5
// /config/steel_config.json5
server_links: {
  // Activa los enlaces de servidor
  enable: true,
  // Lista de enlaces que mostrar en el menú
  links: [
    // Enlace de tipo predeterminado
    {
      label: "bug_report",
      url: "https://github.com/4lve/SteelMC/issues"
    }
  ]
},
```

## Enlaces del servidor personalizados

Este tipo de enlace se define empleando un `TextComponent`, por lo que son más personalizables que los predeterminados, permitiendo añadir colores y estilos.

Estos son configurados de esta manera:
```json5
// /config/steel_config.json5
{
    label: {
        text: "Visit the SteelMC Discord",
        color: "blue",
        bold: true
    },
    url: "https://discord.gg/suSXXNdVSf"
}
```

### Recursos adicionales

En esta documentación encontrarás más tutoriales sobre `TextComponents` y cómo usarlos correctamente.

<details>
<summary>Ejemplo completo de configuración</summary>

```json5
// /config/steel_config.json5
{
    $schema: "https://raw.githubusercontent.com/4lve/SteelMC/refs/heads/master/package-content/schema.json5",
    // Server port
    server_port: 25565,
    // World seed for generating the world, empty string means random seed
    seed: "",
    // Maximum number of players allowed on the server
    max_players: 20,
    // Maximum view distance in chunks
    view_distance: 10,
    // Maximum simulation distance in chunks
    simulation_distance: 10,
    // Whether to use Mojang's authentication service
    online_mode: true,
    // Whether to enable encryption for client-server communication
    encryption: true,
    // Message of the day displayed in server lists
    motd: "A Steel Server",
    // Whether to use a custom favicon for the server
    use_favicon: true,
    // Path to the favicon file (PNG format, 64x64 pixels)
    favicon: "config/favicon.png",
    // Whether to enforce secure chat
    enforce_secure_chat: false,
    // Compression settings
    compression: {
        threshold: 256,
        level: 4,
    },
    // Server links configuration
    server_links: {
        // Enable server links feature
        enable: true,
        // List of links to display in the server menu
        links: [
            // Built-in link type (simple string label)
            {
                label: "bug_report",
                url: "https://github.com/4lve/SteelMC/issues"
            },
            // Another built-in type
            {
                label: "website",
                url: "https://github.com/4lve/SteelMC"
            },
            // The news channel on discord
            {
                label: "announcements",
                url: "https://discord.com/channels/1428487339759370322/1428487584966774795"
            },
            // Custom TextComponent (object label with formatting)
            {
                label: {
                    text: "Visit the SteelMC Discord",
                    color: "blue",
                    bold: true
                },
                url: "https://discord.gg/suSXXNdVSf"
            }
        ]
    },
}
```
</details>