(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/context/LangContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LangProvider",
    ()=>LangProvider,
    "useLang",
    ()=>useLang
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
// src/context/LangContext.js
"use client";
;
const LangContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    lang: "no",
    setLang: ()=>{}
});
function LangProvider({ children }) {
    _s();
    const [lang, setLangState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("no");
    // On mount, restore saved language
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LangProvider.useEffect": ()=>{
            const saved = localStorage.getItem("lang");
            if (saved) setLangState(saved);
        }
    }["LangProvider.useEffect"], []);
    // Persist every time the user changes language
    const setLang = (newLang)=>{
        localStorage.setItem("lang", newLang);
        setLangState(newLang);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LangContext.Provider, {
        value: {
            lang,
            setLang
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/LangContext.js",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(LangProvider, "6OcMZycIH2xA+9brXVOE4yelImo=");
_c = LangProvider;
function useLang() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LangContext);
}
_s1(useLang, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "LangProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/InactivityWarning.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InactivityWarning
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// src/components/InactivityWarning.jsx
"use client";
;
const SESSION_MS = 10 * 60 * 1000;
const STORAGE_KEY = "sessionStartAt";
function InactivityWarning({ show, onDismiss, t }) {
    _s();
    const [seconds, setSeconds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(60);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InactivityWarning.useEffect": ()=>{
            if (!show) return;
            const tick = {
                "InactivityWarning.useEffect.tick": ()=>{
                    const start = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
                    if (!start) {
                        setSeconds(0);
                        return;
                    }
                    const remaining = Math.max(0, Math.ceil((SESSION_MS - (Date.now() - start)) / 1000));
                    setSeconds(remaining);
                }
            }["InactivityWarning.useEffect.tick"];
            tick(); // set immediately on mount
            const interval = setInterval(tick, 1000);
            return ({
                "InactivityWarning.useEffect": ()=>clearInterval(interval)
            })["InactivityWarning.useEffect"];
        }
    }["InactivityWarning.useEffect"], [
        show
    ]);
    if (!show) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-0 left-0 right-0 z-[300] flex items-center justify-between px-6 py-3 text-sm font-semibold",
        style: {
            background: "rgba(251,191,36,0.97)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(217,119,6,0.4)",
            color: "#78350f"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    "⏱ ",
                    t.sessionExpiring,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-black tabular-nums",
                        children: [
                            seconds,
                            "s"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/InactivityWarning.jsx",
                        lineNumber: 38,
                        columnNumber: 35
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/InactivityWarning.jsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDismiss,
                className: "ml-4 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80",
                style: {
                    background: "rgba(0,0,0,0.1)",
                    color: "#78350f"
                },
                children: "OK"
            }, void 0, false, {
                fileName: "[project]/src/components/InactivityWarning.jsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/InactivityWarning.jsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(InactivityWarning, "T5PhQ9L5KSVb8XiZCZPVWhaJCbk=");
_c = InactivityWarning;
var _c;
__turbopack_context__.k.register(_c, "InactivityWarning");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/no.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Kolskalendar",
    "subtitle": "Få full oversikt med enkel registrering og daglig påminnelse. Enkel import av data på denne siden. Utviklet i samarbeid med lungeleger og KOLS-spesialister.",
    "importTitle": "Importer data",
    "importLabel": "Kode (fra mobil app):",
    "placeholder": "Skriv inn kode",
    "importButton": "Start",
    "available": "Tilgjengelig på App Store og Google Play.",
    "download": "Last ned gratis på din smarttelefon.",
    "dashboardTitle": "Symptomkalender",
    "dashboardSubtitle": "Oversikt over daglige KOLS-symptomer og aktivitet",
    "calendarTab": "Kalender",
    "summaryTab": "Sammendrag",
    "logTab": "Logg",
    "patientSummary": "Pasientsammendrag",
    "lastFourMonths": "Siste 4 måneder",
    "daysWithSymptoms": "dager med symptomer",
    "acuteMedication": "Akuttmedisin brukt ved",
    "occasions": "anledninger",
    "mild": "Mild",
    "moderate": "Moderat",
    "serious": "Alvorlig",
    "medication": "Medisin",
    "activity": "Aktivitet",
    "exacerbation": "Eksaserbasjon",
    "noData": "Ingen data registrert for denne dagen.",
    "loading": "Laster...",
    "noEntries": "Ingen oppføringer denne måneden.",
    "entries": "oppføringer",
    "scoreLabel": "* Score = (mild × 1) + (moderat × 2) + (alvorlig × 3)",
    "avgSymptoms": "Gj.snitt symptomer",
    "moderateExacerbation": "Moderat eksaserbasjon",
    "seriousExacerbation": "Alvorlig eksaserbasjon",
    "physicalActivity": "Fysisk aktivitet",
    "notes": "Notater",
    "daysRecorded": "Dager registrert",
    "back": "← Tilbake",
    "avslutt": "Avslutt",
    "now": "nå",
    "month": "Måned",
    "scoreHeader": "Score*",
    "symptomLog": "Symptomlogg",
    "invalidCode": "Ugyldig kode",
    "current": "nå",
    "male": "Mann",
    "female": "Kvinne",
    "registrations": "registreringer",
    "logout": "Avslutt",
    "catScore": "CAT-score",
    "catSubScores": "CAT delscorer",
    "allRecords": "Alle registreringer",
    "monthlySummary": "Månedsoversikt",
    "filledDays": "Utfylte dager",
    "lowImpact": "Lav (≤10)",
    "mediumImpact": "Middels (11–20)",
    "highImpact": "Høy (21–30)",
    "veryHighImpact": "Svært høy (>30)",
    "low": "Lav",
    "high": "Høy",
    "veryHigh": "Svært høy",
    "medicines": "Medisiner",
    "medicineSatisfaction": "Medisintilfredshet",
    "anxiety": "Angst",
    "anxietySum": "Angstsum",
    "chooseDay": "Velg en dag i kalenderen",
    "registration": "Registrering",
    "weight": "Vekt",
    "usedMedicines": "Medisiner brukt",
    "note": "Notat",
    "daily": "Fast",
    "asNeeded": "Ved behov",
    "from": "fra",
    "stopped": "sluttet",
    "timesUsed": "× brukt",
    "cat8Cough": "Hoste",
    "cat8Phlegm": "Slim",
    "cat8ChestTightness": "Brysttetthet",
    "cat8Breathlessness": "Kortpustethet",
    "cat8Activities": "Aktiviteter",
    "cat8Confidence": "Trygghet",
    "cat8Sleep": "Søvn",
    "cat8Energy": "Energi",
    "gad7feelingNervous": "Nervøs / urolig",
    "gad7noWorryingControl": "Bekymringskontroll",
    "gad7worrying": "Overdreven bekymring",
    "gad7troubleRelaxing": "Vanskelig å slappe av",
    "gad7restless": "Rastløs",
    "gad7easilyAnnoyed": "Lett irritert",
    "gad7afraid": "Frykt for noe forferdelig",
    "months": "måneder",
    "days": [
        "Man",
        "Tir",
        "Ons",
        "Tor",
        "Fre",
        "Lør",
        "Søn"
    ],
    "averageMonthly": "Månedlig gjennomsnitt",
    "showCatScore": "Vis CAT-score",
    "showExacerbation": "Vis eksaserbasjon",
    "showMedicine": "Vis medisin",
    "showNote": "Vis notater",
    "showActivity": "Vis aktivitet",
    "showWeight": "Vis vekt",
    "showIn": "Vis i kalender",
    "sessionExpiring": "Du blir logget ut om mindre enn ett minutt.",
    "downloadPdf": "Last ned PDF",
    "reportDate": "Rapportdato",
    "reportTitle": "Symptomrapport",
    "hour": "t",
    "week": "Uke",
    "hours": "timer",
    "searchPlaceholder": "Søk...",
    "weeksWithMedicine": "Uker med medisin",
    "hourSingular": "time",
    "activityLabels": [
        "Ingen",
        "Under 1 time",
        "1–2 timer",
        "2–3 timer",
        "Mer enn 3 timer"
    ],
    "monthSingular": "måned",
    "monthNames": [
        "Januar",
        "Februar",
        "Mars",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Desember"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/en.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "COPD Calendar",
    "subtitle": "Get a full overview with easy registration and daily reminders. Simple data import on this page. Developed in collaboration with pulmonologists and COPD specialists.",
    "importTitle": "Import data",
    "importLabel": "Code (from mobile app):",
    "placeholder": "Enter code",
    "importButton": "Start",
    "available": "Available on App Store and Google Play.",
    "download": "Download for free on your smartphone.",
    "dashboardTitle": "Symptom Calendar",
    "dashboardSubtitle": "Overview of daily COPD symptoms and activity",
    "calendarTab": "Calendar",
    "summaryTab": "Summary",
    "logTab": "Log",
    "patientSummary": "Patient Summary",
    "lastFourMonths": "Last 4 months",
    "daysWithSymptoms": "days with symptoms",
    "acuteMedication": "Acute medication used on",
    "occasions": "occasions",
    "mild": "Mild",
    "moderate": "Moderate",
    "serious": "Severe",
    "medication": "Medication",
    "activity": "Activity",
    "exacerbation": "Exacerbation",
    "noData": "No data recorded for this day.",
    "loading": "Loading...",
    "noEntries": "No entries this month.",
    "entries": "entries",
    "scoreLabel": "* Score = (mild × 1) + (moderate × 2) + (severe × 3)",
    "avgSymptoms": "Avg. symptoms",
    "moderateExacerbation": "Moderate exacerbation",
    "seriousExacerbation": "Severe exacerbation",
    "physicalActivity": "Physical activity",
    "notes": "Notes",
    "daysRecorded": "Days recorded",
    "back": "← Back",
    "avslutt": "Sign out",
    "now": "now",
    "month": "Date",
    "scoreHeader": "Score*",
    "symptomLog": "Symptom Log",
    "invalidCode": "Invalid code",
    "current": "now",
    "male": "Male",
    "female": "Female",
    "registrations": "registrations",
    "logout": "Sign out",
    "catScore": "CAT score",
    "catSubScores": "CAT sub-scores",
    "allRecords": "All records",
    "monthlySummary": "Monthly summary",
    "filledDays": "Days filled",
    "lowImpact": "Low (≤10)",
    "mediumImpact": "Medium (11–20)",
    "highImpact": "High (21–30)",
    "veryHighImpact": "Very high (>30)",
    "low": "Low",
    "high": "High",
    "veryHigh": "Very high",
    "medicines": "Medicines",
    "medicineSatisfaction": "Medicine satisfaction",
    "anxiety": "Anxiety",
    "anxietySum": "Anxiety score",
    "chooseDay": "Select a day in the calendar",
    "registration": "Registration",
    "weight": "Weight",
    "usedMedicines": "Medicines used",
    "note": "Note",
    "daily": "Daily",
    "asNeeded": "As needed",
    "from": "from",
    "stopped": "stopped",
    "timesUsed": "× used",
    "cat8Cough": "Cough",
    "cat8Phlegm": "Phlegm",
    "cat8ChestTightness": "Chest tightness",
    "cat8Breathlessness": "Breathlessness",
    "cat8Activities": "Activities",
    "cat8Confidence": "Confidence",
    "cat8Sleep": "Sleep",
    "cat8Energy": "Energy",
    "gad7feelingNervous": "Feeling nervous",
    "gad7noWorryingControl": "Worry control",
    "gad7worrying": "Excessive worrying",
    "gad7troubleRelaxing": "Trouble relaxing",
    "gad7restless": "Restless",
    "gad7easilyAnnoyed": "Easily annoyed",
    "gad7afraid": "Feeling afraid",
    "months": "months",
    "days": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ],
    "averageMonthly": "Monthly average",
    "showCatScore": "Show CAT score",
    "showExacerbation": "Show exacerbation",
    "showMedicine": "Show medicine",
    "showNote": "Show notes",
    "showActivity": "Show activity",
    "showWeight": "Show weight",
    "showIn": "Show in calendar",
    "sessionExpiring": "You will be logged out in less than a minute.",
    "downloadPdf": "Download PDF",
    "reportDate": "Report date",
    "reportTitle": "Symptom Report",
    "hour": "h",
    "week": "Week",
    "hours": "hours",
    "searchPlaceholder": "Search...",
    "weeksWithMedicine": "Weeks with medicine",
    "hourSingular": "hour",
    "activityLabels": [
        "None",
        "Less than 1 hour",
        "1–2 hours",
        "2–3 hours",
        "More than 3 hours"
    ],
    "monthSingular": "month",
    "monthNames": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/nl.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "COPD Kalender",
    "subtitle": "Volledig overzicht met eenvoudige registratie en dagelijkse herinnering. Eenvoudige gegevensimport op deze pagina. Ontwikkeld in samenwerking met longartsen en COPD-specialisten.",
    "importTitle": "Gegevens importeren",
    "importLabel": "Code (uit mobiele app):",
    "placeholder": "Voer code in",
    "importButton": "Start",
    "available": "Beschikbaar in de App Store en Google Play.",
    "download": "Gratis downloaden op je smartphone.",
    "dashboardTitle": "Symptoomkalender",
    "dashboardSubtitle": "Overzicht van dagelijkse COPD-symptomen en activiteit",
    "calendarTab": "Kalender",
    "summaryTab": "Samenvatting",
    "logTab": "Logboek",
    "patientSummary": "Patiëntoverzicht",
    "lastFourMonths": "Laatste 4 maanden",
    "daysWithSymptoms": "dagen met symptomen",
    "acuteMedication": "Acuut medicijn gebruikt bij",
    "occasions": "gelegenheden",
    "mild": "Mild",
    "moderate": "Matig",
    "serious": "Ernstig",
    "medication": "Medicatie",
    "activity": "Activiteit",
    "exacerbation": "Exacerbatie",
    "noData": "Geen gegevens geregistreerd voor deze dag.",
    "loading": "Laden...",
    "noEntries": "Geen vermeldingen deze maand.",
    "entries": "vermeldingen",
    "scoreLabel": "* Score = (mild × 1) + (matig × 2) + (ernstig × 3)",
    "avgSymptoms": "Gem. symptomen",
    "moderateExacerbation": "Matige exacerbatie",
    "seriousExacerbation": "Ernstige exacerbatie",
    "physicalActivity": "Fysieke activiteit",
    "notes": "Notities",
    "daysRecorded": "Dagen geregistreerd",
    "back": "← Terug",
    "avslutt": "Uitloggen",
    "now": "nu",
    "month": "Datum",
    "scoreHeader": "Score*",
    "symptomLog": "Symptoomlogboek",
    "invalidCode": "Ongeldige code",
    "current": "nu",
    "male": "Man",
    "female": "Vrouw",
    "registrations": "registraties",
    "logout": "Uitloggen",
    "catScore": "CAT-score",
    "catSubScores": "CAT deelscores",
    "allRecords": "Alle records",
    "monthlySummary": "Maandoverzicht",
    "filledDays": "Ingevulde dagen",
    "lowImpact": "Laag (≤10)",
    "mediumImpact": "Middel (11–20)",
    "highImpact": "Hoog (21–30)",
    "veryHighImpact": "Zeer hoog (>30)",
    "low": "Laag",
    "high": "Hoog",
    "veryHigh": "Zeer hoog",
    "medicines": "Medicijnen",
    "medicineSatisfaction": "Medicijntevredenheid",
    "anxiety": "Angst",
    "anxietySum": "Angstsom",
    "chooseDay": "Selecteer een dag in de kalender",
    "registration": "Registratie",
    "weight": "Gewicht",
    "usedMedicines": "Gebruikte medicijnen",
    "note": "Notitie",
    "daily": "Dagelijks",
    "asNeeded": "Zo nodig",
    "from": "van",
    "stopped": "gestopt",
    "timesUsed": "× gebruikt",
    "cat8Cough": "Hoest",
    "cat8Phlegm": "Slijm",
    "cat8ChestTightness": "Borstklemming",
    "cat8Breathlessness": "Kortademigheid",
    "cat8Activities": "Activiteiten",
    "cat8Confidence": "Vertrouwen",
    "cat8Sleep": "Slaap",
    "cat8Energy": "Energie",
    "gad7feelingNervous": "Nerveus/onrustig",
    "gad7noWorryingControl": "Zorgencontrole",
    "gad7worrying": "Overmatig piekeren",
    "gad7troubleRelaxing": "Moeite met ontspannen",
    "gad7restless": "Rusteloos",
    "gad7easilyAnnoyed": "Snel geïrriteerd",
    "gad7afraid": "Bang voor iets ergs",
    "months": "maanden",
    "days": [
        "Ma",
        "Di",
        "Wo",
        "Do",
        "Vr",
        "Za",
        "Zo"
    ],
    "averageMonthly": "Maandelijks gemiddelde",
    "showCatScore": "Toon CAT-score",
    "showExacerbation": "Toon exacerbatie",
    "showMedicine": "Toon medicatie",
    "showNote": "Toon notities",
    "showActivity": "Toon activiteit",
    "showWeight": "Toon gewicht",
    "showIn": "Toon in kalender",
    "sessionExpiring": "U wordt binnen minder dan een minuut uitgelogd.",
    "downloadPdf": "PDF downloaden",
    "reportDate": "Rapportdatum",
    "reportTitle": "Symptoomrapport",
    "hour": "u",
    "week": "Week",
    "hours": "uur",
    "searchPlaceholder": "Zoeken...",
    "weeksWithMedicine": "Weken met medicijnen",
    "hourSingular": "uur",
    "activityLabels": [
        "Geen",
        "Minder dan 1 uur",
        "1–2 uur",
        "2–3 uur",
        "Meer dan 3 uur"
    ],
    "monthSingular": "maand",
    "monthNames": [
        "Januari",
        "Februari",
        "Maart",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Augustus",
        "September",
        "Oktober",
        "November",
        "December"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/fr.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Calendrier BPCO",
    "subtitle": "Vue d'ensemble complète avec enregistrement facile et rappels quotidiens. Import simple des données sur cette page. Développé en collaboration avec des pneumologues et des spécialistes BPCO.",
    "importTitle": "Importer les données",
    "importLabel": "Code (de l'application mobile) :",
    "placeholder": "Entrer le code",
    "importButton": "Démarrer",
    "available": "Disponible sur l'App Store et Google Play.",
    "download": "Télécharger gratuitement sur votre smartphone.",
    "dashboardTitle": "Calendrier des symptômes",
    "dashboardSubtitle": "Aperçu des symptômes quotidiens BPCO et de l'activité",
    "calendarTab": "Calendrier",
    "summaryTab": "Résumé",
    "logTab": "Journal",
    "patientSummary": "Résumé patient",
    "lastFourMonths": "4 derniers mois",
    "daysWithSymptoms": "jours avec symptômes",
    "acuteMedication": "Médicament aigu utilisé à",
    "occasions": "occasions",
    "mild": "Léger",
    "moderate": "Modéré",
    "serious": "Sévère",
    "medication": "Médicament",
    "activity": "Activité",
    "exacerbation": "Exacerbation",
    "noData": "Aucune donnée enregistrée pour ce jour.",
    "loading": "Chargement...",
    "noEntries": "Aucune entrée ce mois.",
    "entries": "entrées",
    "scoreLabel": "* Score = (léger × 1) + (modéré × 2) + (sévère × 3)",
    "avgSymptoms": "Moy. symptômes",
    "moderateExacerbation": "Exacerbation modérée",
    "seriousExacerbation": "Exacerbation sévère",
    "physicalActivity": "Activité physique",
    "notes": "Notes",
    "daysRecorded": "Jours enregistrés",
    "back": "← Retour",
    "avslutt": "Déconnexion",
    "now": "maintenant",
    "month": "Date",
    "scoreHeader": "Score*",
    "symptomLog": "Journal des symptômes",
    "invalidCode": "Code invalide",
    "current": "maintenant",
    "male": "Homme",
    "female": "Femme",
    "registrations": "enregistrements",
    "logout": "Déconnexion",
    "catScore": "Score CAT",
    "catSubScores": "Sous-scores CAT",
    "allRecords": "Tous les enregistrements",
    "monthlySummary": "Résumé mensuel",
    "filledDays": "Jours remplis",
    "lowImpact": "Faible (≤10)",
    "mediumImpact": "Moyen (11–20)",
    "highImpact": "Élevé (21–30)",
    "veryHighImpact": "Très élevé (>30)",
    "low": "Faible",
    "high": "Élevé",
    "veryHigh": "Très élevé",
    "medicines": "Médicaments",
    "medicineSatisfaction": "Satisfaction médicamenteuse",
    "anxiety": "Anxiété",
    "anxietySum": "Score d'anxiété",
    "chooseDay": "Sélectionnez un jour dans le calendrier",
    "registration": "Enregistrement",
    "weight": "Poids",
    "usedMedicines": "Médicaments utilisés",
    "note": "Note",
    "daily": "Quotidien",
    "asNeeded": "Si besoin",
    "from": "depuis",
    "stopped": "arrêté",
    "timesUsed": "× utilisé",
    "cat8Cough": "Toux",
    "cat8Phlegm": "Mucosités",
    "cat8ChestTightness": "Oppression thoracique",
    "cat8Breathlessness": "Essoufflement",
    "cat8Activities": "Activités",
    "cat8Confidence": "Confiance",
    "cat8Sleep": "Sommeil",
    "cat8Energy": "Énergie",
    "gad7feelingNervous": "Nerveux/anxieux",
    "gad7noWorryingControl": "Contrôle des inquiétudes",
    "gad7worrying": "Inquiétude excessive",
    "gad7troubleRelaxing": "Difficulté à se détendre",
    "gad7restless": "Agité",
    "gad7easilyAnnoyed": "Facilement irrité",
    "gad7afraid": "Peur de quelque chose",
    "months": "mois",
    "days": [
        "Lun",
        "Mar",
        "Mer",
        "Jeu",
        "Ven",
        "Sam",
        "Dim"
    ],
    "averageMonthly": "Moyenne mensuelle",
    "showCatScore": "Afficher score CAT",
    "showExacerbation": "Afficher exacerbation",
    "showMedicine": "Afficher médicament",
    "showNote": "Afficher notes",
    "showActivity": "Afficher activité",
    "showWeight": "Afficher poids",
    "showIn": "Afficher dans le calendrier",
    "sessionExpiring": "Vous serez déconnecté dans moins d'une minute.",
    "downloadPdf": "Télécharger PDF",
    "reportDate": "Date du rapport",
    "reportTitle": "Rapport de symptômes",
    "hour": "h",
    "week": "Semaine",
    "hours": "heures",
    "searchPlaceholder": "Rechercher...",
    "weeksWithMedicine": "Semaines avec médicaments",
    "hourSingular": "heure",
    "activityLabels": [
        "Aucune",
        "Moins d'1 heure",
        "1–2 heures",
        "2–3 heures",
        "Plus de 3 heures"
    ],
    "monthSingular": "mois",
    "monthNames": [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/de.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "COPD Kalender",
    "subtitle": "Vollständiger Überblick mit einfacher Registrierung und täglicher Erinnerung. Einfacher Datenimport auf dieser Seite. Entwickelt in Zusammenarbeit mit Lungenfachärzten und COPD-Spezialisten.",
    "importTitle": "Daten importieren",
    "importLabel": "Code (aus der mobilen App):",
    "placeholder": "Code eingeben",
    "importButton": "Starten",
    "available": "Verfügbar im App Store und bei Google Play.",
    "download": "Kostenlos auf Ihrem Smartphone herunterladen.",
    "dashboardTitle": "Symptomkalender",
    "dashboardSubtitle": "Übersicht über tägliche COPD-Symptome und Aktivität",
    "calendarTab": "Kalender",
    "summaryTab": "Zusammenfassung",
    "logTab": "Protokoll",
    "patientSummary": "Patientenübersicht",
    "lastFourMonths": "Letzte 4 Monate",
    "daysWithSymptoms": "Tage mit Symptomen",
    "acuteMedication": "Akutmedikament verwendet bei",
    "occasions": "Gelegenheiten",
    "mild": "Leicht",
    "moderate": "Mäßig",
    "serious": "Schwer",
    "medication": "Medikament",
    "activity": "Aktivität",
    "exacerbation": "Exazerbation",
    "noData": "Keine Daten für diesen Tag erfasst.",
    "loading": "Laden...",
    "noEntries": "Keine Einträge diesen Monat.",
    "entries": "Einträge",
    "scoreLabel": "* Score = (leicht × 1) + (mäßig × 2) + (schwer × 3)",
    "avgSymptoms": "Durchschn. Symptome",
    "moderateExacerbation": "Mäßige Exazerbation",
    "seriousExacerbation": "Schwere Exazerbation",
    "physicalActivity": "Körperliche Aktivität",
    "notes": "Notizen",
    "daysRecorded": "Erfasste Tage",
    "back": "← Zurück",
    "avslutt": "Abmelden",
    "now": "jetzt",
    "month": "Datum",
    "scoreHeader": "Score*",
    "symptomLog": "Symptomprotokoll",
    "invalidCode": "Ungültiger Code",
    "current": "jetzt",
    "male": "Mann",
    "female": "Frau",
    "registrations": "Registrierungen",
    "logout": "Abmelden",
    "catScore": "CAT-Score",
    "catSubScores": "CAT-Teilscores",
    "allRecords": "Alle Einträge",
    "monthlySummary": "Monatsübersicht",
    "filledDays": "Ausgefüllte Tage",
    "lowImpact": "Niedrig (≤10)",
    "mediumImpact": "Mittel (11–20)",
    "highImpact": "Hoch (21–30)",
    "veryHighImpact": "Sehr hoch (>30)",
    "low": "Niedrig",
    "high": "Hoch",
    "veryHigh": "Sehr hoch",
    "medicines": "Medikamente",
    "medicineSatisfaction": "Medikamentenzufriedenheit",
    "anxiety": "Angst",
    "anxietySum": "Angstscore",
    "chooseDay": "Wählen Sie einen Tag im Kalender",
    "registration": "Registrierung",
    "weight": "Gewicht",
    "usedMedicines": "Verwendete Medikamente",
    "note": "Notiz",
    "daily": "Täglich",
    "asNeeded": "Bei Bedarf",
    "from": "ab",
    "stopped": "gestoppt",
    "timesUsed": "× verwendet",
    "cat8Cough": "Husten",
    "cat8Phlegm": "Schleim",
    "cat8ChestTightness": "Brustenge",
    "cat8Breathlessness": "Kurzatmigkeit",
    "cat8Activities": "Aktivitäten",
    "cat8Confidence": "Zuversicht",
    "cat8Sleep": "Schlaf",
    "cat8Energy": "Energie",
    "gad7feelingNervous": "Nervös/ängstlich",
    "gad7noWorryingControl": "Sorgenkontrolle",
    "gad7worrying": "Übermäßiges Sorgen",
    "gad7troubleRelaxing": "Schwierigkeiten beim Entspannen",
    "gad7restless": "Ruhelos",
    "gad7easilyAnnoyed": "Leicht gereizt",
    "gad7afraid": "Angst vor etwas Schlimmem",
    "months": "Monate",
    "days": [
        "Mo",
        "Di",
        "Mi",
        "Do",
        "Fr",
        "Sa",
        "So"
    ],
    "averageMonthly": "Monatsdurchschnitt",
    "showCatScore": "CAT-Score anzeigen",
    "showExacerbation": "Exazerbation anzeigen",
    "showMedicine": "Medikament anzeigen",
    "showNote": "Notizen anzeigen",
    "showActivity": "Aktivität anzeigen",
    "showWeight": "Gewicht anzeigen",
    "showIn": "Im Kalender anzeigen",
    "sessionExpiring": "Sie werden in weniger als einer Minute abgemeldet.",
    "downloadPdf": "PDF herunterladen",
    "reportDate": "Berichtsdatum",
    "reportTitle": "Symptombericht",
    "hour": "h",
    "week": "Woche",
    "hours": "Stunden",
    "searchPlaceholder": "Suchen...",
    "weeksWithMedicine": "Wochen mit Medikamenten",
    "hourSingular": "Stunde",
    "activityLabels": [
        "Keine",
        "Weniger als 1 Stunde",
        "1–2 Stunden",
        "2–3 Stunden",
        "Mehr als 3 Stunden"
    ],
    "monthSingular": "Monat",
    "monthNames": [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/it.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Calendario BPCO",
    "subtitle": "Panoramica completa con registrazione semplice e promemoria giornalieri. Importazione dati semplice su questa pagina. Sviluppato in collaborazione con pneumologi e specialisti BPCO.",
    "importTitle": "Importa dati",
    "importLabel": "Codice (dall'app mobile):",
    "placeholder": "Inserisci il codice",
    "importButton": "Inizia",
    "available": "Disponibile su App Store e Google Play.",
    "download": "Scarica gratuitamente sul tuo smartphone.",
    "dashboardTitle": "Calendario sintomi",
    "dashboardSubtitle": "Panoramica dei sintomi BPCO quotidiani e dell'attività",
    "calendarTab": "Calendario",
    "summaryTab": "Riepilogo",
    "logTab": "Registro",
    "patientSummary": "Riepilogo paziente",
    "lastFourMonths": "Ultimi 4 mesi",
    "daysWithSymptoms": "giorni con sintomi",
    "acuteMedication": "Farmaco acuto usato in",
    "occasions": "occasioni",
    "mild": "Lieve",
    "moderate": "Moderato",
    "serious": "Grave",
    "medication": "Farmaco",
    "activity": "Attività",
    "exacerbation": "Riacutizzazione",
    "noData": "Nessun dato registrato per questo giorno.",
    "loading": "Caricamento...",
    "noEntries": "Nessuna voce questo mese.",
    "entries": "voci",
    "scoreLabel": "* Punteggio = (lieve × 1) + (moderato × 2) + (grave × 3)",
    "avgSymptoms": "Media sintomi",
    "moderateExacerbation": "Riacutizzazione moderata",
    "seriousExacerbation": "Riacutizzazione grave",
    "physicalActivity": "Attività fisica",
    "notes": "Note",
    "daysRecorded": "Giorni registrati",
    "back": "← Indietro",
    "avslutt": "Disconnettersi",
    "now": "ora",
    "month": "Data",
    "scoreHeader": "Punteggio*",
    "symptomLog": "Registro sintomi",
    "invalidCode": "Codice non valido",
    "current": "ora",
    "male": "Uomo",
    "female": "Donna",
    "registrations": "registrazioni",
    "logout": "Disconnettersi",
    "catScore": "Punteggio CAT",
    "catSubScores": "Sotto-punteggi CAT",
    "allRecords": "Tutti i record",
    "monthlySummary": "Riepilogo mensile",
    "filledDays": "Giorni compilati",
    "lowImpact": "Basso (≤10)",
    "mediumImpact": "Medio (11–20)",
    "highImpact": "Alto (21–30)",
    "veryHighImpact": "Molto alto (>30)",
    "low": "Basso",
    "high": "Alto",
    "veryHigh": "Molto alto",
    "medicines": "Farmaci",
    "medicineSatisfaction": "Soddisfazione farmaci",
    "anxiety": "Ansia",
    "anxietySum": "Punteggio ansia",
    "chooseDay": "Seleziona un giorno nel calendario",
    "registration": "Registrazione",
    "weight": "Peso",
    "usedMedicines": "Farmaci usati",
    "note": "Nota",
    "daily": "Quotidiano",
    "asNeeded": "Al bisogno",
    "from": "dal",
    "stopped": "interrotto",
    "timesUsed": "× usato",
    "cat8Cough": "Tosse",
    "cat8Phlegm": "Catarro",
    "cat8ChestTightness": "Oppressione toracica",
    "cat8Breathlessness": "Mancanza di respiro",
    "cat8Activities": "Attività",
    "cat8Confidence": "Fiducia",
    "cat8Sleep": "Sonno",
    "cat8Energy": "Energia",
    "gad7feelingNervous": "Nervoso/ansioso",
    "gad7noWorryingControl": "Controllo preoccupazioni",
    "gad7worrying": "Preoccupazione eccessiva",
    "gad7troubleRelaxing": "Difficoltà a rilassarsi",
    "gad7restless": "Irrequieto",
    "gad7easilyAnnoyed": "Facilmente irritato",
    "gad7afraid": "Paura di qualcosa di brutto",
    "months": "mesi",
    "days": [
        "Lun",
        "Mar",
        "Mer",
        "Gio",
        "Ven",
        "Sab",
        "Dom"
    ],
    "averageMonthly": "Media mensile",
    "showCatScore": "Mostra punteggio CAT",
    "showExacerbation": "Mostra riacutizzazione",
    "showMedicine": "Mostra farmaco",
    "showNote": "Mostra note",
    "showActivity": "Mostra attività",
    "showWeight": "Mostra peso",
    "showIn": "Mostra nel calendario",
    "sessionExpiring": "Verrai disconnesso in meno di un minuto.",
    "downloadPdf": "Scarica PDF",
    "reportDate": "Data del rapporto",
    "reportTitle": "Rapporto sintomi",
    "hour": "h",
    "week": "Settimana",
    "hours": "ore",
    "searchPlaceholder": "Cerca...",
    "weeksWithMedicine": "Settimane con farmaci",
    "hourSingular": "ora",
    "activityLabels": [
        "Nessuna",
        "Meno di 1 ora",
        "1–2 ore",
        "2–3 ore",
        "Più di 3 ore"
    ],
    "monthSingular": "mese",
    "monthNames": [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/sv.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "KOL-kalender",
    "subtitle": "Få full översikt med enkel registrering och daglig påminnelse. Enkel dataimport på denna sida. Utvecklad i samarbete med lungläkare och KOL-specialister.",
    "importTitle": "Importera data",
    "importLabel": "Kod (från mobilapp):",
    "placeholder": "Ange kod",
    "importButton": "Start",
    "available": "Tillgänglig på App Store och Google Play.",
    "download": "Ladda ner gratis på din smarttelefon.",
    "dashboardTitle": "Symtomkalender",
    "dashboardSubtitle": "Översikt över dagliga KOL-symtom och aktivitet",
    "calendarTab": "Kalender",
    "summaryTab": "Sammanfattning",
    "logTab": "Logg",
    "patientSummary": "Patientöversikt",
    "lastFourMonths": "Senaste 4 månaderna",
    "daysWithSymptoms": "dagar med symtom",
    "acuteMedication": "Akutmedicin använd vid",
    "occasions": "tillfällen",
    "mild": "Mild",
    "moderate": "Måttlig",
    "serious": "Allvarlig",
    "medication": "Medicin",
    "activity": "Aktivitet",
    "exacerbation": "Exacerbation",
    "noData": "Ingen data registrerad för denna dag.",
    "loading": "Laddar...",
    "noEntries": "Inga poster denna månad.",
    "entries": "poster",
    "scoreLabel": "* Poäng = (mild × 1) + (måttlig × 2) + (allvarlig × 3)",
    "avgSymptoms": "Genomsn. symtom",
    "moderateExacerbation": "Måttlig exacerbation",
    "seriousExacerbation": "Allvarlig exacerbation",
    "physicalActivity": "Fysisk aktivitet",
    "notes": "Anteckningar",
    "daysRecorded": "Dagar registrerade",
    "back": "← Tillbaka",
    "avslutt": "Logga ut",
    "now": "nu",
    "month": "Datum",
    "scoreHeader": "Poäng*",
    "symptomLog": "Symtomlogg",
    "invalidCode": "Ogiltig kod",
    "current": "nu",
    "male": "Man",
    "female": "Kvinna",
    "registrations": "registreringar",
    "logout": "Logga ut",
    "catScore": "CAT-poäng",
    "catSubScores": "CAT delpoäng",
    "allRecords": "Alla poster",
    "monthlySummary": "Månadsöversikt",
    "filledDays": "Ifyllda dagar",
    "lowImpact": "Låg (≤10)",
    "mediumImpact": "Medel (11–20)",
    "highImpact": "Hög (21–30)",
    "veryHighImpact": "Mycket hög (>30)",
    "low": "Låg",
    "high": "Hög",
    "veryHigh": "Mycket hög",
    "medicines": "Mediciner",
    "medicineSatisfaction": "Medicintillfredsställelse",
    "anxiety": "Ångest",
    "anxietySum": "Ångestpoäng",
    "chooseDay": "Välj en dag i kalendern",
    "registration": "Registrering",
    "weight": "Vikt",
    "usedMedicines": "Använda mediciner",
    "note": "Anteckning",
    "daily": "Fast",
    "asNeeded": "Vid behov",
    "from": "från",
    "stopped": "avslutad",
    "timesUsed": "× använd",
    "cat8Cough": "Hosta",
    "cat8Phlegm": "Slem",
    "cat8ChestTightness": "Brösttrånghet",
    "cat8Breathlessness": "Andfåddhet",
    "cat8Activities": "Aktiviteter",
    "cat8Confidence": "Trygghet",
    "cat8Sleep": "Sömn",
    "cat8Energy": "Energi",
    "gad7feelingNervous": "Nervös/orolig",
    "gad7noWorryingControl": "Oroningskontroll",
    "gad7worrying": "Överdriven oro",
    "gad7troubleRelaxing": "Svårt att slappna av",
    "gad7restless": "Rastlös",
    "gad7easilyAnnoyed": "Lättirriterad",
    "gad7afraid": "Rädd för något",
    "months": "månader",
    "days": [
        "Mån",
        "Tis",
        "Ons",
        "Tor",
        "Fre",
        "Lör",
        "Sön"
    ],
    "averageMonthly": "Månadsgenomsnitt",
    "showCatScore": "Visa CAT-poäng",
    "showExacerbation": "Visa exacerbation",
    "showMedicine": "Visa medicin",
    "showNote": "Visa anteckningar",
    "showActivity": "Visa aktivitet",
    "showWeight": "Visa vikt",
    "showIn": "Visa i kalender",
    "sessionExpiring": "Du loggas ut om mindre än en minut.",
    "downloadPdf": "Ladda ner PDF",
    "reportDate": "Rapportdatum",
    "reportTitle": "Symtomrapport",
    "hour": "t",
    "week": "Vecka",
    "hours": "timmar",
    "searchPlaceholder": "Sök...",
    "weeksWithMedicine": "Veckor med medicin",
    "hourSingular": "timme",
    "activityLabels": [
        "Ingen",
        "Mindre än 1 timme",
        "1–2 timmar",
        "2–3 timmar",
        "Mer än 3 timmar"
    ],
    "monthSingular": "månad",
    "monthNames": [
        "Januari",
        "Februari",
        "Mars",
        "April",
        "Maj",
        "Juni",
        "Juli",
        "Augusti",
        "September",
        "Oktober",
        "November",
        "December"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/da.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "KOL-kalender",
    "subtitle": "Få fuldt overblik med nem registrering og daglig påmindelse. Nem dataimport på denne side. Udviklet i samarbejde med lungelæger og KOL-specialister.",
    "importTitle": "Importer data",
    "importLabel": "Kode (fra mobilapp):",
    "placeholder": "Indtast kode",
    "importButton": "Start",
    "available": "Tilgængelig i App Store og Google Play.",
    "download": "Download gratis på din smartphone.",
    "dashboardTitle": "Symptomkalender",
    "dashboardSubtitle": "Oversigt over daglige KOL-symptomer og aktivitet",
    "calendarTab": "Kalender",
    "summaryTab": "Resumé",
    "logTab": "Log",
    "patientSummary": "Patientoversigt",
    "lastFourMonths": "Sidste 4 måneder",
    "daysWithSymptoms": "dage med symptomer",
    "acuteMedication": "Akutmedicin brugt ved",
    "occasions": "lejligheder",
    "mild": "Mild",
    "moderate": "Moderat",
    "serious": "Alvorlig",
    "medication": "Medicin",
    "activity": "Aktivitet",
    "exacerbation": "Eksacerbation",
    "noData": "Ingen data registreret for denne dag.",
    "loading": "Indlæser...",
    "noEntries": "Ingen poster denne måned.",
    "entries": "poster",
    "scoreLabel": "* Score = (mild × 1) + (moderat × 2) + (alvorlig × 3)",
    "avgSymptoms": "Gns. symptomer",
    "moderateExacerbation": "Moderat eksacerbation",
    "seriousExacerbation": "Alvorlig eksacerbation",
    "physicalActivity": "Fysisk aktivitet",
    "notes": "Noter",
    "daysRecorded": "Dage registreret",
    "back": "← Tilbage",
    "avslutt": "Log ud",
    "now": "nu",
    "month": "Dato",
    "scoreHeader": "Score*",
    "symptomLog": "Symptomlog",
    "invalidCode": "Ugyldig kode",
    "current": "nu",
    "male": "Mand",
    "female": "Kvinde",
    "registrations": "registreringer",
    "logout": "Log ud",
    "catScore": "CAT-score",
    "catSubScores": "CAT delscorer",
    "allRecords": "Alle poster",
    "monthlySummary": "Månedsoversigt",
    "filledDays": "Udfyldte dage",
    "lowImpact": "Lav (≤10)",
    "mediumImpact": "Middel (11–20)",
    "highImpact": "Høj (21–30)",
    "veryHighImpact": "Meget høj (>30)",
    "low": "Lav",
    "high": "Høj",
    "veryHigh": "Meget høj",
    "medicines": "Medicin",
    "medicineSatisfaction": "Medicintilfredshed",
    "anxiety": "Angst",
    "anxietySum": "Angstsum",
    "chooseDay": "Vælg en dag i kalenderen",
    "registration": "Registrering",
    "weight": "Vægt",
    "usedMedicines": "Brugt medicin",
    "note": "Note",
    "daily": "Fast",
    "asNeeded": "Ved behov",
    "from": "fra",
    "stopped": "stoppet",
    "timesUsed": "× brugt",
    "cat8Cough": "Hoste",
    "cat8Phlegm": "Slim",
    "cat8ChestTightness": "Brysttrykhed",
    "cat8Breathlessness": "Åndenød",
    "cat8Activities": "Aktiviteter",
    "cat8Confidence": "Tryghed",
    "cat8Sleep": "Søvn",
    "cat8Energy": "Energi",
    "gad7feelingNervous": "Nervøs/urolig",
    "gad7noWorryingControl": "Bekymringskontrol",
    "gad7worrying": "Overdreven bekymring",
    "gad7troubleRelaxing": "Svært at slappe af",
    "gad7restless": "Rastløs",
    "gad7easilyAnnoyed": "Let irritabel",
    "gad7afraid": "Bange for noget",
    "months": "måneder",
    "days": [
        "Man",
        "Tir",
        "Ons",
        "Tor",
        "Fre",
        "Lør",
        "Søn"
    ],
    "averageMonthly": "Månedligt gennemsnit",
    "showCatScore": "Vis CAT-score",
    "showExacerbation": "Vis eksacerbation",
    "showMedicine": "Vis medicin",
    "showNote": "Vis noter",
    "showActivity": "Vis aktivitet",
    "showWeight": "Vis vægt",
    "showIn": "Vis i kalender",
    "sessionExpiring": "Du bliver logget ud om mindre end et minut.",
    "downloadPdf": "Download PDF",
    "reportDate": "Rapportdato",
    "reportTitle": "Symptomrapport",
    "hour": "t",
    "week": "Uge",
    "hours": "timer",
    "searchPlaceholder": "Søg...",
    "weeksWithMedicine": "Uger med medicin",
    "hourSingular": "time",
    "activityLabels": [
        "Ingen",
        "Under 1 time",
        "1–2 timer",
        "2–3 timer",
        "Mere end 3 timer"
    ],
    "monthSingular": "måned",
    "monthNames": [
        "Januar",
        "Februar",
        "Marts",
        "April",
        "Maj",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "December"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/fi.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "COPD-kalenteri",
    "subtitle": "Täydellinen yleiskatsaus helpolla rekisteröinnillä ja päivittäisillä muistutuksilla. Helppo tietojen tuonti tällä sivulla. Kehitetty yhteistyössä keuhkolääkäreiden ja COPD-asiantuntijoiden kanssa.",
    "importTitle": "Tuo tiedot",
    "importLabel": "Koodi (mobiilisovelluksesta):",
    "placeholder": "Syötä koodi",
    "importButton": "Aloita",
    "available": "Saatavilla App Storessa ja Google Playssa.",
    "download": "Lataa ilmaiseksi älypuhelimeesi.",
    "dashboardTitle": "Oirekalenteri",
    "dashboardSubtitle": "Yleiskatsaus päivittäisistä COPD-oireista ja aktiviteetista",
    "calendarTab": "Kalenteri",
    "summaryTab": "Yhteenveto",
    "logTab": "Loki",
    "patientSummary": "Potilasyhteenveto",
    "lastFourMonths": "Viimeiset 4 kuukautta",
    "daysWithSymptoms": "päivää oireita",
    "acuteMedication": "Akuuttilääke käytetty",
    "occasions": "kertaa",
    "mild": "Lievä",
    "moderate": "Kohtalainen",
    "serious": "Vakava",
    "medication": "Lääke",
    "activity": "Aktiviteetti",
    "exacerbation": "Paheneminen",
    "noData": "Ei tietoja tälle päivälle.",
    "loading": "Ladataan...",
    "noEntries": "Ei merkintöjä tässä kuussa.",
    "entries": "merkintää",
    "scoreLabel": "* Pisteet = (lievä × 1) + (kohtalainen × 2) + (vakava × 3)",
    "avgSymptoms": "Keskim. oireet",
    "moderateExacerbation": "Kohtalainen paheneminen",
    "seriousExacerbation": "Vakava paheneminen",
    "physicalActivity": "Fyysinen aktiivisuus",
    "notes": "Muistiinpanot",
    "daysRecorded": "Päivää kirjattu",
    "back": "← Takaisin",
    "avslutt": "Kirjaudu ulos",
    "now": "nyt",
    "month": "Päivämäärä",
    "scoreHeader": "Pisteet*",
    "symptomLog": "Oireloki",
    "invalidCode": "Virheellinen koodi",
    "current": "nyt",
    "male": "Mies",
    "female": "Nainen",
    "registrations": "rekisteröintiä",
    "logout": "Kirjaudu ulos",
    "catScore": "CAT-pisteet",
    "catSubScores": "CAT osapisteet",
    "allRecords": "Kaikki tietueet",
    "monthlySummary": "Kuukausikatsaus",
    "filledDays": "Täytetyt päivät",
    "lowImpact": "Matala (≤10)",
    "mediumImpact": "Keski (11–20)",
    "highImpact": "Korkea (21–30)",
    "veryHighImpact": "Erittäin korkea (>30)",
    "low": "Matala",
    "high": "Korkea",
    "veryHigh": "Erittäin korkea",
    "medicines": "Lääkkeet",
    "medicineSatisfaction": "Lääketyytyväisyys",
    "anxiety": "Ahdistus",
    "anxietySum": "Ahdistuspisteet",
    "chooseDay": "Valitse päivä kalenterista",
    "registration": "Rekisteröinti",
    "weight": "Paino",
    "usedMedicines": "Käytetyt lääkkeet",
    "note": "Muistiinpano",
    "daily": "Päivittäin",
    "asNeeded": "Tarvittaessa",
    "from": "alkaen",
    "stopped": "lopetettu",
    "timesUsed": "× käytetty",
    "cat8Cough": "Yskä",
    "cat8Phlegm": "Lima",
    "cat8ChestTightness": "Rintakipu",
    "cat8Breathlessness": "Hengenahdistus",
    "cat8Activities": "Aktiviteetit",
    "cat8Confidence": "Luottamus",
    "cat8Sleep": "Uni",
    "cat8Energy": "Energia",
    "gad7feelingNervous": "Hermostunut/levoton",
    "gad7noWorryingControl": "Huolien hallinta",
    "gad7worrying": "Liiallinen huolehtiminen",
    "gad7troubleRelaxing": "Vaikea rentoutua",
    "gad7restless": "Levoton",
    "gad7easilyAnnoyed": "Helposti ärsyyntyvä",
    "gad7afraid": "Pelokas jostakin",
    "months": "kuukautta",
    "days": [
        "Ma",
        "Ti",
        "Ke",
        "To",
        "Pe",
        "La",
        "Su"
    ],
    "averageMonthly": "Kuukausikeskiarvo",
    "showCatScore": "Näytä CAT-pisteet",
    "showExacerbation": "Näytä paheneminen",
    "showMedicine": "Näytä lääke",
    "showNote": "Näytä muistiinpanot",
    "showActivity": "Näytä aktiviteetti",
    "showWeight": "Näytä paino",
    "showIn": "Näytä kalenterissa",
    "sessionExpiring": "Sinut kirjataan ulos alle minuutissa.",
    "downloadPdf": "Lataa PDF",
    "reportDate": "Raporttipäivä",
    "reportTitle": "Oireraportti",
    "hour": "t",
    "week": "Viikko",
    "hours": "tuntia",
    "searchPlaceholder": "Hae...",
    "weeksWithMedicine": "Viikkoja lääkkeellä",
    "hourSingular": "tunti",
    "activityLabels": [
        "Ei mitään",
        "Alle 1 tunti",
        "1–2 tuntia",
        "2–3 tuntia",
        "Yli 3 tuntia"
    ],
    "monthSingular": "kuukausi",
    "monthNames": [
        "Tammikuu",
        "Helmikuu",
        "Maaliskuu",
        "Huhtikuu",
        "Toukokuu",
        "Kesäkuu",
        "Heinäkuu",
        "Elokuu",
        "Syyskuu",
        "Lokakuu",
        "Marraskuu",
        "Joulukuu"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/es.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Calendario EPOC",
    "subtitle": "Visión completa con registro fácil y recordatorios diarios. Importación de datos sencilla en esta página. Desarrollado en colaboración con neumólogos y especialistas en EPOC.",
    "importTitle": "Importar datos",
    "importLabel": "Código (de la aplicación móvil):",
    "placeholder": "Introducir código",
    "importButton": "Iniciar",
    "available": "Disponible en App Store y Google Play.",
    "download": "Descarga gratis en tu smartphone.",
    "dashboardTitle": "Calendario de síntomas",
    "dashboardSubtitle": "Resumen de síntomas diarios de EPOC y actividad",
    "calendarTab": "Calendario",
    "summaryTab": "Resumen",
    "logTab": "Registro",
    "patientSummary": "Resumen del paciente",
    "lastFourMonths": "Últimos 4 meses",
    "daysWithSymptoms": "días con síntomas",
    "acuteMedication": "Medicamento agudo usado en",
    "occasions": "ocasiones",
    "mild": "Leve",
    "moderate": "Moderado",
    "serious": "Grave",
    "medication": "Medicamento",
    "activity": "Actividad",
    "exacerbation": "Exacerbación",
    "noData": "No hay datos registrados para este día.",
    "loading": "Cargando...",
    "noEntries": "No hay entradas este mes.",
    "entries": "entradas",
    "scoreLabel": "* Puntuación = (leve × 1) + (moderado × 2) + (grave × 3)",
    "avgSymptoms": "Prom. síntomas",
    "moderateExacerbation": "Exacerbación moderada",
    "seriousExacerbation": "Exacerbación grave",
    "physicalActivity": "Actividad física",
    "notes": "Notas",
    "daysRecorded": "Días registrados",
    "back": "← Volver",
    "avslutt": "Cerrar sesión",
    "now": "ahora",
    "month": "Fecha",
    "scoreHeader": "Puntuación*",
    "symptomLog": "Registro de síntomas",
    "invalidCode": "Código inválido",
    "current": "ahora",
    "male": "Hombre",
    "female": "Mujer",
    "registrations": "registros",
    "logout": "Cerrar sesión",
    "catScore": "Puntuación CAT",
    "catSubScores": "Subpuntuaciones CAT",
    "allRecords": "Todos los registros",
    "monthlySummary": "Resumen mensual",
    "filledDays": "Días completados",
    "lowImpact": "Bajo (≤10)",
    "mediumImpact": "Medio (11–20)",
    "highImpact": "Alto (21–30)",
    "veryHighImpact": "Muy alto (>30)",
    "low": "Bajo",
    "high": "Alto",
    "veryHigh": "Muy alto",
    "medicines": "Medicamentos",
    "medicineSatisfaction": "Satisfacción con medicamentos",
    "anxiety": "Ansiedad",
    "anxietySum": "Puntuación de ansiedad",
    "chooseDay": "Seleccione un día en el calendario",
    "registration": "Registro",
    "weight": "Peso",
    "usedMedicines": "Medicamentos usados",
    "note": "Nota",
    "daily": "Diario",
    "asNeeded": "Según necesidad",
    "from": "desde",
    "stopped": "detenido",
    "timesUsed": "× usado",
    "cat8Cough": "Tos",
    "cat8Phlegm": "Flema",
    "cat8ChestTightness": "Opresión torácica",
    "cat8Breathlessness": "Falta de aire",
    "cat8Activities": "Actividades",
    "cat8Confidence": "Confianza",
    "cat8Sleep": "Sueño",
    "cat8Energy": "Energía",
    "gad7feelingNervous": "Nervioso/ansioso",
    "gad7noWorryingControl": "Control de preocupaciones",
    "gad7worrying": "Preocupación excesiva",
    "gad7troubleRelaxing": "Dificultad para relajarse",
    "gad7restless": "Inquieto",
    "gad7easilyAnnoyed": "Fácilmente irritado",
    "gad7afraid": "Miedo a algo malo",
    "months": "meses",
    "days": [
        "Lun",
        "Mar",
        "Mié",
        "Jue",
        "Vie",
        "Sáb",
        "Dom"
    ],
    "averageMonthly": "Promedio mensual",
    "showCatScore": "Mostrar puntuación CAT",
    "showExacerbation": "Mostrar exacerbación",
    "showMedicine": "Mostrar medicamento",
    "showNote": "Mostrar notas",
    "showActivity": "Mostrar actividad",
    "showWeight": "Mostrar peso",
    "showIn": "Mostrar en calendario",
    "sessionExpiring": "Se cerrará su sesión en menos de un minuto.",
    "downloadPdf": "Descargar PDF",
    "reportDate": "Fecha del informe",
    "reportTitle": "Informe de síntomas",
    "hour": "h",
    "week": "Semana",
    "hours": "horas",
    "searchPlaceholder": "Buscar...",
    "weeksWithMedicine": "Semanas con medicación",
    "hourSingular": "hora",
    "activityLabels": [
        "Ninguna",
        "Menos de 1 hora",
        "1–2 horas",
        "2–3 horas",
        "Más de 3 horas"
    ],
    "monthSingular": "mes",
    "monthNames": [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/pl.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Kalendarz POChP",
    "subtitle": "Pełny przegląd z łatwą rejestracją i codziennymi przypomnieniami. Prosty import danych na tej stronie. Opracowany we współpracy z pulmonologami i specjalistami POChP.",
    "importTitle": "Importuj dane",
    "importLabel": "Kod (z aplikacji mobilnej):",
    "placeholder": "Wprowadź kod",
    "importButton": "Start",
    "available": "Dostępny w App Store i Google Play.",
    "download": "Pobierz bezpłatnie na smartfona.",
    "dashboardTitle": "Kalendarz objawów",
    "dashboardSubtitle": "Przegląd codziennych objawów POChP i aktywności",
    "calendarTab": "Kalendarz",
    "summaryTab": "Podsumowanie",
    "logTab": "Dziennik",
    "patientSummary": "Podsumowanie pacjenta",
    "lastFourMonths": "Ostatnie 4 miesiące",
    "daysWithSymptoms": "dni z objawami",
    "acuteMedication": "Lek doraźny użyty przy",
    "occasions": "okazjach",
    "mild": "Łagodny",
    "moderate": "Umiarkowany",
    "serious": "Ciężki",
    "medication": "Lek",
    "activity": "Aktywność",
    "exacerbation": "Zaostrzenie",
    "noData": "Brak danych dla tego dnia.",
    "loading": "Ładowanie...",
    "noEntries": "Brak wpisów w tym miesiącu.",
    "entries": "wpisy",
    "scoreLabel": "* Wynik = (łagodny × 1) + (umiarkowany × 2) + (ciężki × 3)",
    "avgSymptoms": "Śr. objawy",
    "moderateExacerbation": "Umiarkowane zaostrzenie",
    "seriousExacerbation": "Ciężkie zaostrzenie",
    "physicalActivity": "Aktywność fizyczna",
    "notes": "Notatki",
    "daysRecorded": "Zarejestrowane dni",
    "back": "← Wstecz",
    "avslutt": "Wyloguj",
    "now": "teraz",
    "month": "Data",
    "scoreHeader": "Wynik*",
    "symptomLog": "Dziennik objawów",
    "invalidCode": "Nieprawidłowy kod",
    "current": "teraz",
    "male": "Mężczyzna",
    "female": "Kobieta",
    "registrations": "rejestracje",
    "logout": "Wyloguj",
    "catScore": "Wynik CAT",
    "catSubScores": "Podwyniki CAT",
    "allRecords": "Wszystkie rekordy",
    "monthlySummary": "Podsumowanie miesięczne",
    "filledDays": "Wypełnione dni",
    "lowImpact": "Niski (≤10)",
    "mediumImpact": "Średni (11–20)",
    "highImpact": "Wysoki (21–30)",
    "veryHighImpact": "Bardzo wysoki (>30)",
    "low": "Niski",
    "high": "Wysoki",
    "veryHigh": "Bardzo wysoki",
    "medicines": "Leki",
    "medicineSatisfaction": "Zadowolenie z leków",
    "anxiety": "Lęk",
    "anxietySum": "Wynik lęku",
    "chooseDay": "Wybierz dzień w kalendarzu",
    "registration": "Rejestracja",
    "weight": "Waga",
    "usedMedicines": "Używane leki",
    "note": "Notatka",
    "daily": "Codziennie",
    "asNeeded": "W razie potrzeby",
    "from": "od",
    "stopped": "zatrzymany",
    "timesUsed": "× użyty",
    "cat8Cough": "Kaszel",
    "cat8Phlegm": "Plwocina",
    "cat8ChestTightness": "Ucisk w klatce",
    "cat8Breathlessness": "Duszność",
    "cat8Activities": "Aktywności",
    "cat8Confidence": "Pewność siebie",
    "cat8Sleep": "Sen",
    "cat8Energy": "Energia",
    "gad7feelingNervous": "Nerwowy/niespokojny",
    "gad7noWorryingControl": "Kontrola martwienia",
    "gad7worrying": "Nadmierne martwienie",
    "gad7troubleRelaxing": "Trudność z relaksem",
    "gad7restless": "Niespokojny",
    "gad7easilyAnnoyed": "Łatwo zdenerwowany",
    "gad7afraid": "Strach przed czymś złym",
    "months": "miesiące",
    "days": [
        "Pon",
        "Wt",
        "Śr",
        "Czw",
        "Pt",
        "Sob",
        "Nd"
    ],
    "averageMonthly": "Średnia miesięczna",
    "showCatScore": "Pokaż wynik CAT",
    "showExacerbation": "Pokaż zaostrzenie",
    "showMedicine": "Pokaż lek",
    "showNote": "Pokaż notatki",
    "showActivity": "Pokaż aktywność",
    "showWeight": "Pokaż wagę",
    "showIn": "Pokaż w kalendarzu",
    "sessionExpiring": "Zostaniesz wylogowany w mniej niż minutę.",
    "downloadPdf": "Pobierz PDF",
    "reportDate": "Data raportu",
    "reportTitle": "Raport objawów",
    "hour": "g",
    "week": "Tydzień",
    "hours": "godziny",
    "searchPlaceholder": "Szukaj...",
    "weeksWithMedicine": "Tygodnie z lekiem",
    "hourSingular": "godzina",
    "activityLabels": [
        "Brak",
        "Mniej niż 1 godzina",
        "1–2 godziny",
        "2–3 godziny",
        "Ponad 3 godziny"
    ],
    "monthSingular": "miesiąc",
    "monthNames": [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/messages/pt.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "title": "Calendário DPOC",
    "subtitle": "Visão geral completa com registo fácil e lembretes diários. Importação de dados simples nesta página. Desenvolvido em colaboração com pneumologistas e especialistas em DPOC.",
    "importTitle": "Importar dados",
    "importLabel": "Código (da aplicação móvel):",
    "placeholder": "Introduzir código",
    "importButton": "Iniciar",
    "available": "Disponível na App Store e Google Play.",
    "download": "Descarregue gratuitamente no seu smartphone.",
    "dashboardTitle": "Calendário de sintomas",
    "dashboardSubtitle": "Visão geral dos sintomas diários de DPOC e atividade",
    "calendarTab": "Calendário",
    "summaryTab": "Resumo",
    "logTab": "Registo",
    "patientSummary": "Resumo do paciente",
    "lastFourMonths": "Últimos 4 meses",
    "daysWithSymptoms": "dias com sintomas",
    "acuteMedication": "Medicamento agudo usado em",
    "occasions": "ocasiões",
    "mild": "Leve",
    "moderate": "Moderado",
    "serious": "Grave",
    "medication": "Medicamento",
    "activity": "Atividade",
    "exacerbation": "Exacerbação",
    "noData": "Sem dados registados para este dia.",
    "loading": "A carregar...",
    "noEntries": "Sem entradas este mês.",
    "entries": "entradas",
    "scoreLabel": "* Pontuação = (leve × 1) + (moderado × 2) + (grave × 3)",
    "avgSymptoms": "Média sintomas",
    "moderateExacerbation": "Exacerbação moderada",
    "seriousExacerbation": "Exacerbação grave",
    "physicalActivity": "Atividade física",
    "notes": "Notas",
    "daysRecorded": "Dias registados",
    "back": "← Voltar",
    "avslutt": "Sair",
    "now": "agora",
    "month": "Data",
    "scoreHeader": "Pontuação*",
    "symptomLog": "Registo de sintomas",
    "invalidCode": "Código inválido",
    "current": "agora",
    "male": "Homem",
    "female": "Mulher",
    "registrations": "registos",
    "logout": "Sair",
    "catScore": "Pontuação CAT",
    "catSubScores": "Sub-pontuações CAT",
    "allRecords": "Todos os registos",
    "monthlySummary": "Resumo mensal",
    "filledDays": "Dias preenchidos",
    "lowImpact": "Baixo (≤10)",
    "mediumImpact": "Médio (11–20)",
    "highImpact": "Alto (21–30)",
    "veryHighImpact": "Muito alto (>30)",
    "low": "Baixo",
    "high": "Alto",
    "veryHigh": "Muito alto",
    "medicines": "Medicamentos",
    "medicineSatisfaction": "Satisfação com medicamentos",
    "anxiety": "Ansiedade",
    "anxietySum": "Pontuação de ansiedade",
    "chooseDay": "Selecione um dia no calendário",
    "registration": "Registo",
    "weight": "Peso",
    "usedMedicines": "Medicamentos usados",
    "note": "Nota",
    "daily": "Diário",
    "asNeeded": "Conforme necessário",
    "from": "desde",
    "stopped": "parado",
    "timesUsed": "× usado",
    "cat8Cough": "Tosse",
    "cat8Phlegm": "Fleuma",
    "cat8ChestTightness": "Aperto no peito",
    "cat8Breathlessness": "Falta de ar",
    "cat8Activities": "Atividades",
    "cat8Confidence": "Confiança",
    "cat8Sleep": "Sono",
    "cat8Energy": "Energia",
    "gad7feelingNervous": "Nervoso/ansioso",
    "gad7noWorryingControl": "Controlo preocupações",
    "gad7worrying": "Preocupação excessiva",
    "gad7troubleRelaxing": "Dificuldade em relaxar",
    "gad7restless": "Irrequieto",
    "gad7easilyAnnoyed": "Facilmente irritado",
    "gad7afraid": "Medo de algo mau",
    "months": "meses",
    "days": [
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb",
        "Dom"
    ],
    "averageMonthly": "Média mensal",
    "showCatScore": "Mostrar pontuação CAT",
    "showExacerbation": "Mostrar exacerbação",
    "showMedicine": "Mostrar medicamento",
    "showNote": "Mostrar notas",
    "showActivity": "Mostrar atividade",
    "showWeight": "Mostrar peso",
    "showIn": "Mostrar no calendário",
    "sessionExpiring": "Você será desconectado em menos de um minuto.",
    "downloadPdf": "Descarregar PDF",
    "reportDate": "Data do relatório",
    "reportTitle": "Relatório de sintomas",
    "hour": "h",
    "week": "Semana",
    "hours": "horas",
    "searchPlaceholder": "Pesquisar...",
    "weeksWithMedicine": "Semanas com medicação",
    "hourSingular": "hora",
    "activityLabels": [
        "Nenhuma",
        "Menos de 1 hora",
        "1–2 horas",
        "2–3 horas",
        "Mais de 3 horas"
    ],
    "monthSingular": "mês",
    "monthNames": [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/InactivityManager.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InactivityManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InactivityWarning$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/InactivityWarning.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LangContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/LangContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$no$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/no.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$en$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/en.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$nl$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/nl.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$fr$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/fr.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$de$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/de.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$it$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/it.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$sv$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/sv.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$da$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/da.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$fi$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/fi.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$es$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/es.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$pl$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/pl.json.[json].cjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$pt$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/messages/pt.json.[json].cjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// src/components/InactivityManager.jsx
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const translations = {
    no: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$no$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    en: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$en$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    nl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$nl$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    fr: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$fr$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    de: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$de$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    it: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$it$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    sv: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$sv$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    da: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$da$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    fi: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$fi$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    es: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$es$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    pl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$pl$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    pt: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$messages$2f$pt$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
};
const SESSION_MS = 10 * 60 * 1000; // 10 min hard limit
const WARNING_MS = 9 * 60 * 1000; //  9 min — show warning
const STORAGE_KEY = "sessionStartAt";
// Pages that require authentication
const PROTECTED = [
    "/dashboard",
    "/log",
    "/summary"
];
function InactivityManager() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LangContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLang"])();
    const t = translations[lang] ?? translations.en;
    const [showWarning, setShowWarning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isProtected = PROTECTED.some((p)=>pathname.startsWith(p));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InactivityManager.useEffect": ()=>{
            if (!isProtected) {
                setShowWarning(false);
                return;
            }
            const logout = {
                "InactivityManager.useEffect.logout": ()=>{
                    sessionStorage.removeItem("patientData");
                    localStorage.removeItem(STORAGE_KEY); // clear so next login starts fresh
                    router.replace("/");
                }
            }["InactivityManager.useEffect.logout"];
            // Record session start time once — do not reset on activity
            let sessionStart = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
            if (!sessionStart) {
                sessionStart = Date.now();
                localStorage.setItem(STORAGE_KEY, String(sessionStart));
            }
            const elapsed = Date.now() - sessionStart;
            const remaining = SESSION_MS - elapsed;
            // Already expired
            if (remaining <= 0) {
                logout();
                return;
            }
            // Schedule warning and logout
            const warnIn = remaining - (SESSION_MS - WARNING_MS);
            const warnTimer = warnIn > 0 ? setTimeout({
                "InactivityManager.useEffect": ()=>setShowWarning(true)
            }["InactivityManager.useEffect"], warnIn) : null;
            const logoutTimer = setTimeout(logout, remaining);
            if (warnIn <= 0) setShowWarning(true);
            return ({
                "InactivityManager.useEffect": ()=>{
                    clearTimeout(warnTimer);
                    clearTimeout(logoutTimer);
                }
            })["InactivityManager.useEffect"];
        }
    }["InactivityManager.useEffect"], [
        isProtected,
        pathname
    ]);
    if (!isProtected) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InactivityWarning$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        show: showWarning,
        onDismiss: ()=>setShowWarning(false),
        t: t
    }, void 0, false, {
        fileName: "[project]/src/components/InactivityManager.jsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(InactivityManager, "JotzdhKui2PLskKdIH2co7V6ou4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LangContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLang"]
    ];
});
_c = InactivityManager;
var _c;
__turbopack_context__.k.register(_c, "InactivityManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0ws1qyk._.js.map