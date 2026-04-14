"use client";

// src/components/dashboard/Sidebar.jsx
// Single card, no section headlines, key→value rows, empty data hidden.

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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "4px 0",
      borderBottom: `1px solid rgba(38,142,134,0.07)`,
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

function Divider({ label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 0 4px",
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: A,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `rgba(38,142,134,0.15)` }} />
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(((value ?? 0) / max) * 100)) : 0;
  return (
    <div style={{
      height: 4, borderRadius: 3,
      background: "rgba(38,142,134,0.1)",
      flex: 1, minWidth: 40, overflow: "hidden",
    }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        borderRadius: 3, background: color ?? A,
      }} />
    </div>
  );
}

function Squares({ value = 0 }) {
  const clr = (i) => {
    if (i > value) return "rgba(38,142,134,0.1)";
    if (i <= 1) return OK;
    if (i === 2) return WARN;
    return DANGER;
  };
  return (
    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: clr(i) }} />
      ))}
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

// ── score helpers ─────────────────────────────────────────────────────────────

const GAD7_FIELDS = [
  { key: "feelingNervous",     label: "Nervous / anxious" },
  { key: "noWorryingControl",  label: "Uncontrollable worry" },
  { key: "worrying",           label: "Worrying too much" },
  { key: "troubleRelaxing",    label: "Trouble relaxing" },
  { key: "restless",           label: "Restless" },
  { key: "easilyAnnoyed",      label: "Easily annoyed" },
  { key: "afraid",             label: "Feeling afraid" },
];

const PHQ9_FIELDS = [
  { key: "noPleasureDoingThings", label: "No pleasure" },
  { key: "depressed",             label: "Depressed / hopeless" },
  { key: "stayingAsleep",         label: "Sleep problems" },
  { key: "noEnergy",              label: "Low energy" },
  { key: "noAppetite",            label: "Poor appetite" },
  { key: "selfPity",              label: "Self-criticism" },
  { key: "troubleConcentration",  label: "Concentration" },
  { key: "slowMovingSpeeking",    label: "Slow / agitated" },
  { key: "suicidal",              label: "Suicidal thoughts", alert: true },
];

function sumFields(obj, fields) {
  if (!obj) return null;
  return fields.reduce((s, f) => s + (obj[f.key] ?? 0), 0);
}

function gad7Sev(s) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4)  return { label: "Minimal",  color: OK };
  if (s <= 9)  return { label: "Mild",     color: WARN };
  if (s <= 14) return { label: "Moderate", color: "#e07a30" };
  return            { label: "Severe",     color: DANGER };
}

function phq9Sev(s) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4)  return { label: "None",       color: OK };
  if (s <= 9)  return { label: "Mild",       color: WARN };
  if (s <= 14) return { label: "Moderate",   color: "#e07a30" };
  if (s <= 19) return { label: "Mod-severe", color: DANGER };
  return            { label: "Severe",       color: DANGER };
}

// ── lookup tables ─────────────────────────────────────────────────────────────

const SMOKE_LABEL = { 0: "Never", 1: "Ex-smoker", 2: "Current smoker", 3: "Passive" };
const SMOKE_COLOR = { 0: OK, 1: WARN, 2: DANGER, 3: WARN };
const VAPE_LABEL  = { 0: "Never", 1: "Ex-vaper", 2: "Current vaper" };
const VAPE_COLOR  = { 0: OK, 1: WARN, 2: DANGER };
const NUTR_LABEL  = { 1: "Very poor", 2: "Poor", 3: "Moderate", 4: "Good", 5: "Excellent" };
const NUTR_COLOR  = (v) => (!v || v <= 2) ? DANGER : v === 3 ? WARN : OK;
const MED_TYPE    = { 1: "Inhaler", 2: "Tablet", 3: "Injection" };
const MED_REASON  = { 0: "Rescue", 1: "Maintenance", 2: "Add-on" };

const VAX_FIELDS = [
  { key: "flue",       label: "Influenza" },
  { key: "covid",      label: "COVID-19" },
  { key: "pneumococ",  label: "Pneumococcal" },
  { key: "herpes",     label: "Herpes zoster" },
  { key: "rs",         label: "RSV" },
  { key: "pertussis",  label: "Pertussis" },
];

const TRAINING_KEYS = [
  { key: "generalPractitioner",    label: "GP" },
  { key: "pharmacy",               label: "Pharmacy" },
  { key: "homeCareNurse",          label: "Home nurse" },
  { key: "rehabilitationCenter",   label: "Rehab" },
  { key: "hospitalLungSpecialist", label: "Lung specialist" },
  { key: "trainingVideo",          label: "Video" },
];

// ── main ──────────────────────────────────────────────────────────────────────

export default function Sidebar({ patient, t = {} }) {
  if (!patient) return null;

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
  const latestNutrition   = patient.latestNutrition   ?? null;
  const latestAlpha1      = patient.latestAlpha1      ?? null;
  const medSat            = patient.latestMedicineSatisfaction ?? null;
  const medTrain          = patient.latestMedicineTraining     ?? null;
  const cond              = patient.latestRelevantConditions   ?? null;

  const today       = new Date().toISOString().slice(0, 10);
  const activeMeds  = userMedicines.filter(m => !m.stoppedUsage || m.stoppedUsage >= today);
  const latestVax   = vaccinations.length ? vaccinations[vaccinations.length - 1] : null;
  const latestSpiro = spirometry.length   ? spirometry[spirometry.length - 1]     : null;
  const latestSpo2v = spo2arr.length      ? spo2arr[spo2arr.length - 1]           : null;

  const gad7Score = sumFields(latestGad7, GAD7_FIELDS);
  const phq9Score = sumFields(latestPhq9, PHQ9_FIELDS);
  const gSev = gad7Sev(gad7Score);
  const pSev = phq9Sev(phq9Score);

  const satMap = {};
  ((medSat?.medicines) ?? []).forEach(m => { satMap[m.medicineId] = m.satisfaction; });

  const medName = (id) => {
    const um = userMedicines.find(m => m.medicineId === id);
    if (um?.medicine?.name) return um.medicine.name;
    return medicines.find(m => m.id === id)?.name ?? `Med #${id}`;
  };

  // comorbidities that are true
  const activeConditions = cond ? [
    { key: "heartFailure",       label: "Heart failure" },
    { key: "highBloodPressure",  label: "Hypertension" },
    { key: "kidneyFailure",      label: "Kidney failure" },
    { key: "cardiacArrhythmia",  label: "Arrhythmia" },
    { key: "diabetes",           label: "Diabetes" },
    { key: "osteoporosis",       label: "Osteoporosis" },
    { key: "anxietyDepression",  label: "Anxiety / Depression" },
    { key: "acidRefluxGerd",     label: "Acid reflux (GERD)" },
    { key: "sleepApnea",         label: "Sleep apnea" },
  ].filter(c => cond[c.key]) : [];

  // vaccinations that are true
  const activeVax = latestVax
    ? VAX_FIELDS.filter(f => latestVax[f.key])
    : [];

  return (
    <aside style={{
      width: "100%", maxWidth: "100%", flexShrink: 0,
      paddingBottom: 0, display: "flex", flexDirection: "column", flex: 1,
    }}>

      {/* Single card */}
      <div style={{
        background: BG,
        backdropFilter: "blur(14px)",
        border: `1px solid ${BO}`,
        borderRadius: 16,
        padding: "12px 14px 12px",
        flex: 1,                   // fills remaining height
        overflowY: "auto",
      }}>

        {/* Headline */}
        <h2 style={{
          fontSize: 14, fontWeight: 800, color: TX,
          margin: "0 0 8px 0", letterSpacing: 0.2,
          fontFamily: "'Playfair Display', Georgia, serif",
        }}>
          {t.patientInformation ?? "Patient Information"}
        </h2>

        {/* ── Diagnosis ──────────────────────────────────────────────────── */}
        <Divider label="Diagnosis" />
        <Row
          label="COPD"
          value={copdDiagnosed ? `Confirmed · ${copdDiagnosedDate ?? ""}` : "Not confirmed"}
          color={copdDiagnosed ? OK : MU}
        />
        {asthma && (
          <Row label="Asthma" value={`Yes · ${asthmaDate ?? ""}`} color={WARN} />
        )}

        {/* ── Comorbidities ──────────────────────────────────────────────── */}
        {activeConditions.length > 0 && (
          <>
            <Divider label="Comorbidities" />
            {activeConditions.map(c => (
              <Row key={c.key} label={c.label} value="Yes" color={DANGER} />
            ))}
          </>
        )}

        {/* ── Spirometry ─────────────────────────────────────────────────── */}
        {latestSpiro && (
          <>
            <Divider label="Spirometry" />
            {latestSpiro.fev1 != null && (
              <Row label="FEV1 (%pred)" value={`${latestSpiro.fev1}%`}
                color={latestSpiro.fev1 < 50 ? DANGER : latestSpiro.fev1 < 80 ? WARN : OK} />
            )}
            {latestSpiro.fvc != null && (
              <Row label="FVC (%pred)" value={`${latestSpiro.fvc}%`} />
            )}
            {latestSpiro.fev1fvc != null && (
              <Row label="FEV1/FVC" value={`${latestSpiro.fev1fvc}%`}
                color={latestSpiro.fev1fvc < 70 ? DANGER : OK} />
            )}
            {latestSpiro.goldGrade != null && (
              <Row label="GOLD grade" value={`Grade ${latestSpiro.goldGrade}`}
                color={[OK, WARN, "#e07a30", DANGER, DANGER][latestSpiro.goldGrade] ?? TX} />
            )}
          </>
        )}

        {/* ── SPO2 ───────────────────────────────────────────────────────── */}
        {latestSpo2v && (
          <>
            <Divider label="SPO₂" />
            {latestSpo2v.value != null && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                  <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                    Saturation
                  </span>
                  <Bar value={latestSpo2v.value - 80} max={20}
                    color={latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK} />
                  <span style={{
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    color: latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK,
                  }}>
                    {latestSpo2v.value}%
                  </span>
                </div>
              </>
            )}
            {latestSpo2v.pulseRate != null && (
              <Row label="Pulse rate" value={`${latestSpo2v.pulseRate} bpm`} />
            )}
          </>
        )}

        {/* ── Smoking ────────────────────────────────────────────────────── */}
        {smoking && (
          <>
            <Divider label="Smoking" />
            <Row label="Status" value={SMOKE_LABEL[smoking.smoking] ?? "–"}
              color={SMOKE_COLOR[smoking.smoking] ?? MU} />
            {smoking.smoking === 1 && smoking.startAge > 0 && (
              <Row label="Smoked ages" value={`${smoking.startAge} – ${smoking.endAge}`} />
            )}
            {smoking.smoking === 2 && smoking.frequency > 0 && (
              <Row label="Cigarettes / day" value={smoking.frequency} color={DANGER} />
            )}
          </>
        )}

        {/* ── Vaping ─────────────────────────────────────────────────────── */}
        {vaping && vaping.vaping !== 0 && (
          <>
            <Divider label="Vaping" />
            <Row label="Status" value={VAPE_LABEL[vaping.vaping] ?? "–"}
              color={VAPE_COLOR[vaping.vaping] ?? MU} />
          </>
        )}

        {/* ── Vaccinations ───────────────────────────────────────────────── */}
        {activeVax.length > 0 && (
          <>
            <Divider label="Vaccinations" />
            {activeVax.map(({ key, label }) => (
              <Row key={key} label={label} value="✓" color={OK} />
            ))}
          </>
        )}

        {/* ── GAD-7 ──────────────────────────────────────────────────────── */}
        {latestGad7 && (
          <>
            <Divider label="GAD-7 · Anxiety" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
              borderBottom: `1px solid rgba(38,142,134,0.07)` }}>
              <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                Score
              </span>
              <Bar value={gad7Score} max={21} color={gSev.color} />
              <span style={{ fontSize: 11, fontWeight: 700, color: gSev.color, flexShrink: 0 }}>
                {gad7Score} <span style={{ fontSize: 10, fontWeight: 500 }}>({gSev.label})</span>
              </span>
            </div>

          </>
        )}

        {/* ── PHQ-9 ──────────────────────────────────────────────────────── */}
        {latestPhq9 && (
          <>
            <Divider label="PHQ-9 · Depression" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
              borderBottom: `1px solid rgba(38,142,134,0.07)` }}>
              <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                Score
              </span>
              <Bar value={phq9Score} max={27} color={pSev.color} />
              <span style={{ fontSize: 11, fontWeight: 700, color: pSev.color, flexShrink: 0 }}>
                {phq9Score} <span style={{ fontSize: 10, fontWeight: 500 }}>({pSev.label})</span>
              </span>
            </div>

          </>
        )}

        {/* ── Nutrition ──────────────────────────────────────────────────── */}
        {latestNutrition && (
          <>
            <Divider label="Nutrition" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 10 }}>
                Status
              </span>
              <Bar value={latestNutrition.value} max={5} color={NUTR_COLOR(latestNutrition.value)} />
              <span style={{ fontSize: 11, fontWeight: 700,
                color: NUTR_COLOR(latestNutrition.value), flexShrink: 0, whiteSpace: "nowrap" }}>
                {NUTR_LABEL[latestNutrition.value] ?? "–"}
              </span>
            </div>
          </>
        )}

        {/* ── Alpha-1 ────────────────────────────────────────────────────── */}
        {latestAlpha1 && (
          <>
            <Divider label="Alpha-1 Antitrypsin" />
            <Row label="Tested" value={latestAlpha1.alpha1Tested ? "Yes" : "Not tested"}
              color={latestAlpha1.alpha1Tested ? TX : MU} />
            {latestAlpha1.alpha1Tested && latestAlpha1.alpha1Result != null && (
              <Row label="Result"
                value={latestAlpha1.alpha1Result === 0 ? "Normal" : `Deficient (${latestAlpha1.alpha1Result})`}
                color={latestAlpha1.alpha1Result === 0 ? OK : DANGER} />
            )}
          </>
        )}

        {/* ── Medication ─────────────────────────────────────────────────── */}
        {activeMeds.length > 0 && (
          <>
            <Divider label="Medication" />
            {activeMeds.map((um) => (
              <div key={um.medicineId} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 0", borderBottom: `1px solid rgba(38,142,134,0.07)`,
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
              <Divider label="Training" />
              {entries.map(({ entry, sources }) => (
                <div key={entry.medicineId} style={{
                  padding: "4px 0", borderBottom: `1px solid rgba(38,142,134,0.07)`,
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
    </aside>
  );
}