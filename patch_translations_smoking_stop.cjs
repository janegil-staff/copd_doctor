// patch_translations_smoking_stop.cjs
// Adds sSmokingStop ("Stopped") translation to all 12 locale files.
// Idempotent.
//
// Run from project root:
//   node patch_translations_smoking_stop.cjs

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "locales");
const LANGS = [
  "no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt",
];

const TRANSLATIONS = {
  no: "Sluttet",
  en: "Stopped",
  nl: "Gestopt",
  fr: "Arrêté",
  de: "Aufgehört",
  it: "Smesso",
  sv: "Slutade",
  da: "Stoppet",
  fi: "Lopetti",
  es: "Dejó",
  pl: "Rzucił",
  pt: "Parou",
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

  if (json.sSmokingStop !== undefined) {
    console.log(`  ${lang}.json — already has key, skipped`);
    totalSkipped++;
    continue;
  }

  json.sSmokingStop = TRANSLATIONS[lang];
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang}.json — added sSmokingStop`);
  totalAdded++;
}

console.log(`\nDone: ${totalAdded} file(s) updated, ${totalSkipped} already current.`);
