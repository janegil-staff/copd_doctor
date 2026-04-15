"use client";

import { useState } from "react";

// src/components/dashboard/Sidebar.jsx
// Single card, fully translated via t prop, empty sections hidden.

const A      = "#268E86";
const BG     = "rgba(255,255,255,0.92)";
const BO     = "rgba(38,142,134,0.14)";
const TX     = "#1a3a38";
const MU     = "#7a9a98";
const WARN   = "#e8a838";
const DANGER = "#e05050";
const OK     = "#4aba7a";

// ── primitives ───────────────────────────────────────────────────────────────

function Row({ label, value, color }) {
  if (value == null || value === "" || value === "–") return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "4px 0", borderBottom: `1px solid rgba(38,142,134,0.07)`,
    }}>
      <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: color ?? TX, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function Divider({ label, onReadMore, readMoreLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 4px" }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: A,
        textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(38,142,134,0.15)" }} />
      {onReadMore && (
        <button
          onClick={onReadMore}
          style={{
            background: "none", border: "none", padding: 0,
            fontSize: 10, fontWeight: 700, color: A,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            textDecoration: "underline", letterSpacing: 0.3,
          }}
        >
          {readMoreLabel ?? "Read more"}
        </button>
      )}
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(((value ?? 0) / max) * 100)) : 0;
  return (
    <div style={{ height: 4, borderRadius: 3, background: "rgba(38,142,134,0.1)", flex: 1, minWidth: 40, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color ?? A }} />
    </div>
  );
}

function SatDots({ value = 0 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, flexShrink: 0 }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: i < value ? A : "rgba(38,142,134,0.15)",
        }} />
      ))}
    </span>
  );
}

function Chip({ label }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 6px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, marginRight: 3, marginBottom: 2,
      background: A, color: "#fff",
    }}>
      {label}
    </span>
  );
}

// ── Spirometry modal ─────────────────────────────────────────────────────────

function SpirometryModal({ entries, t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: 24,
          width: "100%", maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: TX,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.025em",
          }}>
            {t.sSpirometry ?? "Spirometry"}
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: MU, lineHeight: 1, padding: "0 4px",
          }}>
            ✕
          </button>
        </div>

        {[...entries].reverse().map((entry, i) => (
          <div key={i} style={{
            borderRadius: 10,
            border: "1px solid rgba(38,142,134,0.14)",
            padding: "10px 14px",
            marginBottom: 10,
            background: i === 0 ? "rgba(38,142,134,0.04)" : "#fff",
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: A }}>
              {entry.date ?? "–"}
              {i === 0 && (
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700,
                  background: A, color: "#fff", borderRadius: 20, padding: "1px 8px",
                }}>
                  Latest
                </span>
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {entry.fev1 != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>{t.sFev1 ?? "FEV1"}: </span>
                  <strong>{entry.fev1} L</strong>
                </span>
              )}
              {entry.fvc != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>{t.sFvc ?? "FVC"}: </span>
                  <strong>{entry.fvc} L</strong>
                </span>
              )}
              {entry.fev1fvc != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>{t.sFev1Fvc ?? "FEV1/FVC"}: </span>
                  <strong>{entry.fev1fvc}%</strong>
                </span>
              )}
              {entry.goldGrade != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>{t.sGoldGrade ?? "GOLD grade"}: </span>
                  <strong>{t.sGrade ?? "Grade"} {entry.goldGrade}</strong>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SPO₂ modal ───────────────────────────────────────────────────────────────

function Spo2Modal({ entries, t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: 24,
          width: "100%", maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: TX,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.025em",
          }}>
            {t.sSpo2 ?? "SPO₂"}
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: MU, lineHeight: 1, padding: "0 4px",
          }}>
            ✕
          </button>
        </div>

        {[...entries].reverse().map((entry, i) => {
          const satColor = entry.value < 90 ? DANGER : entry.value < 94 ? WARN : OK;
          return (
            <div key={i} style={{
              borderRadius: 10,
              border: "1px solid rgba(38,142,134,0.14)",
              padding: "10px 14px",
              marginBottom: 10,
              background: i === 0 ? "rgba(38,142,134,0.04)" : "#fff",
            }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: A }}>
                {entry.date ?? "–"}
                {i === 0 && (
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 700,
                    background: A, color: "#fff", borderRadius: 20, padding: "1px 8px",
                  }}>
                    Latest
                  </span>
                )}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "center" }}>
                {entry.value != null && (
                  <span style={{ fontSize: 11, color: TX }}>
                    <span style={{ color: MU, fontWeight: 500 }}>{t.sSaturation ?? "Saturation"}: </span>
                    <strong style={{ color: satColor }}>{entry.value}%</strong>
                  </span>
                )}
                {entry.pulseRate != null && (
                  <span style={{ fontSize: 11, color: TX }}>
                    <span style={{ color: MU, fontWeight: 500 }}>{t.sPulseRate ?? "Pulse rate"}: </span>
                    <strong>{entry.pulseRate} bpm</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nutrition & Weight modal ─────────────────────────────────────────────────

function NutritionWeightModal({ records, t, onClose }) {
  // Build weight history from records (only those with a weight value)
  const weightEntries = [...(records ?? [])]
    .filter(r => r.weight != null)
    .reverse();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: 24,
          width: "100%", maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: TX,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.025em",
          }}>
            {t.sNutritionWeight ?? "Nutrition & Weight"}
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: MU, lineHeight: 1, padding: "0 4px",
          }}>
            ✕
          </button>
        </div>

        {/* Weight history */}
        <p style={{
          margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: A,
          textTransform: "uppercase", letterSpacing: 0.8,
        }}>
          {t.weight ?? "Weight"} ({t.weightLossHistory ?? "History"})
        </p>

        {weightEntries.length === 0 && (
          <p style={{ fontSize: 12, color: MU, textAlign: "center", padding: "16px 0" }}>
            {t.noData ?? "No data recorded."}
          </p>
        )}

        {weightEntries.length > 0 && (() => {
          const hasLoss = weightEntries.some((r, i) => {
            const prev = weightEntries[i + 1];
            return prev && r.weight < prev.weight;
          });
          if (!hasLoss) return (
            <p style={{ fontSize: 12, color: MU, textAlign: "center", padding: "16px 0" }}>
              {t.noWeightLoss ?? "No weight loss"}
            </p>
          );
          return weightEntries.map((r, i) => {
            const prev = weightEntries[i + 1];
            const diff = prev ? r.weight - prev.weight : null;
            const diffColor = diff == null ? MU : diff < 0 ? OK : diff > 0 ? DANGER : MU;
            const diffLabel = diff == null ? "" : diff > 0 ? `+${diff} kg` : `${diff} kg`;
            return (
              <div key={r.date} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 0", borderBottom: "1px solid rgba(38,142,134,0.07)",
              }}>
                <span style={{ fontSize: 11, color: MU }}>{r.date}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {diffLabel ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: diffColor }}>{diffLabel}</span>
                  ) : null}
                  <span style={{ fontSize: 12, fontWeight: 700, color: TX }}>{r.weight} kg</span>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

// ── Score modal ───────────────────────────────────────────────────────────────


const SCORE_LABELS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function ScoreModal({ title, date, questions, data, score, max, sev, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: 24,
          width: "100%", maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{
              margin: 0, fontSize: 18, fontWeight: 700, color: TX,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.025em",
            }}>
              {title}
            </h3>
            {date && <p style={{ margin: "2px 0 0", fontSize: 11, color: MU }}>{date}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: MU, lineHeight: 1, padding: "0 4px",
          }}>
            ✕
          </button>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: `${sev.color}18`, borderRadius: 10,
          padding: "10px 14px", marginBottom: 16,
        }}>
          <div style={{ flex: 1 }}><Bar value={score} max={max} color={sev.color} /></div>
          <span style={{ fontSize: 15, fontWeight: 800, color: sev.color, flexShrink: 0 }}>
            {score} / {max}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#fff",
            background: sev.color, borderRadius: 20,
            padding: "2px 10px", flexShrink: 0,
          }}>
            {sev.label}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {questions.map(({ key, label }) => {
            const val = data[key] ?? 0;
            const scoreColor = val === 0 ? OK : val === 1 ? WARN : val === 2 ? "#e07a30" : DANGER;
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 0", borderBottom: "1px solid rgba(38,142,134,0.07)",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, color: TX, fontWeight: 500 }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: MU }}>{SCORE_LABELS[val] ?? "–"}</p>
                </div>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: scoreColor, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── question definitions ──────────────────────────────────────────────────────

const GAD7_QUESTIONS = [
  { key: "feelingNervous",    label: "Feeling nervous, anxious or on edge" },
  { key: "noWorryingControl", label: "Not being able to stop or control worrying" },
  { key: "worrying",          label: "Worrying too much about different things" },
  { key: "troubleRelaxing",   label: "Trouble relaxing" },
  { key: "restless",          label: "Being so restless that it is hard to sit still" },
  { key: "easilyAnnoyed",     label: "Becoming easily annoyed or irritable" },
  { key: "afraid",            label: "Feeling afraid as if something awful might happen" },
];

const PHQ9_QUESTIONS = [
  { key: "noPleasureDoingThings",   label: "Little interest or pleasure in doing things" },
  { key: "depressed",               label: "Feeling down, depressed, or hopeless" },
  { key: "stayingAsleep",           label: "Trouble falling or staying asleep, or sleeping too much" },
  { key: "noEnergy",                label: "Feeling tired or having little energy" },
  { key: "noAppetite",              label: "Poor appetite or overeating" },
  { key: "selfPity",                label: "Feeling bad about yourself — or that you are a failure" },
  { key: "troubleConcentration",    label: "Trouble concentrating on things" },
  { key: "slowMovingSpeeking",      label: "Moving or speaking so slowly that other people could have noticed" },
  { key: "suicidal",                label: "Thoughts that you would be better off dead or of hurting yourself" },
];

// ── score helpers ─────────────────────────────────────────────────────────────

const GAD7_KEYS = GAD7_QUESTIONS.map(q => q.key);
const PHQ9_KEYS = PHQ9_QUESTIONS.map(q => q.key);

function sumKeys(obj, keys) {
  if (!obj) return null;
  return keys.reduce((s, k) => s + (obj[k] ?? 0), 0);
}

function gad7Sev(s, t) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4)  return { label: t.sSevMinimal  ?? "Minimal",    color: OK };
  if (s <= 9)  return { label: t.sSevMild     ?? "Mild",       color: WARN };
  if (s <= 14) return { label: t.sSevModerate ?? "Moderate",   color: "#e07a30" };
  return            { label: t.sSevSevere    ?? "Severe",      color: DANGER };
}

function phq9Sev(s, t) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4)  return { label: t.sSevNone      ?? "None",        color: OK };
  if (s <= 9)  return { label: t.sSevMild      ?? "Mild",        color: WARN };
  if (s <= 14) return { label: t.sSevModerate  ?? "Moderate",    color: "#e07a30" };
  if (s <= 19) return { label: t.sSevModSevere ?? "Mod-severe",  color: DANGER };
  return            { label: t.sSevSevere     ?? "Severe",       color: DANGER };
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Sidebar({ patient, t = {} }) {
  if (!patient) return null;

  const [showSpirometryModal, setShowSpirometryModal] = useState(false);
  const [showSpo2Modal, setShowSpo2Modal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showGad7Modal, setShowGad7Modal] = useState(false);
  const [showPhq9Modal, setShowPhq9Modal] = useState(false);

  const copdDiagnosed     = patient.copdDiagnosed     ?? false;
  const copdDiagnosedDate = patient.copdDiagnosedDate ?? null;
  const asthma            = patient.asthma            ?? false;
  const asthmaDate        = patient.asthmaDate        ?? null;
  const spirometry        = Array.isArray(patient.spirometry)    ? patient.spirometry    : [];
  const spo2arr           = Array.isArray(patient.spo2)          ? patient.spo2          : [];
  const vaccinations      = Array.isArray(patient.vaccinations)  ? patient.vaccinations  : [];
  const userMedicines     = Array.isArray(patient.userMedicines) ? patient.userMedicines : [];
  const medicines         = Array.isArray(patient.medicines)     ? patient.medicines     : [];
  const smoking           = patient.smoking           ?? null;
  const vaping            = patient.vaping            ?? null;
  const latestGad7        = patient.latestGad7        ?? null;
  const latestPhq9        = patient.latestPhq9        ?? null;
  const records           = Array.isArray(patient.records) ? patient.records : [];
  const latestAlpha1      = patient.latestAlpha1      ?? null;
  const medSat            = patient.latestMedicineSatisfaction ?? null;
  const medTrain          = patient.latestMedicineTraining     ?? null;
  const cond              = patient.latestRelevantConditions   ?? null;

  const today      = new Date().toISOString().slice(0, 10);
  const activeMeds = userMedicines.filter(m => !m.stoppedUsage || m.stoppedUsage >= today);
  const latestVax  = vaccinations.length ? vaccinations[vaccinations.length - 1] : null;
  const latestSpiro = spirometry.length  ? spirometry[spirometry.length - 1]     : null;
  const latestSpo2v = spo2arr.length     ? spo2arr[spo2arr.length - 1]           : null;

  const gad7Score = sumKeys(latestGad7, GAD7_KEYS);
  const phq9Score = sumKeys(latestPhq9, PHQ9_KEYS);
  const gSev = gad7Sev(gad7Score, t);
  const pSev = phq9Sev(phq9Score, t);

  const satMap = {};
  ((medSat?.medicines) ?? []).forEach(m => { satMap[m.medicineId] = m.satisfaction; });

  const medName = (id) => {
    const um = userMedicines.find(m => m.medicineId === id);
    if (um?.medicine?.name) return um.medicine.name;
    return medicines.find(m => m.id === id)?.name ?? `Med #${id}`;
  };

  const SMOKE_LABEL = {
    0: t.sNever         ?? "Never",
    1: t.sExSmoker      ?? "Ex-smoker",
    2: t.sCurrentSmoker ?? "Current smoker",
    3: t.sPassive       ?? "Passive",
  };
  const SMOKE_COLOR = { 0: OK, 1: WARN, 2: DANGER, 3: WARN };

  const VAPE_LABEL = {
    0: t.sNeverVaped   ?? "Never",
    1: t.sExVaper      ?? "Ex-vaper",
    2: t.sCurrentVaper ?? "Current vaper",
  };
  const VAPE_COLOR = { 0: OK, 1: WARN, 2: DANGER };

  const MED_TYPE   = { 1: "Inhaler", 2: "Tablet", 3: "Injection" };
  const MED_REASON = { 0: "Rescue", 1: "Maintenance", 2: "Add-on" };

  const VAX_FIELDS = [
    { key: "flue",      label: t.sInfluenza    ?? "Influenza" },
    { key: "covid",     label: t.sCovid        ?? "COVID-19" },
    { key: "pneumococ", label: t.sPneumococcal ?? "Pneumococcal" },
    { key: "herpes",    label: t.sHerpes       ?? "Herpes zoster" },
    { key: "rs",        label: t.sRsv          ?? "RSV" },
    { key: "pertussis", label: t.sPertussis    ?? "Pertussis" },
  ];

  const TRAINING_KEYS = [
    { key: "generalPractitioner",    label: t.sGp             ?? "GP" },
    { key: "pharmacy",               label: t.sPharmacy       ?? "Pharmacy" },
    { key: "homeCareNurse",          label: t.sHomeCareNurse  ?? "Home nurse" },
    { key: "rehabilitationCenter",   label: t.sRehab          ?? "Rehab" },
    { key: "hospitalLungSpecialist", label: t.sLungSpecialist ?? "Lung specialist" },
    { key: "trainingVideo",          label: t.sVideo          ?? "Video" },
  ];

  const COND_FIELDS = [
    { key: "heartFailure",      label: t.sHeartFailure      ?? "Heart failure" },
    { key: "highBloodPressure", label: t.sHighBloodPressure ?? "Hypertension" },
    { key: "kidneyFailure",     label: t.sKidneyFailure     ?? "Kidney failure" },
    { key: "cardiacArrhythmia", label: t.sCardiacArrhythmia ?? "Arrhythmia" },
    { key: "diabetes",          label: t.sDiabetes          ?? "Diabetes" },
    { key: "osteoporosis",      label: t.sOsteoporosis      ?? "Osteoporosis" },
    { key: "anxietyDepression", label: t.sAnxietyDepression ?? "Anxiety / Depression" },
    { key: "acidRefluxGerd",    label: t.sAcidReflux        ?? "Acid reflux (GERD)" },
    { key: "sleepApnea",        label: t.sSleepApnea        ?? "Sleep apnea" },
  ];

  const activeConditions = cond ? COND_FIELDS.filter(c => cond[c.key]) : [];
  const activeVax        = latestVax ? VAX_FIELDS.filter(f => latestVax[f.key]) : [];
  const readMoreLabel    = t.sReadMore ?? "Read more";

  return (
    <>
      {showNutritionModal && (
        <NutritionWeightModal
          records={records}
          t={t}
          onClose={() => setShowNutritionModal(false)}
        />
      )}
            {showSpo2Modal && spo2arr.length > 0 && (
        <Spo2Modal
          entries={spo2arr}
          t={t}
          onClose={() => setShowSpo2Modal(false)}
        />
      )}
            {showSpirometryModal && spirometry.length > 0 && (
        <SpirometryModal
          entries={spirometry}
          t={t}
          onClose={() => setShowSpirometryModal(false)}
        />
      )}
            {showGad7Modal && latestGad7 && (
        <ScoreModal
          title={t.sGad7 ?? "GAD-7 · Anxiety"}
          date={latestGad7.date}
          questions={GAD7_QUESTIONS}
          data={latestGad7}
          score={gad7Score}
          max={21}
          sev={gSev}
          onClose={() => setShowGad7Modal(false)}
        />
      )}
      {showPhq9Modal && latestPhq9 && (
        <ScoreModal
          title={t.sPhq9 ?? "PHQ-9 · Depression"}
          date={latestPhq9.date}
          questions={PHQ9_QUESTIONS}
          data={latestPhq9}
          score={phq9Score}
          max={27}
          sev={pSev}
          onClose={() => setShowPhq9Modal(false)}
        />
      )}

      <aside style={{
        width: "100%", maxWidth: "100%", flexShrink: 0,
        paddingBottom: 0, display: "flex", flexDirection: "column", flex: 1,
      }}>
        <div style={{
          background: BG, backdropFilter: "blur(14px)",
          border: `1px solid ${BO}`, borderRadius: 20,
          overflow: "hidden",
          flex: 1, display: "flex", flexDirection: "column",
        }}>

          {/* ── Header ── */}
          <div style={{ padding: "16px 16px 0" }}>
            <h1 style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 700,
              margin: "0 0 16px 0",
              color: A,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              {t.patientInformation ?? "Patient Information"}
            </h1>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ padding: "0 14px 12px", overflowY: "auto", flex: 1 }}>

            {/* ── Diagnosis ──────────────────────────────────────────────────── */}
            <Divider label={t.sDiagnosis ?? "Diagnosis"} />
            <Row
              label={t.sCopd ?? "COPD"}
              value={copdDiagnosed
                ? `${t.sConfirmed ?? "Confirmed"} · ${copdDiagnosedDate ?? ""}`
                : t.sNotConfirmed ?? "Not confirmed"}
              color={copdDiagnosed ? OK : MU}
            />
            <Row
              label={t.sAsthma ?? "Asthma"}
              value={asthma
                ? `${t.sConfirmed ?? "Confirmed"} · ${asthmaDate ?? ""}`
                : t.sNotConfirmed ?? "Not confirmed"}
              color={asthma ? WARN : MU}
            />

            {/* ── Spirometry ─────────────────────────────────────────────────── */}
            {latestSpiro && (
              <>
                <Divider label={t.sSpirometry ?? "Spirometry"} onReadMore={() => setShowSpirometryModal(true)} readMoreLabel={readMoreLabel} />
                {latestSpiro.date && (
                  <Row label={t.reportDate ?? "Date"} value={latestSpiro.date} />
                )}
                {latestSpiro.fev1 != null && (
                  <Row
                    label={t.sFev1 ?? "FEV1"}
                    value={`${latestSpiro.fev1} L`}
                    color={latestSpiro.fev1 < 1.5 ? DANGER : latestSpiro.fev1 < 2.5 ? WARN : OK}
                  />
                )}
                {latestSpiro.fvc != null && (
                  <Row label={t.sFvc ?? "FVC"} value={`${latestSpiro.fvc} L`} />
                )}
                {latestSpiro.fev1fvc != null && (
                  <Row
                    label={t.sFev1Fvc ?? "FEV1/FVC"}
                    value={`${latestSpiro.fev1fvc}%`}
                    color={latestSpiro.fev1fvc < 70 ? DANGER : OK}
                  />
                )}
                {latestSpiro.goldGrade != null && (
                  <Row
                    label={t.sGoldGrade ?? "GOLD grade"}
                    value={`${t.sGrade ?? "Grade"} ${latestSpiro.goldGrade}`}
                    color={[OK, WARN, "#e07a30", DANGER, DANGER][latestSpiro.goldGrade] ?? TX}
                  />
                )}
              </>
            )}

            {/* ── SPO2 ───────────────────────────────────────────────────────── */}
            {latestSpo2v && (
              <>
                <Divider label={t.sSpo2 ?? "SPO₂"} onReadMore={() => setShowSpo2Modal(true)} readMoreLabel={readMoreLabel} />
                {latestSpo2v.value != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
                    borderBottom: "1px solid rgba(38,142,134,0.07)" }}>
                    <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                      {t.sSaturation ?? "Saturation"}
                    </span>
                    <Bar value={latestSpo2v.value - 80} max={20}
                      color={latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK} />
                    <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0,
                      color: latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK }}>
                      {latestSpo2v.value}%
                    </span>
                  </div>
                )}
                {latestSpo2v.pulseRate != null && (
                  <Row label={t.sPulseRate ?? "Pulse rate"} value={`${latestSpo2v.pulseRate} bpm`} />
                )}
              </>
            )}

            {/* ── Smoking ────────────────────────────────────────────────────── */}
            {smoking && (
              <>
                <Divider label={t.sSmoking ?? "Smoking"} />
                <Row label={t.sStatus ?? "Status"}
                  value={SMOKE_LABEL[smoking.smoking] ?? "–"}
                  color={SMOKE_COLOR[smoking.smoking] ?? MU} />
                {smoking.smoking === 1 && smoking.startAge > 0 && (
                  <Row label={t.sSmokedAges ?? "Smoked ages"}
                    value={`${smoking.startAge} – ${smoking.endAge}`} />
                )}
                {smoking.smoking === 2 && smoking.frequency > 0 && (
                  <Row label={t.sCigarettesDay ?? "Cigarettes / day"}
                    value={smoking.frequency} color={DANGER} />
                )}
              </>
            )}

            {/* ── Vaping ─────────────────────────────────────────────────────── */}
            {vaping && vaping.vaping !== 0 && (
              <>
                <Divider label={t.sVaping ?? "Vaping"} />
                <Row label={t.sStatus ?? "Status"}
                  value={VAPE_LABEL[vaping.vaping] ?? "–"}
                  color={VAPE_COLOR[vaping.vaping] ?? MU} />
              </>
            )}

            {/* ── Vaccinations ───────────────────────────────────────────────── */}
            {activeVax.length > 0 && (
              <>
                <Divider label={t.sVaccinations ?? "Vaccinations"} />
                {activeVax.map(({ key, label }) => (
                  <Row key={key} label={label} value="✓" color={OK} />
                ))}
              </>
            )}

            {/* ── Nutrition & Weight ─────────────────────────────────────────── */}
            {records.some(r => r.weight != null) && (
              <>
                <Divider label={t.sNutritionWeight ?? "Nutrition & Weight"} onReadMore={() => setShowNutritionModal(true)} readMoreLabel={readMoreLabel} />
                {(() => {
                  const withWeight = records.filter(r => r.weight != null);
                  if (!withWeight.length) return null;
                  const latestW = withWeight[withWeight.length - 1];
                  const prevW   = withWeight.length > 1 ? withWeight[withWeight.length - 2] : null;
                  const diff    = prevW ? latestW.weight - prevW.weight : null;
                  const diffStr = diff == null ? "" : diff < 0 ? ` (${diff} kg)` : diff > 0 ? ` (+${diff} kg)` : "";
                  const color   = diff == null ? undefined : diff < 0 ? OK : diff > 0 ? DANGER : undefined;
                  return (
                    <Row
                      label={t.weight ?? "Weight"}
                      value={`${latestW.weight} kg${diffStr}`}
                      color={color}
                    />
                  );
                })()}
              </>
            )}

            {/* ── Alpha-1 ────────────────────────────────────────────────────── */}
            {latestAlpha1 && (
              <>
                <Divider label={t.sAlpha1 ?? "Alpha-1 Antitrypsin"} />
                <Row
                  label={t.sAlpha1 ?? "Alpha-1 Antitrypsin"}
                  value={(() => {
                    if (!latestAlpha1.alpha1Tested) return t.sNotTested ?? "Not tested";
                    if (latestAlpha1.alpha1Result == null) return t.sTested ?? "Tested";
                    return latestAlpha1.alpha1Result === 0
                      ? t.sNegative ?? "Negative"
                      : t.sPositive ?? "Positive";
                  })()}
                  color={(() => {
                    if (!latestAlpha1.alpha1Tested) return DANGER;
                    return OK;
                  })()}
                />
              </>
            )}

            {/* ── Comorbidities ──────────────────────────────────────────────── */}
            {activeConditions.length > 0 && (
              <>
                <Divider label={t.sComorbidities ?? "Comorbidities"} />
                {activeConditions.map(c => (
                  <Row key={c.key} label={c.label} value={t.sYes ?? "Yes"} color={DANGER} />
                ))}
              </>
            )}

            {/* ── GAD-7 ──────────────────────────────────────────────────────── */}
            {latestGad7 && (
              <>
                <Divider
                  label={t.sGad7 ?? "GAD-7 · Anxiety"}
                  onReadMore={() => setShowGad7Modal(true)}
                  readMoreLabel={readMoreLabel}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
                  borderBottom: "1px solid rgba(38,142,134,0.07)" }}>
                  <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                    {t.sScore ?? "Score"}
                  </span>
                  <Bar value={gad7Score} max={21} color={gSev.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: gSev.color, flexShrink: 0 }}>
                    {gad7Score}{" "}
                    <span style={{ fontSize: 10, fontWeight: 500 }}>({gSev.label})</span>
                  </span>
                </div>
              </>
            )}

            {/* ── PHQ-9 ──────────────────────────────────────────────────────── */}
            {latestPhq9 && (
              <>
                <Divider
                  label={t.sPhq9 ?? "PHQ-9 · Depression"}
                  onReadMore={() => setShowPhq9Modal(true)}
                  readMoreLabel={readMoreLabel}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
                  borderBottom: "1px solid rgba(38,142,134,0.07)" }}>
                  <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                    {t.sScore ?? "Score"}
                  </span>
                  <Bar value={phq9Score} max={27} color={pSev.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: pSev.color, flexShrink: 0 }}>
                    {phq9Score}{" "}
                    <span style={{ fontSize: 10, fontWeight: 500 }}>({pSev.label})</span>
                  </span>
                </div>
              </>
            )}

            {/* ── Medication ─────────────────────────────────────────────────── */}
            {activeMeds.length > 0 && (
              <>
                <Divider label={t.sMedication ?? "Medication"} />
                {activeMeds.map((um) => (
                  <div key={um.medicineId} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 0", borderBottom: "1px solid rgba(38,142,134,0.07)",
                  }}>
                    {um.medicine?.image ? (
                      <img src={um.medicine.image} alt={um.medicine.name ?? ""}
                        style={{ width: 26, height: 26, objectFit: "contain", borderRadius: 6,
                          border: `1px solid ${BO}`, background: "#fff", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        background: "rgba(38,142,134,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                        💊
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: TX, margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {medName(um.medicineId)}
                      </p>
                      <p style={{ fontSize: 10, color: MU, margin: 0 }}>
                        {MED_TYPE[um.medicine?.type] ?? ""}
                        {um.reason != null ? ` · ${MED_REASON[um.reason]}` : ""}
                        {um.startedUsage ? ` · ${um.startedUsage}` : ""}
                      </p>
                    </div>
                    {satMap[um.medicineId] != null && (
                      <SatDots value={satMap[um.medicineId]} />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* ── Medication Training ────────────────────────────────────────── */}
            {(() => {
              const entries = (medTrain?.medicines ?? [])
                .map(entry => ({ entry, sources: TRAINING_KEYS.filter(k => entry[k.key] === true) }))
                .filter(({ sources }) => sources.length > 0);
              if (entries.length === 0) return null;
              return (
                <>
                  <Divider label={t.sTraining ?? "Training"} />
                  {entries.map(({ entry, sources }) => (
                    <div key={entry.medicineId} style={{
                      padding: "4px 0", borderBottom: "1px solid rgba(38,142,134,0.07)",
                    }}>
                      <span style={{ fontSize: 10, color: MU, fontWeight: 500 }}>
                        {medName(entry.medicineId)}
                      </span>
                      <div style={{ marginTop: 2 }}>
                        {sources.map(s => <Chip key={s.key} label={s.label} />)}
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

          </div>
        </div>
      </aside>
    </>
  );
}