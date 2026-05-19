// patch_monthly_summary_v1_1.cjs
// Two changes on top of v1:
//   1. Active weeks row color: teal #268E86 → green #4aba7a (OK constant)
//   2. Medicine row split:
//      - Weeks with medicine    (per-week: any record has medicines.length > 0)
//      - Weeks without medicine (visible weeks count - weeksWithMedicine)
// Idempotent. Requires v1 already applied.
//
// Run from project root:
//   node patch_monthly_summary_v1_1.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join(
  "src",
  "components",
  "dashboard",
  "MonthlySummary.jsx",
);

const MARKER_V1 = "/* PATCH:activity-split v1 */";
const MARKER_V1_1 = "/* PATCH:monthly-summary v1.1 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER_V1_1)) {
  console.log("✓ Already on v1.1 — skipping.");
  process.exit(0);
}

if (!src.includes(MARKER_V1)) {
  console.error("✗ Expected v1 patch to be applied first.");
  console.error("  Run patch_monthly_summary_split_activity.cjs first.");
  process.exit(1);
}

// ── 1. Replace the counters block (v1 → v1.1) ─────────────────────────────
const v1Counters =
  /let moderateWeeks = 0;\s*let seriousWeeks = 0;\s*let lowActivityWeeks = 0;\s*let activeWeeks = 0;\s*let medicineWeeks = 0;\s*\/\* PATCH:activity-split v1 \*\/\s*for \(const recs of Object\.values\(weekRecords\.byWeek\)\) \{[\s\S]*?if \(recs\.some\(\(r\) => r\.medicines\?\.length > 0\)\) medicineWeeks\+\+;\s*\}/m;

const newCounters = `let moderateWeeks = 0;
  let seriousWeeks = 0;
  let lowActivityWeeks = 0;
  let activeWeeks = 0;
  let medicineWeeks = 0;
  ${MARKER_V1_1}

  // Total visible weeks shown for this month (denominator for "without medicine").
  const totalWeeks = Object.keys(weekRecords.byWeek).length;

  for (const recs of Object.values(weekRecords.byWeek)) {
    // For each visible week, ask: does any record in this week trigger…?
    const anySerious = recs.some((r) => r.seriousExacerbations);
    const anyModerate =
      !anySerious && recs.some((r) => r.moderateExacerbations);
    if (anySerious) seriousWeeks++;
    if (anyModerate) moderateWeeks++;

    // Activity: take the MAX level across the week. 1–2 = low, 3+ = active.
    // Weeks with no activity at all (max = 0 or null) count toward neither.
    let maxActivity = 0;
    for (const r of recs) {
      const v = Number(r.physicalActivity) || 0;
      if (v > maxActivity) maxActivity = v;
    }
    if (maxActivity >= 1 && maxActivity <= 2) lowActivityWeeks++;
    else if (maxActivity >= 3) activeWeeks++;

    if (recs.some((r) => r.medicines?.length > 0)) medicineWeeks++;
  }

  const noMedicineWeeks = Math.max(0, totalWeeks - medicineWeeks);`;

if (!v1Counters.test(src)) {
  console.error("✗ Could not locate the v1 counters block.");
  process.exit(1);
}
src = src.replace(v1Counters, newCounters);

// ── 2. Change active row color to green ───────────────────────────────────
const oldActiveRow =
  /\{\s*icon:\s*"🏃",\s*iconColor:\s*"#268E86",\s*label:\s*t\.weeksWithActivity\s*\?\?\s*"Active weeks",\s*value:\s*activeWeeks,\s*\},/m;

const newActiveRow = `{
      icon: "🏃",
      iconColor: "#4aba7a",
      label: t.weeksWithActivity ?? "Active weeks",
      value: activeWeeks,
    },`;

if (!oldActiveRow.test(src)) {
  console.error("✗ Could not locate the active-weeks row.");
  process.exit(1);
}
src = src.replace(oldActiveRow, newActiveRow);

// ── 3. Split the medicine row into with/without ───────────────────────────
const oldMedicineRow =
  /\{\s*iconSrc:\s*"\/icons\/ico_medicine\.png",\s*icon:\s*"💊",\s*iconColor:\s*"#0ea5e9",\s*label:\s*t\.weeksWithMedicine\s*\?\?\s*t\.medicines,\s*value:\s*medicineWeeks,\s*\},/m;

const newMedicineRows = `{
      iconSrc: "/icons/ico_medicine.png",
      icon: "💊",
      iconColor: "#0ea5e9",
      label: t.weeksWithMedicine ?? t.medicines,
      value: medicineWeeks,
    },
    {
      iconSrc: "/icons/ico_medicine.png",
      icon: "💊",
      iconColor: "#a0b8b6",
      iconOpacity: 0.35,
      label: t.weeksWithoutMedicine ?? "Weeks without medicine",
      value: noMedicineWeeks,
    },`;

if (!oldMedicineRow.test(src)) {
  console.error("✗ Could not locate the medicine row.");
  process.exit(1);
}
src = src.replace(oldMedicineRow, newMedicineRows);

// ── 4. Teach the row renderer about iconOpacity ───────────────────────────
// Current destructure: ({ icon, iconSrc, iconColor, label, sublabel, value, suffix })
// Add iconOpacity.
const oldDestructure =
  /rows\.map\(\(\{\s*icon,\s*iconSrc,\s*iconColor,\s*label,\s*sublabel,\s*value,\s*suffix\s*\}\) => \{/;

const newDestructure =
  "rows.map(({ icon, iconSrc, iconColor, iconOpacity, label, sublabel, value, suffix }) => {";

if (!oldDestructure.test(src)) {
  console.error("✗ Could not locate the rows.map destructure.");
  process.exit(1);
}
src = src.replace(oldDestructure, newDestructure);

// Apply iconOpacity to both the <img> and the fallback glyph span.
// The current code has: opacity: isEmpty ? 0.4 : 1  in two places.
const imgOpacity = /opacity:\s*isEmpty\s*\?\s*0\.4\s*:\s*1,\s*\}\}\s*\/>/;
if (!imgOpacity.test(src)) {
  console.error("✗ Could not locate the <img> opacity rule.");
  process.exit(1);
}
src = src.replace(
  imgOpacity,
  `opacity: isEmpty ? 0.4 : (iconOpacity ?? 1),
                    }}
                  />`,
);

const glyphOpacity =
  /<span style=\{\{\s*opacity:\s*isEmpty\s*\?\s*0\.4\s*:\s*1\s*\}\}>\{icon\}<\/span>/;
if (!glyphOpacity.test(src)) {
  console.error("✗ Could not locate the glyph opacity span.");
  process.exit(1);
}
src = src.replace(
  glyphOpacity,
  `<span style={{ opacity: isEmpty ? 0.4 : (iconOpacity ?? 1) }}>{icon}</span>`,
);

fs.writeFileSync(FILE, src, "utf8");
console.log("✓ Patched MonthlySummary.jsx → v1.1");
