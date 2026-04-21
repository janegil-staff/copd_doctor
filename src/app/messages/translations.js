// src/translations/translations.js
// Slim wrapper — loads translations from JSON files.
// Each language lives in its own file alongside this one:
//   src/translations/
//     ├─ translations.js   ← this file
//     ├─ no.json
//     ├─ en.json
//     ├─ da.json
//     ├─ de.json
//     ├─ es.json
//     ├─ fi.json
//     ├─ fr.json
//     ├─ it.json
//     ├─ nl.json
//     ├─ pl.json
//     ├─ pt.json
//     └─ sv.json

import da from "./da.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fi from "./fi.json";
import fr from "./fr.json";
import it from "./it.json";
import nl from "./nl.json";
import no from "./no.json";
import pl from "./pl.json";
import pt from "./pt.json";
import sv from "./sv.json";

export const translations = {
  da, de, en, es, fi, fr, it, nl, no, pl, pt, sv,
};

/**
 * Returns the translation object for a given language,
 * falling back to English if the requested language is missing.
 */
export function getT(lang) {
  return translations[lang] ?? translations.en;
}

// Optional: export the list of supported languages for UI dropdowns, etc.
export const SUPPORTED_LANGUAGES = Object.keys(translations);
