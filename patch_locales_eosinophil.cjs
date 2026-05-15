#!/usr/bin/env node
/**
 * Idempotent patch — ensures every src/locales/<lang>.json contains the
 * `sEosinophil` translation key used by the Eosinophils divider.
 *
 * Only inserts missing keys — does NOT overwrite existing values, so any
 * manual translations you've already polished are preserved.
 *
 * Run from project root:
 *   node patch_locales_eosinophil.cjs
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "locales");

const VALUES = {
  no: "Eosinofiler",
  en: "Eosinophils",
  nl: "Eosinofielen",
  fr: "Éosinophiles",
  de: "Eosinophile",
  it: "Eosinofili",
  sv: "Eosinofiler",
  da: "Eosinofiler",
  fi: "Eosinofiilit",
  es: "Eosinófilos",
  pl: "Eozynofile",
  pt: "Eosinófilos",
};

if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`✗ Could not find ${LOCALES_DIR}`);
  process.exit(1);
}

let touched = 0;
let langsProcessed = 0;
const langsSkipped = [];

for (const lang of Object.keys(VALUES)) {
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

  if ("sEosinophil" in json) continue; // never overwrite

  json.sEosinophil = VALUES[lang];
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
  touched++;
  console.log(`  ✓ ${lang}.json — sEosinophil: "${VALUES[lang]}"`);
}

if (langsSkipped.length) {
  console.warn(`  · Skipped (file not found): ${langsSkipped.join(", ")}`);
}

console.log(
  touched === 0
    ? `✓ All ${langsProcessed} locale files already have sEosinophil.`
    : `✓ Updated ${touched} of ${langsProcessed} locale files.`,
);
