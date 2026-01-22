import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://steel-foundation.github.io/SteelDocs/",
  base: "/SteelDocs/",
  integrations: [
    starlight({
      favicon: "favicon.png",
      title: "Steel",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Steel-Foundation/SteelMC",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Configuration", slug: "getting-started/configuration" },
            { label: "Running the Server", slug: "getting-started/running" },
          ],
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Steel-Foundation/SteelDocs/edit/main/",
      },
      lastUpdated: true,
    }),
  ],
});
