import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function is_rtl(locale: string | undefined): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'dv', 'ha', 'khw', 'ks', 'ps', 'yi', 'ug', 'ku', 'sd', 'syr'];
  return locale != undefined && rtlLocales.includes(locale);
}

export function t(Astro: any, key: string): string  {
  return Astro.locals.t(key as unknown as TemplateStringsArray)
}
export function tArr(Astro: any, key: string): string[] {
  return Astro.locals.t(key as unknown as TemplateStringsArray, {returnObjects: true}) as unknown as string[]
}

function deepMergeDefined<T>(base: T, override: any): T {
  if (override === undefined || override === null) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return override as T;
  }
  if (typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  const result: Record<string, any> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v !== undefined) {
      result[k] = k in result ? deepMergeDefined(result[k], v) : v;
    }
  }
  return result as T;
}

export function tObj<T = Record<string, any>>(Astro: any, key: string): T {
  const fallback = Astro.locals.t(key as unknown as TemplateStringsArray, {
    returnObjects: true,
    lng: "en",
  }) as unknown as T;
  const localized = Astro.locals.t(key as unknown as TemplateStringsArray, {
    returnObjects: true,
  }) as unknown as T;
  return deepMergeDefined(fallback, localized);
}
