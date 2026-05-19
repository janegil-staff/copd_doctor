// patch_sidebar_pack_years.cjs
// Adds a pack-years row to the Smoking section in Sidebar.jsx.
// Pack-years = (cig/day ÷ 20) × years smoked.
// Years smoked = endAge - startAge (ex) OR patient.age - startAge (current).
// Idempotent.
//
// Run from project root:
//   node patch_sidebar_pack_years.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join("src", "components", "dashboard", "Sidebar.jsx");

const MARKER = "/* PATCH:pack-years v1 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER)) {
  console.log("✓ Already patched — skipping.");
  process.exit(0);
}

// ── 1. Pass patient.age through to the smoking calculations ───────────────
// We need patient.age available where Sidebar reads `smoking`. The component
// already destructures `patient` at the top of Sidebar() — patient.age is
// accessible directly. No prop change needed.

// ── 2. Inject the pack-years row after the existing "Average" row ─────────
// Find the closing of the smoking conditional block:
//   {smoking.smoking === 2 && smoking.frequency > 0 && (
//     <Row ... />
//   )}
// and add a pack-years row right after it, inside the same <>...</> fragment.
const anchor =
  /(\{smoking\.smoking === 2 && smoking\.frequency > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\})/m;

const insertion = `$1
                {(() => {
                  ${MARKER}
                  // Pack-years: (cig/day ÷ 20) × years smoked.
                  // years = endAge - startAge (ex), or patient.age - startAge (current).
                  const cpd = Number(smoking.frequency) || 0;
                  const start = Number(smoking.startAge) || 0;
                  const end = Number(smoking.endAge) || 0;
                  const currentAge = Number(patient.age) || 0;
                  let years = 0;
                  if (smoking.smoking === 1 && end > start) years = end - start;
                  else if (smoking.smoking === 2 && currentAge > start) years = currentAge - start;
                  const packYears = (cpd / 20) * years;
                  const py = Number.isFinite(packYears)
                    ? Math.round(packYears * 10) / 10
                    : 0;
                  // Severity bands: <10 OK, 10–19 warn, 20–39 orange, ≥40 danger.
                  const pyColor =
                    py < 10 ? OK : py < 20 ? WARN : py < 40 ? "#e07a30" : DANGER;
                  return (
                    <Row
                      label={t.sPackYears ?? "Pack-years"}
                      value={\`\${py}\`}
                      color={pyColor}
                      alwaysShow
                    />
                  );
                })()}`;

if (!anchor.test(src)) {
  console.error("✗ Could not locate the Average row in the smoking section.");
  process.exit(1);
}

src = src.replace(anchor, insertion);

fs.writeFileSync(FILE, src, "utf8");
console.log("✓ Patched src/components/dashboard/Sidebar.jsx — added pack-years row");
