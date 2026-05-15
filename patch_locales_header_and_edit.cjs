#!/usr/bin/env node
/**
 * Idempotent patch — two updates:
 *
 *   1. Norwegian `sEdit` capitalized: "editer" → "Editer"
 *   2. `patientInformation` header rewritten across all 12 locales
 *      to mean "Self-registered data" (Norwegian: "Egen registrerte data"),
 *      replacing the older "Patient Information" wording.
 *
 * This patch DOES overwrite the existing `patientInformation` value because
 * the meaning has changed (Patient Info → Self-registered data). The Sidebar
 * code keeps using `t.patientInformation`, so no JSX changes are needed.
 *
 * Run from project root:
 *   node patch_locales_header_and_edit.cjs
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "locales");

const HEADER = {
  no: "Egen registrerte data",
  en: "Self-registered data",
  nl: "Zelf geregistreerde gegevens",
  fr: "Données auto-enregistrées",
  de: "Selbst erfasste Daten",
  it: "Dati auto-registrati",
  sv: "Egenregistrerade data",
  da: "Egenregistrerede data",
  fi: "Itse rekisteröidyt tiedot",
  es: "Datos autoregistrados",
  pl: "Dane zarejestrowane samodzielnie",
  pt: "Dados auto-registados",
};

const NEW_NO_EDIT = "Editer";

if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`✗ Could not find ${LOCALES_DIR}`);
  process.exit(1);
}

let touched = 0;
let langsProcessed = 0;
const langsSkipped = [];

for (const lang of Object.keys(HEADER)) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    langsSkipped.push(lang);
    continue;
  }
  langsProcessed++;

  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`✗ Failed to parse ${file}: ${e.message}`);
    continue;
  }

  const changes = [];

  // 1. patientInformation — always overwrite
  if (json.patientInformation !== HEADER[lang]) {
    const prev = json.patientInformation ?? "(missing)";
    json.patientInformation = HEADER[lang];
    changes.push(`patientInformation: "${prev}" → "${HEADER[lang]}"`);
  }

  // 2. Norwegian sEdit capitalization
  if (lang === "no" && json.sEdit !== NEW_NO_EDIT) {
    const prev = json.sEdit ?? "(missing)";
    json.sEdit = NEW_NO_EDIT;
    changes.push(`sEdit: "${prev}" → "${NEW_NO_EDIT}"`);
  }

  if (changes.length > 0) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
    touched++;
    console.log(`  ✓ ${lang}.json`);
    for (const c of changes) console.log(`      · ${c}`);
  }
}

if (langsSkipped.length) {
  console.warn(`  · Skipped (file not found): ${langsSkipped.join(", ")}`);
}

console.log(
  touched === 0
    ? `✓ All ${langsProcessed} locale files already up to date.`
    : `✓ Updated ${touched} of ${langsProcessed} locale files.`,
);
