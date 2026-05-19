// patch_translations_no_medicine.cjs
// Adds weeksWithoutMedicine to all 12 locale files.
// Idempotent.
//
// Run from project root:
//   node patch_translations_no_medicine.cjs

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "locales");
const LANGS = [
  "no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt",
];

const TRANSLATIONS = {
  no: "Uker uten medisin",
  en: "Weeks without medicine",
  nl: "Weken zonder medicatie",
  fr: "Semaines sans médicament",
  de: "Wochen ohne Medikament",
  it: "Settimane senza farmaco",
  sv: "Veckor utan medicin",
  da: "Uger uden medicin",
  fi: "Viikot ilman lääkettä",
  es: "Semanas sin medicamento",
  pl: "Tygodnie bez leków",
  pt: "Semanas sem medicamento",
};

let totalAdded = 0;
let totalSkipped = 0;

for (const lang of LANGS) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.error(`✗ Missing locale file: ${file}`);
    continue;
  }

  const json = JSON.parse(fs.readFileSync(file, "utf8"));

  if (json.weeksWithoutMedicine !== undefined) {
    console.log(`  ${lang}.json — already has key, skipped`);
    totalSkipped++;
    continue;
  }

  json.weeksWithoutMedicine = TRANSLATIONS[lang];
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang}.json — added weeksWithoutMedicine`);
  totalAdded++;
}

console.log(`\nDone: ${totalAdded} file(s) updated, ${totalSkipped} already current.`);
