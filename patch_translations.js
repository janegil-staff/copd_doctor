#!/usr/bin/env node
/**
 * patch_translations.js
 *
 * Adds stopped-medication keys to the 12 language JSON files in
 * src/app/messages (or the directory you pass as the first arg).
 *
 * - Skips keys that already exist (idempotent — safe to re-run)
 * - Preserves existing key order (new keys are appended to the end)
 * - Writes pretty-printed JSON with 2-space indent + trailing newline
 *
 * Usage:
 *   node patch_translations.js                         # default src/app/messages
 *   node patch_translations.js src/app/messages        # custom directory
 *   node patch_translations.js public/locales          # alternate layout
 */

const fs   = require("fs");
const path = require("path");

const MESSAGES_DIR =
  process.argv[2] ?? path.join(__dirname, "src", "app", "messages");

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
    daysLabel:            "dager",
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
    daysLabel:            "days",
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
    daysLabel:            "dagen",
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
    daysLabel:            "jours",
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
    daysLabel:            "Tage",
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
    daysLabel:            "giorni",
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
    daysLabel:            "dagar",
    dose:                 "Dos",
    timesLogged:          "gånger loggad",
  },
  da: {
    stoppedMedications:   "Tidligere anvendt medicin",
    noStoppedMedications: "Ingen stoppede medicin registreret",
    sideEffects:          "Bivirkninger",
    ineffective:          "Ikke effektiv",
    doctorChange:         "Lægen ændrede medicin",
    cost:                 "For dyrt",
    completedCourse:      "Kur gennemført",
    otherReason:          "Andet",
    notSpecified:         "Ikke specificeret",
    started:              "Startet",
    daysLabel:            "dage",
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
    daysLabel:            "päivää",
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
    daysLabel:            "días",
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
    daysLabel:            "dni",
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
    daysLabel:            "dias",
    dose:                 "Dose",
    timesLogged:          "vezes registado",
  },
};

// ── Patch logic ──────────────────────────────────────────────────────────────
if (!fs.existsSync(MESSAGES_DIR)) {
  console.error(`✗  Directory not found: ${MESSAGES_DIR}`);
  console.error(`   Pass the correct path as the first argument, e.g.:`);
  console.error(`   node patch_translations.js src/app/messages`);
  process.exit(1);
}

let totalInjected = 0;
let totalSkipped  = 0;
let filesUpdated  = 0;

for (const [lang, keys] of Object.entries(NEW_KEYS)) {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${lang}.json not found — skipping`);
    continue;
  }

  let data;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`✗  ${lang}.json is not valid JSON — ${err.message}`);
    continue;
  }

  let addedCount   = 0;
  let skippedCount = 0;

  for (const [key, value] of Object.entries(keys)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      skippedCount++;
    } else {
      data[key] = value;
      addedCount++;
    }
  }

  if (addedCount === 0) {
    console.log(`✓  ${lang}.json: all keys already present`);
    totalSkipped += skippedCount;
    continue;
  }

  // Write back with stable 2-space indent + trailing newline
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`✓  ${lang}.json: added ${addedCount} keys${skippedCount ? ` (${skippedCount} already present)` : ""}`);

  totalInjected += addedCount;
  totalSkipped  += skippedCount;
  filesUpdated++;
}

console.log(
  `\nDone — ${totalInjected} keys injected across ${filesUpdated} files, ${totalSkipped} already existed.`
);
