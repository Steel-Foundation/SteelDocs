---
title: Cómo decompilar Minecraft
description: Cómo decompilar el juego para usarlo como referencia.
---

Antes de la 1.21.11, el código se encontraba obfuscado, por lo que los mapeos eran necesarios, pero SteelMC trabaja solo con versiones superiores a esta, por lo que esta documentación solo te ayudará con dichas versiones.

## Requisitos

> Los comandos descritos abajo son para las versiones 1.21.11 y 26.1 snapshot 3, pero puedes usarlos en cualquier versión posterior.

Usando el lanzador del juego de tu preferencia, inicia una instancia de la versión que desees decompilar para que el `.jar` se te descargue. El lugar donde será descargado depende de tu sistema operativo y lanzador; una vez lo tengas, puedes proceder.

## Existen varias maneras

- Usando `update-minecraft-src.sh`, nuestro script de decompilado incluido en el repositorio (detrás de escenas usa `gitcraft` al igual que la tercera opción)

- Usando una version decompilada online, de esa forma puedes enviar enlaces a archivos a otras personas. El sitio es: [mcsrc.dev](https://mcsrc.dev) que tambien puedes usarlo como [https://mcsrc.dev/#1/1.21.11_unobfuscated]

- Clonando [gitcraft](https://github.com/WinPlay02/GitCraft), y ejecutando en la terminal
  `./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"`.\
   Esto creará la carpeta
  `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` con todo el código fuente.

- Descargando [vinflower.jar](https://github.com/Vineflower/vineflower/releases), y ejecutando en la terminal
  ``java -jar vineflower-1.11.2.jar ./minecraft-26.1-snapshot-3-client.jar --folder minecraft_26.1``.\
  Esto creará la carpeta `minecraft_26.1` con todo el código fuente.

## Recursos adicionales
- En YouTube puedes encontrar tutoriales útiles que te mostrarán cómo decompilar el juego