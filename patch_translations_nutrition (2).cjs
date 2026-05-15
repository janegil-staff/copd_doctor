#!/usr/bin/env node
/**
 * Idempotent patch — updates `nutritionLabels` across all 12 supported
 * languages so the array has 7 entries:
 *
 *   index 0: ""               (unused / blank)
 *   index 1: "Poor"           — kept as-is from existing translations
 *   index 2: "Fair"           — kept as-is
 *   index 3: "OK"             — kept as-is
 *   index 4: "Good"           — kept as-is
 *   index 5: "Yes"            — was "Excellent", now relabeled
 *   index 6: "Unsure"         — new, "don't know" answer
 *
 * Run from project root:
 *   node patch_translations_nutrition.cjs
 *
 * Auto-detects whether translations live in:
 *   • src/app/messages/<lang>.json   (next-intl style)
 *   • src/translations.js / src/i18n/translations.js  (single-file CJS/ESM)
 *
 * Pass --path=<file> to override.
 */

const fs = require("fs");
const path = require("path");

const LANGS = [
  "no",
  "en",
  "nl",
  "fr",
  "de",
  "it",
  "sv",
  "da",
  "fi",
  "es",
  "pl",
  "pt",
];

// index 1..6 — index 0 is filled with "" by the patch.
const NUTRITION_LABELS = {
  no: ["Dårlig", "Mindre bra", "Grei", "Bra", "Ja", "Usikker"],
  en: ["Poor", "Fair", "OK", "Good", "Yes", "Unsure"],
  nl: ["Slecht", "Matig", "Redelijk", "Goed", "Ja", "Niet zeker"],
  fr: ["Mauvais", "Médiocre", "Correct", "Bon", "Oui", "Pas sûr"],
  de: ["Schlecht", "Mäßig", "In Ordnung", "Gut", "Ja", "Unsicher"],
  it: ["Scarsa", "Mediocre", "Discreta", "Buona", "Sì", "Non so"],
  sv: ["Dålig", "Mindre bra", "Okej", "Bra", "Ja", "Osäker"],
  da: ["Dårlig", "Mindre god", "OK", "God", "Ja", "Usikker"],
  fi: ["Huono", "Välttävä", "Kohtalainen", "Hyvä", "Kyllä", "En osaa sanoa"],
  es: ["Mala", "Regular", "Aceptable", "Buena", "Sí", "No estoy seguro"],
  pl: ["Słaba", "Przeciętna", "Dobra", "Bardzo dobra", "Tak", "Nie wiem"],
  pt: ["Má", "Regular", "Razoável", "Boa", "Sim", "Não tenho a certeza"],
};

// ─── Path detection ────────────────────────────────────────────────────────
const argPath = process.argv
  .find((a) => a.startsWith("--path="))
  ?.split("=")[1];

function candidatePaths() {
  if (argPath) return [argPath];
  const out = [];
  // next-intl style — one file per language
  for (const dir of [
    path.join("src", "app", "messages"),
    path.join("messages"),
    path.join("src", "messages"),
  ]) {
    if (fs.existsSync(dir)) {
      out.push({ kind: "json-per-lang", dir });
      break;
    }
  }
  // Single-file translations.js
  for (const f of [
    path.join("src", "translations.js"),
    path.join("src", "i18n", "translations.js"),
    "translations.js",
  ]) {
    if (fs.existsSync(f)) out.push({ kind: "single-file", file: f });
  }
  return out;
}

const targets = candidatePaths();
if (targets.length === 0) {
  console.error(
    "✗ Could not find a translations folder or single translations.js file.\n" +
      "  Pass --path=<folder-or-file> to override.",
  );
  process.exit(1);
}

let touched = 0;

for (const t of targets) {
  if (t.kind === "json-per-lang") {
    patchJsonPerLang(t.dir);
  } else if (t.kind === "single-file") {
    patchSingleFile(t.file);
  }
}

console.log(
  touched === 0
    ? "✓ All translations already up to date — no changes."
    : `✓ Patched nutritionLabels in ${touched} language file(s).`,
);

// ─── Strategy A: one JSON file per language ────────────────────────────────
function patchJsonPerLang(dir) {
  for (const lang of LANGS) {
    const file = path.join(dir, `${lang}.json`);
    if (!fs.existsSync(file)) {
      console.warn(`  · ${lang}.json not found, skipping`);
      continue;
    }
    const raw = fs.readFileSync(file, "utf8");
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error(`✗ Failed to parse ${file}: ${e.message}`);
      continue;
    }
    const desired = ["", ...NUTRITION_LABELS[lang]];
    const existing = json.nutritionLabels;
    if (
      Array.isArray(existing) &&
      existing.length === desired.length &&
      existing.every((v, i) => v === desired[i])
    ) {
      continue; // already correct
    }
    json.nutritionLabels = desired;
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
    touched++;
    console.log(`  ✓ ${file}`);
  }
}

// ─── Strategy B: single translations.js file ───────────────────────────────
function patchSingleFile(file) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const lang of LANGS) {
    const desired =
      '["", "' + NUTRITION_LABELS[lang].join('", "') + '"]';

    // Match nutritionLabels: [ ... ] within the lang's object.
    // We use a brace-counting search to find the lang's object body,
    // then replace nutritionLabels inside it (or insert if missing).
    const langKeyRe = new RegExp(
      `(^|[\\s,{])${lang}\\s*:\\s*\\{`,
      "m",
    );
    const m = langKeyRe.exec(src);
    if (!m) {
      console.warn(`  · ${lang}: object not found in ${file}, skipping`);
      continue;
    }
    const objStart = m.index + m[0].length - 1; // points at the `{`
    let depth = 0;
    let i = objStart;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) {
      console.warn(`  · ${lang}: unbalanced braces, skipping`);
      continue;
    }
    const objBody = src.slice(objStart + 1, i);

    const labelRe = /nutritionLabels\s*:\s*\[[^\]]*\]/;
    let newBody;
    if (labelRe.test(objBody)) {
      newBody = objBody.replace(
        labelRe,
        `nutritionLabels: ${desired}`,
      );
    } else {
      // Insert at the end of the object body.
      const trailing = objBody.match(/\s*$/)[0];
      const trimmed = objBody.slice(0, objBody.length - trailing.length);
      const sep = trimmed.endsWith(",") || trimmed === "" ? "" : ",";
      newBody = `${trimmed}${sep}\n  nutritionLabels: ${desired},${trailing}`;
    }

    if (newBody !== objBody) {
      src = src.slice(0, objStart + 1) + newBody + src.slice(i);
      changed = true;
      touched++;
      console.log(`  ✓ ${lang} (${file})`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, src, "utf8");
  }
}
