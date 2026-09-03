import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

function i18nStr() { return z.string().optional() }
function i18nObj(shape?: Partial<Record<never, z.core.SomeType>> | undefined) {return z.object(shape).optional()}
function i18nArr(element: z.core.SomeType) {return z.array(element).optional()}

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
        langName: i18nStr(),
        langFlag: i18nStr(),
        githubHref: i18nStr(),

        header: i18nObj({
          searchPlaceholder: i18nStr(),
          devWarningText: i18nStr(),
          discordLabel: i18nStr(),
          githubLabel: i18nStr(),
          blog: i18nStr(),
          download: i18nStr(),
          tracker: i18nStr(),
          trackerLabel: i18nStr(),
        }),

        index: i18nObj({
          pillText: i18nStr(),
          subtitle: i18nStr(),
          mainCtaText: i18nStr(),
          secondCtaText: i18nStr(),
          chooseDocs: i18nObj({
            label: i18nStr(),
            title: i18nStr(),
            description: i18nStr(),
            adminLabel: i18nStr(),
            adminImageAlt: i18nStr(),
            devLabel: i18nStr(),
            devImageAlt: i18nStr(),
          }),
          community: i18nObj({
            heading: i18nStr(),
            headingHighlight: i18nStr(),
            descriptionBold1: i18nStr(),
            descriptionMiddle: i18nStr(),
            descriptionBold2: i18nStr(),
            descriptionAfter: i18nStr(),
          }),
          rotatingPrefix: i18nStr(),
          rotating: i18nArr(i18nStr()),
        }),

        tracker: i18nObj({
          title: i18nStr(),
          titleHighlight: i18nStr(),
          description: i18nStr(),
          note: i18nStr(),
          metaTitle: i18nStr(),
          metaDescription: i18nStr(),
        }),

        download: i18nObj({
          metaDescription: i18nStr(),
          badge: i18nStr(),
          hero: i18nObj({
            title: i18nStr(),
            titleHighlight: i18nStr(),
            subtitle: i18nStr(),
          }),
          latestBadge: i18nStr(),
          latestDescription: i18nStr(),
          choosePlatform: i18nStr(),
          installHint: i18nStr(),
          installHintLink: i18nStr(),
          previousReleases: i18nStr(),
          browseOlder: i18nStr(),
          browseOlderPlural: i18nStr(),
          noReleases: i18nObj({
            title: i18nStr(),
            body: i18nStr(),
          }),
          version: i18nStr(),
          latestVersion: i18nStr(),
          needOlderVersion: i18nStr(),
          viewPreviousVersions: i18nStr(),
          olderVersions: i18nStr(),
          forMinecraft: i18nStr(),
          releasedDate: i18nStr(),
        }),

        blog: i18nObj({
          metaTitle: i18nStr(),
          metaDescription: i18nStr(),
          badge: i18nStr(),
          title: i18nStr(),
          titleHighlight: i18nStr(),
          subtitle: i18nStr(),
          featured: i18nStr(),
          readArticle: i18nStr(),
          latestPosts: i18nStr(),
          allPosts: i18nStr(),
          backToBlog: i18nStr(),
          minRead: i18nStr(),
          placeholder: i18nObj({
            title: i18nStr(),
            body: i18nStr(),
          }),
          footer: i18nStr(),
        }),
      }),
  }) }),
};
