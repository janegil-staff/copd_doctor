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

// Extra keys needed for the exacerbation calendar section
const EXTRA_KEYS = {
  pdfExacerbationsPast12: {
    no: "Eksaserbasjoner siste 12 måneder",
    en: "Exacerbations past 12 months",
    nl: "Exacerbaties afgelopen 12 maanden",
    fr: "Exacerbations au cours des 12 derniers mois",
    de: "Exazerbationen der letzten 12 Monate",
    it: "Riacutizzazioni negli ultimi 12 mesi",
    sv: "Exacerbationer de senaste 12 månaderna",
    da: "Eksacerbationer de seneste 12 måneder",
    fi: "Pahenemisvaiheet viimeisen 12 kuukauden aikana",
    es: "Exacerbaciones en los últimos 12 meses",
    pl: "Zaostrzenia w ciągu ostatnich 12 miesięcy",
    pt: "Exacerbações nos últimos 12 meses",
  },
  pdfExacModerate: {
    no: "Moderat eksaserbasjon",
    en: "Moderate exacerbation",
    nl: "Matige exacerbatie",
    fr: "Exacerbation modérée",
    de: "Moderate Exazerbation",
    it: "Riacutizzazione moderata",
    sv: "Måttlig exacerbation",
    da: "Moderat eksacerbation",
    fi: "Kohtalainen paheneminen",
    es: "Exacerbación moderada",
    pl: "Umiarkowane zaostrzenie",
    pt: "Exacerbação moderada",
  },
  pdfExacSerious: {
    no: "Alvorlig eksaserbasjon (sykehusinnleggelse)",
    en: "Serious exacerbation (hospitalization)",
    nl: "Ernstige exacerbatie (ziekenhuisopname)",
    fr: "Exacerbation sévère (hospitalisation)",
    de: "Schwere Exazerbation (Krankenhausaufnahme)",
    it: "Riacutizzazione grave (ospedalizzazione)",
    sv: "Allvarlig exacerbation (sjukhusvistelse)",
    da: "Alvorlig eksacerbation (indlæggelse)",
    fi: "Vakava paheneminen (sairaalahoito)",
    es: "Exacerbación grave (hospitalización)",
    pl: "Poważne zaostrzenie (hospitalizacja)",
    pt: "Exacerbação grave (hospitalização)",
  },
  pdfHospitalization: {
    no: "sykehusinnleggelse",
    en: "hospitalization",
    nl: "ziekenhuisopname",
    fr: "hospitalisation",
    de: "Krankenhausaufnahme",
    it: "ospedalizzazione",
    sv: "sjukhusvistelse",
    da: "indlæggelse",
    fi: "sairaalahoito",
    es: "hospitalización",
    pl: "hospitalizacja",
    pt: "hospitalização",
  },
  pdfAsthmaStatus: {
    no: "Astmastatus",
    en: "Asthma status",
    nl: "Astmastatus",
    fr: "Statut asthme",
    de: "Asthmastatus",
    it: "Stato asma",
    sv: "Astmastatus",
    da: "Astmastatus",
    fi: "Astmatila",
    es: "Estado del asma",
    pl: "Status astmy",
    pt: "Estado da asma",
  },
  pdfAsthmaDiagnosed: {
    no: "Diagnostisert med astma av lege",
    en: "Diagnosed with asthma by a doctor",
    nl: "Gediagnosticeerd met astma door een arts",
    fr: "Diagnostiqué asthmatique par un médecin",
    de: "Vom Arzt mit Asthma diagnostiziert",
    it: "Diagnosticato asmatico da un medico",
    sv: "Diagnostiserad med astma av läkare",
    da: "Diagnosticeret med astma af læge",
    fi: "Lääkärin diagnosoima astma",
    es: "Diagnosticado con asma por un médico",
    pl: "Zdiagnozowana astma przez lekarza",
    pt: "Diagnosticado com asma por um médico",
  },
  pdfAsthmaNotDiagnosed: {
    no: "Ikke diagnostisert med astma",
    en: "Not diagnosed with asthma",
    nl: "Niet gediagnosticeerd met astma",
    fr: "Non diagnostiqué asthmatique",
    de: "Kein Asthma diagnostiziert",
    it: "Non diagnosticato asmatico",
    sv: "Inte diagnostiserad med astma",
    da: "Ikke diagnosticeret med astma",
    fi: "Ei diagnosoitua astmaa",
    es: "No diagnosticado con asma",
    pl: "Brak diagnozy astmy",
    pt: "Sem diagnóstico de asma",
  },
  pdfVapingStatus: {
    no: "Dampestatus",
    en: "Vaping status",
    nl: "Dampstatus",
    fr: "Statut vapotage",
    de: "Dampferstatus",
    it: "Stato svapo",
    sv: "Dampningsstatus",
    da: "Dampestatus",
    fi: "Höyrytystila",
    es: "Estado del vapeo",
    pl: "Status vapowania",
    pt: "Estado do vaporizador",
  },
  pdfNonVaper: {
    no: "Aldri dampet",
    en: "Non-vaper",
    nl: "Niet-damper",
    fr: "Non-vapoteur",
    de: "Nicht-Dampfer",
    it: "Non svapatore",
    sv: "Aldrig dampat",
    da: "Aldrig dampet",
    fi: "Ei höyryttele",
    es: "No vapea",
    pl: "Nie wapuje",
    pt: "Não vaporiza",
  },
  pdfExVaper: {
    no: "Tidligere dampet",
    en: "Ex-vaper",
    nl: "Ex-damper",
    fr: "Ex-vapoteur",
    de: "Ex-Dampfer",
    it: "Ex svapatore",
    sv: "Tidigare dampat",
    da: "Tidligere dampet",
    fi: "Entinen höyryttelijä",
    es: "Ex-vapeador",
    pl: "Były vaper",
    pt: "Ex-vaporizador",
  },
  pdfCurrentVaper: {
    no: "Damper nå",
    en: "Current vaper",
    nl: "Huidige damper",
    fr: "Vapoteur actuel",
    de: "Aktiver Dampfer",
    it: "Svapatore attuale",
    sv: "Dampar nu",
    da: "Damper nu",
    fi: "Höyryttää tällä hetkellä",
    es: "Vapeador actual",
    pl: "Aktualny vaper",
    pt: "Vaporizador atual",
  },
  pdfHospitalizations: {
    no: "sykehusinnleggelser",
    en: "hospitalizations",
    nl: "ziekenhuisopnames",
    fr: "hospitalisations",
    de: "Krankenhausaufnahmen",
    it: "ospedalizzazioni",
    sv: "sjukhusvistelser",
    da: "indlæggelser",
    fi: "sairaalahoidot",
    es: "hospitalizaciones",
    pl: "hospitalizacje",
    pt: "hospitalizações",
  },
};

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

// Apply extra keys to all language files
for (const [key, langMap] of Object.entries(EXTRA_KEYS)) {
  for (const [lang, value] of Object.entries(langMap)) {
    const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
    if (!fs.existsSync(filePath)) continue;
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    data[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
}
console.log(`Added extra exacerbation keys to all language files.`);

console.log(`\nDone. Updated ${updated} files.`);