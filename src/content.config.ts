import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  blog: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
    schema: ({ image }) => z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default("Steel Team"),
      category: z.string().default("News"),
      featured: z.boolean().default(false),
      placeholder: z.boolean().default(false),
      socialImage: z.object({
        src: image(),
        alt: z.string().min(1),
      }).optional(),
    }),
  }),
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
