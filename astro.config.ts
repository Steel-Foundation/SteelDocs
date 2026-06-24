import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://steelmc.dev/",
  base: "/",
  output: "static",

  integrations: [
    starlight({
      customCss: ["./src/styles/global.css"],
      favicon: "/favicon.png",
      title: {
        en: "Steel-Docs",
        de: "Steel-Doku",
        es: "Documentacion de Steel",
        ru: "Steel-Документация",
      },
      social: [
        {
          icon: "discord",
          label: "Discord",
          href: "/discord",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Steel-Foundation/SteelMC",
        },
      ],
      sidebar: [
        {
          label: "Getting started",
          translations: {
            es: "Primeros pasos",
            de: "Erste Schritte",
            ru: "Начало работы",
          },
          autogenerate: { directory: "guides/getting-started" },
        },
        {
          label: "Configuration",
          translations: {
            es: "Configuración",
            de: "Konfiguration",
            ru: "Конфигурация",
          },
          autogenerate: { directory: "guides/configuration" },
        },
        {
          label: "Development",
          translations: {
            es: "Desarrollo",
            de: "Entwicklung",
            ru: "Разработка",
          },
          items: [
            "guides/development/decompile-minecraft",
            "guides/development/upgrade-minecraft",
            "guides/development/code-standard",
            "guides/development/block_item_registration",
            "guides/development/registries",
            {
              label: "Blocks",
              translations: {
                es: "Bloques",
                de: "Blöcke",
                ru: "Блоки",
              },
              autogenerate: { directory: "guides/development/blocks" },
            },
            {
              label: "Items",
              translations: {
                es: "Objetos",
                de: "Items",
                ru: "Предметы",
              },
              autogenerate: { directory: "guides/development/items" },
            },
            {
              label: "Network",
              translations: {
                es: "Red",
                de: "Netzwerk",
                ru: "Сеть",
              },
              autogenerate: { directory: "guides/development/network" },
            },
            {
              label: "Tools",
              translations: {
                es: "Herramientas",
                de: "Werkzeuge",
                ru: "Инструменты",
              },
              autogenerate: { directory: "guides/development/tools" },
            },
          ],
        },
        {
          label: "Reference",
          translations: {
            es: "Referencias",
            de: "Referenz",
            ru: "Справочник",
          },
          autogenerate: { directory: "reference" },
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Steel-Foundationedit/main/",
      },
      lastUpdated: true,
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        de: {
          label: "Deutsch",
          lang: "de",
        },
        es: {
          label: "Español",
          lang: "es",
        },
        ru: {
          label: "Русский",
          lang: "ru",
        },
      },
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});