// src/lib/translations.js
// Single source of truth: static imports from /src/locales/*.json
// API stays the same: getTranslations(lang) with English fallback.

import no from "@/locales/no.json";
import en from "@/locales/en.json";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import it from "@/locales/it.json";
import sv from "@/locales/sv.json";
import da from "@/locales/da.json";
import fi from "@/locales/fi.json";
import es from "@/locales/es.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

export const SUPPORTED_LANGUAGES = Object.keys(translations);

/**
 * Returns the translation dictionary for the given language code.
 * Falls back to English for unknown codes, and merges English underneath
 * so any missing keys in a language file still resolve.
 */
export function getTranslations(lang) {
  const base = translations.en;
  const selected = translations[lang];
  if (!selected || selected === base) return base;
  // English as the fallback layer — selected overrides, but missing keys
  // (e.g. a new key not yet translated) still return the English value.
  return { ...base, ...selected };
}

export default getTranslations;
