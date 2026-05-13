#!/usr/bin/env node
/**
 * patch-weightloss-translations.cjs
 *
 * Idempotently adds the weight-loss (vektnedgang) sidebar translation keys
 * to all 12 supported language files used by the COPD doctor dashboard.
 *
 * Keys added:
 *   sWeightLoss          — Section header: "Vektnedgang" / "Weight loss"
 *   sWeightLossNo        — Value 1: "Nei" / "No"
 *   sWeightLossUnsure    — Value 2: "Usikker" / "Unsure"
 *   sWeightLossYes       — Values 3 & 4: "Ja" / "Yes"
 *   sWeightLossYesUnsure — Value 5: "Ja, men usikker" / "Yes, but unsure"
 *
 * Usage:
 *   node patch-weightloss-translations.cjs
 *
 * Looks for translation files at:
 *   src/app/messages/<lang>.json
 *
 * If your project uses a different path, edit MESSAGES_DIR below.
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(
  process.cwd(),
  "src",
  "locales"
);

const TRANSLATIONS = {
  no: {
    sWeightLoss:          "Vektnedgang",
    sWeightLossNo:        "Nei",
    sWeightLossUnsure:    "Usikker",
    sWeightLossYes:       "Ja",
    sWeightLossYesUnsure: "Ja, men usikker",
  },
  en: {
    sWeightLoss:          "Weight loss",
    sWeightLossNo:        "No",
    sWeightLossUnsure:    "Unsure",
    sWeightLossYes:       "Yes",
    sWeightLossYesUnsure: "Yes, but unsure",
  },
  nl: {
    sWeightLoss:          "Gewichtsverlies",
    sWeightLossNo:        "Nee",
    sWeightLossUnsure:    "Onzeker",
    sWeightLossYes:       "Ja",
    sWeightLossYesUnsure: "Ja, maar onzeker",
  },
  fr: {
    sWeightLoss:          "Perte de poids",
    sWeightLossNo:        "Non",
    sWeightLossUnsure:    "Incertain",
    sWeightLossYes:       "Oui",
    sWeightLossYesUnsure: "Oui, mais incertain",
  },
  de: {
    sWeightLoss:          "Gewichtsverlust",
    sWeightLossNo:        "Nein",
    sWeightLossUnsure:    "Unsicher",
    sWeightLossYes:       "Ja",
    sWeightLossYesUnsure: "Ja, aber unsicher",
  },
  it: {
    sWeightLoss:          "Perdita di peso",
    sWeightLossNo:        "No",
    sWeightLossUnsure:    "Incerto",
    sWeightLossYes:       "Sì",
    sWeightLossYesUnsure: "Sì, ma incerto",
  },
  sv: {
    sWeightLoss:          "Viktnedgång",
    sWeightLossNo:        "Nej",
    sWeightLossUnsure:    "Osäker",
    sWeightLossYes:       "Ja",
    sWeightLossYesUnsure: "Ja, men osäker",
  },
  da: {
    sWeightLoss:          "Vægttab",
    sWeightLossNo:        "Nej",
    sWeightLossUnsure:    "Usikker",
    sWeightLossYes:       "Ja",
    sWeightLossYesUnsure: "Ja, men usikker",
  },
  fi: {
    sWeightLoss:          "Painonlasku",
    sWeightLossNo:        "Ei",
    sWeightLossUnsure:    "Epävarma",
    sWeightLossYes:       "Kyllä",
    sWeightLossYesUnsure: "Kyllä, mutta epävarma",
  },
  es: {
    sWeightLoss:          "Pérdida de peso",
    sWeightLossNo:        "No",
    sWeightLossUnsure:    "Inseguro",
    sWeightLossYes:       "Sí",
    sWeightLossYesUnsure: "Sí, pero inseguro",
  },
  pl: {
    sWeightLoss:          "Utrata wagi",
    sWeightLossNo:        "Nie",
    sWeightLossUnsure:    "Niepewne",
    sWeightLossYes:       "Tak",
    sWeightLossYesUnsure: "Tak, ale niepewne",
  },
  pt: {
    sWeightLoss:          "Perda de peso",
    sWeightLossNo:        "Não",
    sWeightLossUnsure:    "Incerto",
    sWeightLossYes:       "Sim",
    sWeightLossYesUnsure: "Sim, mas incerto",
  },
};

function patchFile(langCode, values) {
  const filePath = path.join(MESSAGES_DIR, `${langCode}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  ${langCode}.json not found at ${filePath} — skipping`);
    return { added: 0, updated: 0, skipped: true };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error(`✗  ${langCode}.json: invalid JSON — ${err.message}`);
    return { added: 0, updated: 0, error: true };
  }

  let added = 0;
  let updated = 0;
  for (const [key, value] of Object.entries(values)) {
    if (json[key] === undefined) {
      json[key] = value;
      added++;
    } else if (json[key] !== value) {
      // Preserve any existing customized translation. Uncomment to overwrite.
      continue;
      // json[key] = value;
      // updated++;
    }
  }

  if (added === 0 && updated === 0) {
    console.log(`·  ${langCode}: already up to date`);
    return { added, updated };
  }

  const trailingNewline = raw.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(
    filePath,
    JSON.stringify(json, null, 2) + trailingNewline,
    "utf8",
  );
  console.log(`✓  ${langCode}: +${added} added, ${updated} updated`);
  return { added, updated };
}

console.log(`Patching translations in ${MESSAGES_DIR}\n`);

let totalAdded = 0;
let totalUpdated = 0;
let missing = 0;

for (const [lang, values] of Object.entries(TRANSLATIONS)) {
  const result = patchFile(lang, values);
  totalAdded += result.added;
  totalUpdated += result.updated;
  if (result.skipped) missing++;
}

console.log(
  `\nDone. ${totalAdded} keys added, ${totalUpdated} updated, ${missing} files missing.`,
);
