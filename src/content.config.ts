import { defineCollection } from "astro:content";
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema({
      extend: z.object({
        langFlag: z.string().optional(),
        langName: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        devWarningText: z.string().optional(),
        discordLabel: z.string().optional(),
        githubLabel: z.string().optional(),
        download: z.string().optional(),
        githubHref: z.string().optional(),
      }),
  }) }),
};
