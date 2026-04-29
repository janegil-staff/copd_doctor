// src/translations/index.js
// Single source of truth for translations + language metadata.

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

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
];

/**
 * Returns the translation dictionary for the given language code.
 * Falls back to English; missing keys in a language file resolve from English.
 */
export function getTranslations(lang) {
  const base = translations.en;
  const selected = translations[lang];
  if (!selected || selected === base) return base;
  return { ...base, ...selected };
}

export const getT = getTranslations;

export default getTranslations;