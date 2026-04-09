#!/usr/bin/env node
/**
 * patch_translations.js
 * Adds pdfSymptomsPast12 key to all 12 language JSON files.
 * Also removes old pdfExacerbationsPast12 key if present.
 *
 * Usage: node patch_translations.js [messages_dir]
 * Default messages_dir: src/app/messages
 */

const fs   = require("fs");
const path = require("path");

const MESSAGES_DIR = process.argv[2] ?? path.join(__dirname, "src", "app", "messages");

const NEW_KEY = "pdfSymptomsPast12";
const OLD_KEY = "pdfExacerbationsPast12";

const VALUES = {
  no: "Symptomer siste 12 måneder",
  en: "Symptoms last 12 months",
  nl: "Symptomen afgelopen 12 maanden",
  fr: "Symptômes au cours des 12 derniers mois",
  de: "Symptome der letzten 12 Monate",
  it: "Sintomi negli ultimi 12 mesi",
  sv: "Symtom de senaste 12 månaderna",
  da: "Symptomer de seneste 12 måneder",
  fi: "Oireet viimeisen 12 kuukauden aikana",
  es: "Síntomas en los últimos 12 meses",
  pl: "Objawy w ciągu ostatnich 12 miesięcy",
  pt: "Sintomas nos últimos 12 meses",
};

let updated = 0;

for (const [lang, value] of Object.entries(VALUES)) {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Not found: ${filePath} — skipping`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Add new key
  data[NEW_KEY] = value;

  // Remove old key if it exists
  if (OLD_KEY in data) {
    delete data[OLD_KEY];
    console.log(`  removed old key "${OLD_KEY}" from ${lang}.json`);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`✓  ${lang}.json  →  "${value}"`);
  updated++;
}

console.log(`\nDone. Updated ${updated} files.`);
