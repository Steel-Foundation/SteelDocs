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
