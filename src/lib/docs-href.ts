import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";

let docIds: Set<string> | null = null;

async function loadDocIds(): Promise<Set<string>> {
  if (!docIds) {
    const docs = await getCollection("docs");
    docIds = new Set(docs.map((entry) => entry.id.replace(/\.mdx?$/, "")));
  }
  return docIds;
}

/**
 * Builds a link to a docs page for the given locale, falling back to the
 * default (English) version when the page has not been translated yet.
 *
 * @param slug Docs slug without locale prefix, e.g. "getting-started/installation".
 * @param locale Current locale code, e.g. "en", "es" or "de".
 */
export async function getDocHref(slug: string, locale: string): Promise<string> {
  const ids = await loadDocIds();
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  const translatedId = locale === "en" ? normalized : `${locale}/${normalized}`;
  const targetLocale = ids.has(translatedId) ? locale : "en";
  return getRelativeLocaleUrl(targetLocale, `/${normalized}/`);
}
