import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://steel-foundation.github.io/SteelDocs/",
  base: "/SteelDocs/",
  integrations: [
    starlight({
      customCss: ["./src/styles/global.css"],
      favicon: "favicon.png",
      title: {
        en: "Steel-Docs",
        de: "Steel-Doku",
        es: "Documentacion de Steel",
      },
      social: [
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/MwChEHnAbh",
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
          },
          autogenerate: { directory: "guides/getting-started" },
        },
        {
          label: "Configuration",
          translations: {
            es: "Configuración",
            de: "Konfiguration",
          },
          autogenerate: { directory: "guides/configuration" },
        },
        {
          label: "Development",
          translations: {
            es: "Desarrollo",
            de: "Entwicklung",
          },
          items: [
            "guides/development/decompile-minecraft",
            {
              label: "Blocks",
              translations: {
                es: "Bloques",
                de: "Blöcke",
              },
              autogenerate: { directory: "guides/development/blocks" },
            },
            {
              label: "Network",
              translations: {
                es: "Red",
                de: "Netzwerk",
              },
              autogenerate: { directory: "guides/development/network" },
            },
          ],
        },
        {
          label: "Reference",
          translations: {
            es: "Referencias",
            de: "Referenz",
          },
          autogenerate: { directory: "reference" },
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Steel-Foundation/SteelDocs/edit/main/",
      },
      lastUpdated: true,
      defaultLocale: "root",
      locales: {
        // English docs in `src/content/docs/`
        root: {
          label: "English",
          lang: "en",
        },
        // Sprich Deutsch, du Hurensohn :O) `src/content/docs/de/`
        de: {
          label: "Deutsch",
          lang: "de",
        },
        // Documentacion en Español en `src/content/docs/es`
        es: {
          label: "Español",
          lang: "es",
        },
      },
    }),
  ],
});
