// patch_monthly_summary_v1_2.cjs
// Adds valueColor support to MonthlySummary rows, and sets the
// Active weeks row to use green for both icon AND value.
// Idempotent.
//
// Run from project root:
//   node patch_monthly_summary_v1_2.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join(
  "src",
  "components",
  "dashboard",
  "MonthlySummary.jsx",
);

const MARKER_V1_1 = "/* PATCH:monthly-summary v1.1 */";
const MARKER_V1_2 = "/* PATCH:monthly-summary v1.2 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER_V1_2)) {
  console.log("✓ Already on v1.2 — skipping.");
  process.exit(0);
}

if (!src.includes(MARKER_V1_1)) {
  console.error("✗ Expected v1.1 patch to be applied first.");
  process.exit(1);
}

// ── 1. Add valueColor to the active weeks row ─────────────────────────────
const oldActiveRow =
  /\{\s*icon:\s*"🏃",\s*iconColor:\s*"#4aba7a",\s*label:\s*t\.weeksWithActivity\s*\?\?\s*"Active weeks",\s*value:\s*activeWeeks,\s*\},/m;

const newActiveRow = `{
      icon: "🏃",
      iconColor: "#4aba7a",
      valueColor: "#4aba7a",
      label: t.weeksWithActivity ?? "Active weeks",
      value: activeWeeks,
    }, ${MARKER_V1_2}`;

if (!oldActiveRow.test(src)) {
  console.error("✗ Could not locate the active-weeks row.");
  process.exit(1);
}
src = src.replace(oldActiveRow, newActiveRow);

// ── 2. Extend the destructure to include valueColor ───────────────────────
const oldDestructure =
  /rows\.map\(\(\{\s*icon,\s*iconSrc,\s*iconColor,\s*iconOpacity,\s*label,\s*sublabel,\s*value,\s*suffix\s*\}\) => \{/;

const newDestructure =
  "rows.map(({ icon, iconSrc, iconColor, iconOpacity, label, sublabel, value, suffix, valueColor }) => {";

if (!oldDestructure.test(src)) {
  console.error("✗ Could not locate the rows.map destructure.");
  process.exit(1);
}
src = src.replace(oldDestructure, newDestructure);

// ── 3. Use valueColor (when provided) in the value <span> ─────────────────
// Current: color: isEmpty ? "#7a9a98" : "#b91c1c"
// New:     color: isEmpty ? "#7a9a98" : (valueColor ?? "#b91c1c")
const oldColorRule =
  /color:\s*isEmpty\s*\?\s*"#7a9a98"\s*:\s*"#b91c1c"/;
const newColorRule = `color: isEmpty ? "#7a9a98" : (valueColor ?? "#b91c1c")`;

if (!oldColorRule.test(src)) {
  console.error("✗ Could not locate the value-color rule.");
  process.exit(1);
}
src = src.replace(oldColorRule, newColorRule);

fs.writeFileSync(FILE, src, "utf8");
console.log("✓ Patched MonthlySummary.jsx → v1.2");
