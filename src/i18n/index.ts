import { en } from "./en";
import { vi } from "./vi";

export type Language = "en" | "vi";
export type TranslationKeys = typeof en;

export const translations = {
  en,
  vi,
} as const;

export const defaultLanguage: Language = "en";

/**
 * Simple translation helper
 * In a production app, you would use a proper i18n library like react-i18next
 */
export function t(
  key: string,
  language: Language = defaultLanguage,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: unknown = translations[language];

  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }

  if (typeof value !== "string") {
    // Fallback to English if translation missing
    value = translations.en;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
  }

  if (typeof value !== "string") {
    return key; // Return key if translation not found
  }

  // Simple parameter replacement
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_match: string, paramKey: string) => {
      return params[paramKey]?.toString() || _match;
    });
  }

  return value as string;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): Language[] {
  return Object.keys(translations) as Language[];
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(language: string): language is Language {
  return language in translations;
}
