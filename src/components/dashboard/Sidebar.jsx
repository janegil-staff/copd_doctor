"use client";

// src/components/dashboard/Sidebar.jsx
// Always-visible right sidebar — 13 annual-control sections.
// Fully responsive: stacks below calendar on mobile, side-by-side on lg+.

const A      = "#268E86";
const BG     = "rgba(255,255,255,0.92)";
const BO     = "rgba(38,142,134,0.14)";
const TX     = "#1a3a38";
const MU     = "#7a9a98";
const WARN   = "#e8a838";
const DANGER = "#e05050";
const OK     = "#4aba7a";

// ── tiny shared primitives ───────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: BG,
      backdropFilter: "blur(14px)",
      border: `1px solid ${BO}`,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 10,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 14px 8px",
        borderBottom: `1px solid ${BO}`,
        background: "linear-gradient(90deg,rgba(38,142,134,0.07),transparent)",
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: TX, letterSpacing: 0.3 }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "9px 14px 11px" }}>{children}</div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "3.5px 0",
      borderBottom: "1px solid rgba(38,142,134,0.06)",
    }}>
      <span style={{ fontSize: 11, color: MU, fontWeight: 500, flexShrink: 0, paddingRight: 8 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: color ?? TX, textAlign: "right" }}>
        {value ?? "–"}
      </span>
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(((value ?? 0) / max) * 100)) : 0;
  return (
    <div style={{
      height: 5, borderRadius: 3,
      background: "rgba(38,142,134,0.1)",
      flex: 1, minWidth: 50, overflow: "hidden",
    }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        borderRadius: 3, background: color ?? A,
        transition: "width .4s",
      }} />
    </div>
  );
}

function Squares({ value = 0, max = 3 }) {
  const clr = (i) => {
    if (i > value) return "rgba(38,142,134,0.1)";
    if (i <= 1) return OK;
    if (i === 2) return WARN;
    return DANGER;
  };
  return (
    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
      {Array.from({ length: max + 1 }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: clr(i) }} />
      ))}
    </div>
  );
}

function SatDots({ value = 0, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, flexShrink: 0 }}>
      {Array.from({ length: max }).map((_, i) => (
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
      display: "inline-block",
      padding: "2px 7px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      marginRight: 3,
      marginBottom: 3,
      background: A,
      color: "#fff",
    }}>
      {label}
    </span>
  );
}

function Empty({ text }) {
  return <p style={{ fontSize: 11, color: MU, margin: 0 }}>{text}</p>;
}

function DateNote({ date }) {
  if (!date) return null;
  return (
    <p style={{ fontSize: 10, color: MU, marginTop: 5, marginBottom: 0 }}>
      Date: {date}
    </p>
  );
}

// ── score helpers ────────────────────────────────────────────────────────────

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

// ── lookup tables ────────────────────────────────────────────────────────────

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

// ── main component ───────────────────────────────────────────────────────────

export default function Sidebar({ patient, t = {} }) {
  if (!patient) return null;

  const copdDiagnosed     = patient.copdDiagnosed     ?? false;
  const copdDiagnosedDate = patient.copdDiagnosedDate ?? null;
  const asthma            = patient.asthma            ?? false;
  const asthmaDate        = patient.asthmaDate        ?? null;
  const spirometry        = Array.isArray(patient.spirometry)   ? patient.spirometry   : [];
  const spo2arr           = Array.isArray(patient.spo2)         ? patient.spo2         : [];
  const vaccinations      = Array.isArray(patient.vaccinations) ? patient.vaccinations : [];
  const userMedicines     = Array.isArray(patient.userMedicines)? patient.userMedicines: [];
  const medicines         = Array.isArray(patient.medicines)    ? patient.medicines    : [];
  const smoking           = patient.smoking           ?? null;
  const vaping            = patient.vaping            ?? null;
  const latestGad7        = patient.latestGad7        ?? null;
  const latestPhq9        = patient.latestPhq9        ?? null;
  const latestNutrition   = patient.latestNutrition   ?? null;
  const latestAlpha1      = patient.latestAlpha1      ?? null;
  const medSat            = patient.latestMedicineSatisfaction  ?? null;
  const medTrain          = patient.latestMedicineTraining      ?? null;

  const today       = new Date().toISOString().slice(0, 10);
  const activeMeds  = userMedicines.filter(m => !m.stoppedUsage || m.stoppedUsage >= today);
  const latestVax   = vaccinations.length   ? vaccinations[vaccinations.length - 1]   : null;
  const latestSpiro = spirometry.length     ? spirometry[spirometry.length - 1]       : null;
  const latestSpo2v = spo2arr.length        ? spo2arr[spo2arr.length - 1]             : null;

  const gad7Score = sumFields(latestGad7, GAD7_FIELDS);
  const phq9Score = sumFields(latestPhq9, PHQ9_FIELDS);
  const gSev = gad7Sev(gad7Score);
  const pSev = phq9Sev(phq9Score);

  const satMap = {};
  ((medSat && medSat.medicines) ? medSat.medicines : []).forEach(m => {
    satMap[m.medicineId] = m.satisfaction;
  });

  const medName = (id) => {
    const um = userMedicines.find(m => m.medicineId === id);
    if (um && um.medicine && um.medicine.name) return um.medicine.name;
    const med = medicines.find(m => m.id === id);
    if (med) return med.name;
    return `Med #${id}`;
  };

  return (
    <aside style={{ width: "100%", maxWidth: 260, flexShrink: 0, paddingBottom: 32 }}>

      {/* Headline */}
      <h2 style={{
        fontSize: 15,
        fontWeight: 800,
        color: "#1a3a38",
        margin: "0 0 12px 2px",
        letterSpacing: 0.2,
        fontFamily: "'Playfair Display', Georgia, serif",
      }}>
        {t.patientInformation ?? "Patient Information"}
      </h2>


      {/* 1 ── Diagnosis ───────────────────────────────────────────────────── */}
      <Section title="Diagnosis" icon="🫁">
        <Row
          label="COPD diagnosed"
          value={copdDiagnosed ? `Yes · ${copdDiagnosedDate ?? "–"}` : "Not confirmed"}
          color={copdDiagnosed ? TX : MU}
        />
        <Row
          label="Asthma"
          value={asthma ? `Yes · ${asthmaDate ?? "–"}` : "No"}
          color={asthma ? WARN : MU}
        />
      </Section>

      {/* 2 ── Spirometry ──────────────────────────────────────────────────── */}
      <Section title="Spirometry" icon="📊">
        {latestSpiro ? (
          <>
            {latestSpiro.fev1 != null && (
              <Row
                label="FEV1 (%pred)"
                value={`${latestSpiro.fev1}%`}
                color={latestSpiro.fev1 < 50 ? DANGER : latestSpiro.fev1 < 80 ? WARN : OK}
              />
            )}
            {latestSpiro.fvc != null && (
              <Row label="FVC (%pred)" value={`${latestSpiro.fvc}%`} />
            )}
            {latestSpiro.fev1fvc != null && (
              <Row
                label="FEV1/FVC"
                value={`${latestSpiro.fev1fvc}%`}
                color={latestSpiro.fev1fvc < 70 ? DANGER : OK}
              />
            )}
            {latestSpiro.goldGrade != null && (
              <Row
                label="GOLD grade"
                value={`Grade ${latestSpiro.goldGrade}`}
                color={[OK, WARN, "#e07a30", DANGER, DANGER][latestSpiro.goldGrade] ?? TX}
              />
            )}
            <DateNote date={latestSpiro.date} />
          </>
        ) : <Empty text="No spirometry data" />}
      </Section>

      {/* 3 ── SPO2 ────────────────────────────────────────────────────────── */}
      <Section title="SPO₂" icon="🩸">
        {latestSpo2v ? (
          <>
            {latestSpo2v.value != null && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 6 }}>
                  <span style={{
                    fontSize: 24, fontWeight: 800, lineHeight: 1,
                    color: latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK,
                  }}>
                    {latestSpo2v.value}%
                  </span>
                  <Bar
                    value={latestSpo2v.value - 80}
                    max={20}
                    color={latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK}
                  />
                </div>
                <Row
                  label="Status"
                  value={latestSpo2v.value < 90 ? "Critical" : latestSpo2v.value < 94 ? "Low" : "Normal"}
                  color={latestSpo2v.value < 90 ? DANGER : latestSpo2v.value < 94 ? WARN : OK}
                />
              </>
            )}
            {latestSpo2v.pulseRate != null && (
              <Row label="Pulse rate" value={`${latestSpo2v.pulseRate} bpm`} />
            )}
            <DateNote date={latestSpo2v.date} />
          </>
        ) : <Empty text="No SPO₂ data" />}
      </Section>

      {/* 4 ── Smoking ─────────────────────────────────────────────────────── */}
      <Section title="Smoking Status" icon="🚬">
        {smoking ? (
          <>
            <Row
              label="Status"
              value={SMOKE_LABEL[smoking.smoking] ?? "–"}
              color={SMOKE_COLOR[smoking.smoking] ?? MU}
            />
            {smoking.smoking === 1 && smoking.startAge > 0 && (
              <Row label="Smoked ages" value={`${smoking.startAge} – ${smoking.endAge}`} />
            )}
            {smoking.smoking === 2 && smoking.frequency > 0 && (
              <Row label="Cigarettes / day" value={smoking.frequency} color={DANGER} />
            )}
            <DateNote date={smoking.date} />
          </>
        ) : <Empty text="No smoking data" />}
      </Section>

      {/* 5 ── Vaping ──────────────────────────────────────────────────────── */}
      <Section title="Vaping Status" icon="💨">
        {vaping ? (
          <>
            <Row
              label="Status"
              value={VAPE_LABEL[vaping.vaping] ?? "–"}
              color={VAPE_COLOR[vaping.vaping] ?? MU}
            />
            <DateNote date={vaping.date} />
          </>
        ) : <Empty text="No vaping data" />}
      </Section>

      {/* 6 ── Vaccinations ────────────────────────────────────────────────── */}
      <Section title="Vaccinations" icon="💉">
        {latestVax ? (
          <>
            {VAX_FIELDS.map(({ key, label }) => (
              <div key={key} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "3px 0",
              }}>
                <span style={{ fontSize: 11, color: MU }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: latestVax[key] ? OK : "rgba(38,142,134,0.3)" }}>
                  {latestVax[key] ? "✓" : "–"}
                </span>
              </div>
            ))}
            <DateNote date={latestVax.date} />
          </>
        ) : <Empty text="No vaccination data" />}
      </Section>

      {/* 7 ── GAD-7 ───────────────────────────────────────────────────────── */}
      <Section title="GAD-7 · Anxiety" icon="🧠">
        {latestGad7 ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: gSev.color, lineHeight: 1 }}>
                {gad7Score}
              </span>
              <div style={{ flex: 1 }}>
                <Bar value={gad7Score} max={21} color={gSev.color} />
                <span style={{ fontSize: 10, fontWeight: 700, color: gSev.color }}>
                  {gSev.label} / 21
                </span>
              </div>
            </div>
            {GAD7_FIELDS.map(({ key, label }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2.5px 0" }}>
                <span style={{ fontSize: 10, color: MU, flex: 1 }}>{label}</span>
                <Squares value={latestGad7[key] ?? 0} />
              </div>
            ))}
            <DateNote date={latestGad7.date} />
          </>
        ) : <Empty text="No GAD-7 data" />}
      </Section>

      {/* 8 ── PHQ-9 ───────────────────────────────────────────────────────── */}
      <Section title="PHQ-9 · Depression" icon="💭">
        {latestPhq9 ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: pSev.color, lineHeight: 1 }}>
                {phq9Score}
              </span>
              <div style={{ flex: 1 }}>
                <Bar value={phq9Score} max={27} color={pSev.color} />
                <span style={{ fontSize: 10, fontWeight: 700, color: pSev.color }}>
                  {pSev.label} / 27
                </span>
              </div>
            </div>
            {PHQ9_FIELDS.map(({ key, label, alert }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2.5px 0" }}>
                <span style={{
                  fontSize: 10, flex: 1,
                  color: alert && (latestPhq9[key] ?? 0) > 0 ? DANGER : MU,
                  fontWeight: alert && (latestPhq9[key] ?? 0) > 0 ? 700 : 400,
                }}>
                  {label}
                </span>
                <Squares value={latestPhq9[key] ?? 0} />
              </div>
            ))}
            <DateNote date={latestPhq9.date} />
          </>
        ) : <Empty text="No PHQ-9 data" />}
      </Section>

      {/* 9 ── Nutrition ───────────────────────────────────────────────────── */}
      <Section title="Nutrition" icon="🥗">
        {latestNutrition ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
              <Bar value={latestNutrition.value} max={5} color={NUTR_COLOR(latestNutrition.value)} />
              <span style={{ fontSize: 11, fontWeight: 700, color: NUTR_COLOR(latestNutrition.value), whiteSpace: "nowrap" }}>
                {NUTR_LABEL[latestNutrition.value] ?? "–"}
              </span>
            </div>
            <DateNote date={latestNutrition.date} />
          </>
        ) : <Empty text="No nutrition data" />}
      </Section>

      {/* 10 ── Alpha-1 Antitrypsin ────────────────────────────────────────── */}
      <Section title="Alpha-1 Antitrypsin" icon="🧬">
        {latestAlpha1 ? (
          <>
            <Row
              label="Tested"
              value={latestAlpha1.alpha1Tested ? "Yes" : "Not tested"}
              color={latestAlpha1.alpha1Tested ? TX : MU}
            />
            {latestAlpha1.alpha1Tested && latestAlpha1.alpha1Result != null && (
              <Row
                label="Result"
                value={latestAlpha1.alpha1Result === 0 ? "Normal" : `Deficient (${latestAlpha1.alpha1Result})`}
                color={latestAlpha1.alpha1Result === 0 ? OK : DANGER}
              />
            )}
            <DateNote date={latestAlpha1.date} />
          </>
        ) : <Empty text="No alpha-1 data" />}
      </Section>

      {/* 11 ── COPD Medication ────────────────────────────────────────────── */}
      <Section title="COPD Medication" icon="💊">
        {activeMeds.length === 0
          ? <Empty text="No active medicines" />
          : activeMeds.map((um) => (
            <div key={um.medicineId} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 0",
              borderBottom: "1px solid rgba(38,142,134,0.07)",
            }}>
              {um.medicine && um.medicine.image ? (
                <img
                  src={um.medicine.image}
                  alt={um.medicine.name ?? ""}
                  style={{
                    width: 30, height: 30, objectFit: "contain",
                    borderRadius: 7, border: `1px solid ${BO}`,
                    background: "#fff", flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: "rgba(38,142,134,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15,
                }}>💊</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: TX, margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {medName(um.medicineId)}
                </p>
                <p style={{ fontSize: 10, color: MU, margin: 0 }}>
                  {um.medicine ? (MED_TYPE[um.medicine.type] ?? "") : ""}
                  {um.reason != null ? ` · ${MED_REASON[um.reason] ?? ""}` : ""}
                </p>
                <p style={{ fontSize: 10, color: MU, margin: 0 }}>
                  From {um.startedUsage ?? "–"}
                </p>
              </div>
            </div>
          ))
        }
      </Section>

      {/* 12 ── Medicine Satisfaction ──────────────────────────────────────── */}
      <Section title="Medicine Satisfaction" icon="⭐">
        {medSat && medSat.medicines && medSat.medicines.length > 0 ? (
          <>
            {medSat.medicines.map(({ medicineId, satisfaction }) => (
              <div key={medicineId} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                borderBottom: "1px solid rgba(38,142,134,0.06)",
              }}>
                <span style={{ fontSize: 11, color: TX, fontWeight: 500, paddingRight: 8 }}>
                  {medName(medicineId)}
                </span>
                <SatDots value={satisfaction ?? 0} />
              </div>
            ))}
            <DateNote date={medSat.date} />
          </>
        ) : <Empty text="No satisfaction data" />}
      </Section>

      {/* 13 ── Medication Training ────────────────────────────────────────── */}
      <Section title="Medication Training" icon="🎓">
        {medTrain && medTrain.medicines && medTrain.medicines.length > 0 ? (
          <>
            {medTrain.medicines.map((entry) => {
              const { medicineId } = entry;
              const sources = TRAINING_KEYS.filter(k => entry[k.key] === true);
              return (
                <div key={medicineId} style={{
                  paddingBottom: 8,
                  borderBottom: "1px solid rgba(38,142,134,0.07)",
                  marginBottom: 4,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: TX, margin: "4px 0 3px" }}>
                    {medName(medicineId)}
                  </p>
                  {sources.length > 0
                    ? sources.map(s => <Chip key={s.key} label={s.label} />)
                    : <span style={{ fontSize: 10, color: MU }}>No training recorded</span>
                  }
                </div>
              );
            })}
            <DateNote date={medTrain.date} />
          </>
        ) : <Empty text="No training data" />}
      </Section>

    </aside>
  );
}