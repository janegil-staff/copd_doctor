#!/usr/bin/env node
/**
 * patch_translations.js
 *
 * Adds stopped-medication keys to all 12 language blocks in src/translations.js.
 * Skips keys that are already present. Safe to run multiple times.
 *
 * Usage:
 *   node patch_translations.js                     # defaults to src/translations.js
 *   node patch_translations.js path/to/translations.js
 */

const fs   = require("fs");
const path = require("path");

const TRANSLATIONS_PATH =
  process.argv[2] ?? path.join(__dirname, "src", "app", "messages", "translations.js");

// ── Keys to add, per language ────────────────────────────────────────────────
const NEW_KEYS = {
  no: {
    stoppedMedications:   "Tidligere brukte medisiner",
    noStoppedMedications: "Ingen sluttede medisiner registrert",
    sideEffects:          "Bivirkninger",
    ineffective:          "Ikke effektiv",
    doctorChange:         "Lege endret medisin",
    cost:                 "For dyrt",
    completedCourse:      "Fullført kur",
    otherReason:          "Annet",
    notSpecified:         "Ikke spesifisert",
    started:              "Startet",
    days:                 "dager",
    dose:                 "Dose",
    timesLogged:          "ganger logget",
  },
  en: {
    stoppedMedications:   "Previously used medications",
    noStoppedMedications: "No stopped medications recorded",
    sideEffects:          "Side effects",
    ineffective:          "Not effective",
    doctorChange:         "Doctor changed medication",
    cost:                 "Too expensive",
    completedCourse:      "Completed course",
    otherReason:          "Other",
    notSpecified:         "Not specified",
    started:              "Started",
    days:                 "days",
    dose:                 "Dose",
    timesLogged:          "times logged",
  },
  nl: {
    stoppedMedications:   "Eerder gebruikte medicijnen",
    noStoppedMedications: "Geen gestopte medicijnen geregistreerd",
    sideEffects:          "Bijwerkingen",
    ineffective:          "Niet effectief",
    doctorChange:         "Arts veranderde medicatie",
    cost:                 "Te duur",
    completedCourse:      "Kuur voltooid",
    otherReason:          "Anders",
    notSpecified:         "Niet gespecificeerd",
    started:              "Gestart",
    days:                 "dagen",
    dose:                 "Dosis",
    timesLogged:          "keer geregistreerd",
  },
  fr: {
    stoppedMedications:   "Médicaments précédemment utilisés",
    noStoppedMedications: "Aucun médicament arrêté enregistré",
    sideEffects:          "Effets secondaires",
    ineffective:          "Inefficace",
    doctorChange:         "Médecin a changé le médicament",
    cost:                 "Trop cher",
    completedCourse:      "Cure terminée",
    otherReason:          "Autre",
    notSpecified:         "Non spécifié",
    started:              "Commencé",
    days:                 "jours",
    dose:                 "Dose",
    timesLogged:          "fois enregistré",
  },
  de: {
    stoppedMedications:   "Zuvor verwendete Medikamente",
    noStoppedMedications: "Keine abgesetzten Medikamente erfasst",
    sideEffects:          "Nebenwirkungen",
    ineffective:          "Nicht wirksam",
    doctorChange:         "Arzt hat Medikament geändert",
    cost:                 "Zu teuer",
    completedCourse:      "Kur abgeschlossen",
    otherReason:          "Sonstiges",
    notSpecified:         "Nicht angegeben",
    started:              "Begonnen",
    days:                 "Tage",
    dose:                 "Dosis",
    timesLogged:          "mal protokolliert",
  },
  it: {
    stoppedMedications:   "Farmaci precedentemente utilizzati",
    noStoppedMedications: "Nessun farmaco interrotto registrato",
    sideEffects:          "Effetti collaterali",
    ineffective:          "Non efficace",
    doctorChange:         "Il medico ha cambiato farmaco",
    cost:                 "Troppo costoso",
    completedCourse:      "Ciclo completato",
    otherReason:          "Altro",
    notSpecified:         "Non specificato",
    started:              "Iniziato",
    days:                 "giorni",
    dose:                 "Dose",
    timesLogged:          "volte registrato",
  },
  sv: {
    stoppedMedications:   "Tidigare använda mediciner",
    noStoppedMedications: "Inga avslutade mediciner registrerade",
    sideEffects:          "Biverkningar",
    ineffective:          "Inte effektiv",
    doctorChange:         "Läkare bytte medicin",
    cost:                 "För dyrt",
    completedCourse:      "Kur avslutad",
    otherReason:          "Annat",
    notSpecified:         "Inte angivet",
    started:              "Påbörjad",
    days:                 "dagar",
    dose:                 "Dos",
    timesLogged:          "gånger loggad",
  },
  da: {
    stoppedMedications:   "Tidligere anvendte medicin",
    noStoppedMedications: "Ingen stoppede medicin registreret",
    sideEffects:          "Bivirkninger",
    ineffective:          "Ikke effektiv",
    doctorChange:         "Lægen ændrede medicin",
    cost:                 "For dyrt",
    completedCourse:      "Kur gennemført",
    otherReason:          "Andet",
    notSpecified:         "Ikke specificeret",
    started:              "Startet",
    days:                 "dage",
    dose:                 "Dosis",
    timesLogged:          "gange logget",
  },
  fi: {
    stoppedMedications:   "Aiemmin käytetyt lääkkeet",
    noStoppedMedications: "Lopetettuja lääkkeitä ei ole rekisteröity",
    sideEffects:          "Sivuvaikutukset",
    ineffective:          "Ei tehokas",
    doctorChange:         "Lääkäri vaihtoi lääkkeen",
    cost:                 "Liian kallis",
    completedCourse:      "Kuuri suoritettu",
    otherReason:          "Muu",
    notSpecified:         "Ei määritelty",
    started:              "Aloitettu",
    days:                 "päivää",
    dose:                 "Annos",
    timesLogged:          "kertaa kirjattu",
  },
  es: {
    stoppedMedications:   "Medicamentos usados anteriormente",
    noStoppedMedications: "No hay medicamentos suspendidos registrados",
    sideEffects:          "Efectos secundarios",
    ineffective:          "No efectivo",
    doctorChange:         "El médico cambió el medicamento",
    cost:                 "Demasiado caro",
    completedCourse:      "Tratamiento completado",
    otherReason:          "Otro",
    notSpecified:         "No especificado",
    started:              "Iniciado",
    days:                 "días",
    dose:                 "Dosis",
    timesLogged:          "veces registrado",
  },
  pl: {
    stoppedMedications:   "Wcześniej stosowane leki",
    noStoppedMedications: "Brak zarejestrowanych odstawionych leków",
    sideEffects:          "Skutki uboczne",
    ineffective:          "Nieskuteczny",
    doctorChange:         "Lekarz zmienił lek",
    cost:                 "Zbyt drogi",
    completedCourse:      "Kuracja zakończona",
    otherReason:          "Inne",
    notSpecified:         "Nie określono",
    started:              "Rozpoczęto",
    days:                 "dni",
    dose:                 "Dawka",
    timesLogged:          "razy zarejestrowano",
  },
  pt: {
    stoppedMedications:   "Medicamentos usados anteriormente",
    noStoppedMedications: "Nenhum medicamento interrompido registado",
    sideEffects:          "Efeitos secundários",
    ineffective:          "Não eficaz",
    doctorChange:         "Médico mudou o medicamento",
    cost:                 "Demasiado caro",
    completedCourse:      "Tratamento concluído",
    otherReason:          "Outro",
    notSpecified:         "Não especificado",
    started:              "Iniciado",
    days:                 "dias",
    dose:                 "Dose",
    timesLogged:          "vezes registado",
  },
};

// ── Patch logic ──────────────────────────────────────────────────────────────
function escapeValue(val) {
  // Escape backslashes and single quotes; preserve literal newlines
  return val.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

function buildInsertBlock(keys) {
  return Object.entries(keys)
    .map(([k, v]) => `    ${k}: '${escapeValue(v)}',`)
    .join("\n");
}

if (!fs.existsSync(TRANSLATIONS_PATH)) {
  console.error(`✗  File not found: ${TRANSLATIONS_PATH}`);
  process.exit(1);
}

let content = fs.readFileSync(TRANSLATIONS_PATH, "utf8");
let injected = 0;
let skipped  = 0;

for (const [lang, keys] of Object.entries(NEW_KEYS)) {
  // Find the opening of this language block: "  en: {" or "  en:{"
  const langRegex = new RegExp(`(\\n  ${lang}:\\s*\\{)`);
  const match = langRegex.exec(content);
  if (!match) {
    console.warn(`⚠️  Language block '${lang}' not found — skipping`);
    continue;
  }

  // Find the matching closing brace for this language block
  const blockStart = match.index;
  let depth = 0, blockEnd = -1, inBlock = false;
  for (let i = blockStart; i < content.length; i++) {
    if (content[i] === "{") { depth++; inBlock = true; }
    else if (content[i] === "}") {
      depth--;
      if (inBlock && depth === 0) { blockEnd = i; break; }
    }
  }
  if (blockEnd === -1) {
    console.warn(`⚠️  Could not find closing brace for '${lang}' — skipping`);
    continue;
  }

  const blockContent = content.slice(blockStart, blockEnd);

  // Filter out keys that already exist in this block
  const newKeys = Object.fromEntries(
    Object.entries(keys).filter(([k]) => {
      const exists = new RegExp(`\\b${k}\\s*:`).test(blockContent);
      if (exists) skipped++;
      return !exists;
    })
  );

  if (Object.keys(newKeys).length === 0) {
    console.log(`✓  ${lang}: all keys already present`);
    continue;
  }

  const insertBlock = "\n" + buildInsertBlock(newKeys);
  // Insert just before the closing brace of this language block
  content =
    content.slice(0, blockEnd) +
    insertBlock +
    "\n  " +
    content.slice(blockEnd);
  injected += Object.keys(newKeys).length;
  console.log(`✓  ${lang}: added ${Object.keys(newKeys).length} keys`);
}

fs.writeFileSync(TRANSLATIONS_PATH, content, "utf8");
console.log(`\nDone — ${injected} keys injected, ${skipped} already existed.`);
