#!/usr/bin/env node
/**
 * patch-show-more-translations.cjs
 *
 * Idempotently adds `sShowMore` and `sShowLess` to all 12 supported
 * language files used by the COPD doctor dashboard.
 *
 * Usage:
 *   node patch-show-more-translations.cjs
 *
 * Looks for translation files at:
 *   src/app/messages/<lang>.json
 *
 * If your project uses a different path, edit MESSAGES_DIR below.
 */

const fs = require("fs");
const path = require("path");

// Adjust if your project uses a different messages directory.
const MESSAGES_DIR = path.join(
  process.cwd(),
  "src",
  "locales",
);

const TRANSLATIONS = {
  no: { sShowMore: "Vis mer",       sShowLess: "Vis mindre"      },
  en: { sShowMore: "Show more",     sShowLess: "Show less"        },
  nl: { sShowMore: "Meer tonen",    sShowLess: "Minder tonen"     },
  fr: { sShowMore: "Afficher plus", sShowLess: "Afficher moins"   },
  de: { sShowMore: "Mehr anzeigen", sShowLess: "Weniger anzeigen" },
  it: { sShowMore: "Mostra di più", sShowLess: "Mostra di meno"   },
  sv: { sShowMore: "Visa mer",      sShowLess: "Visa mindre"      },
  da: { sShowMore: "Vis mere",      sShowLess: "Vis mindre"       },
  fi: { sShowMore: "Näytä lisää",   sShowLess: "Näytä vähemmän"   },
  es: { sShowMore: "Mostrar más",   sShowLess: "Mostrar menos"    },
  pl: { sShowMore: "Pokaż więcej",  sShowLess: "Pokaż mniej"      },
  pt: { sShowMore: "Mostrar mais",  sShowLess: "Mostrar menos"    },
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
      // Preserve existing translation if it differs (someone customized it).
      // Comment out the `continue` below if you want to overwrite.
      continue;
      // json[key] = value;
      // updated++;
    }
  }

  if (added === 0 && updated === 0) {
    console.log(`·  ${langCode}: already up to date`);
    return { added, updated };
  }

  // Preserve trailing newline if file had one.
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
