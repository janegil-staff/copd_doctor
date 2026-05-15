#!/usr/bin/env node
/**
 * Idempotent patch — ensures every src/locales/<lang>.json contains the
 * translation keys used by the new Edit button and EditPlaceholderModal:
 *
 *   sEdit                — button label, e.g. "Rediger" / "Edit"
 *   sEditNotImplemented  — modal body, e.g. "Redigering er ikke implementert ennå"
 *   sOk                  — OK button label
 *
 * Only inserts missing keys — does NOT overwrite existing values.
 *
 * Run from project root:
 *   node patch_locales_edit.cjs
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "locales");

const KEYS = {
  no: {
    sEdit: "Rediger",
    sEditNotImplemented: "Redigering er ikke implementert ennå",
    sOk: "OK",
  },
  en: {
    sEdit: "Edit",
    sEditNotImplemented: "Edit not yet implemented",
    sOk: "OK",
  },
  nl: {
    sEdit: "Bewerken",
    sEditNotImplemented: "Bewerken nog niet beschikbaar",
    sOk: "OK",
  },
  fr: {
    sEdit: "Modifier",
    sEditNotImplemented: "Modification pas encore disponible",
    sOk: "OK",
  },
  de: {
    sEdit: "Bearbeiten",
    sEditNotImplemented: "Bearbeiten noch nicht verfügbar",
    sOk: "OK",
  },
  it: {
    sEdit: "Modifica",
    sEditNotImplemented: "Modifica non ancora disponibile",
    sOk: "OK",
  },
  sv: {
    sEdit: "Redigera",
    sEditNotImplemented: "Redigering är ännu inte implementerad",
    sOk: "OK",
  },
  da: {
    sEdit: "Rediger",
    sEditNotImplemented: "Redigering er endnu ikke implementeret",
    sOk: "OK",
  },
  fi: {
    sEdit: "Muokkaa",
    sEditNotImplemented: "Muokkaaminen ei ole vielä käytössä",
    sOk: "OK",
  },
  es: {
    sEdit: "Editar",
    sEditNotImplemented: "Edición aún no implementada",
    sOk: "OK",
  },
  pl: {
    sEdit: "Edytuj",
    sEditNotImplemented: "Edycja nie jest jeszcze dostępna",
    sOk: "OK",
  },
  pt: {
    sEdit: "Editar",
    sEditNotImplemented: "Edição ainda não implementada",
    sOk: "OK",
  },
};

if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`✗ Could not find ${LOCALES_DIR}`);
  process.exit(1);
}

let touched = 0;
let langsProcessed = 0;
const langsSkipped = [];

for (const lang of Object.keys(KEYS)) {
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

  let changed = false;
  const added = [];
  for (const [key, value] of Object.entries(KEYS[lang])) {
    if (!(key in json)) {
      json[key] = value;
      changed = true;
      added.push(key);
    }
  }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
    touched++;
    console.log(`  ✓ ${lang}.json — added: ${added.join(", ")}`);
  }
}

if (langsSkipped.length) {
  console.warn(
    `  · Skipped (file not found): ${langsSkipped.join(", ")}`,
  );
}

console.log(
  touched === 0
    ? `✓ All ${langsProcessed} locale files already have the edit keys.`
    : `✓ Updated ${touched} of ${langsProcessed} locale files.`,
);
