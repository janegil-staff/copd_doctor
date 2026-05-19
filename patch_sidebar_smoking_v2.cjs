// patch_sidebar_smoking_v2.cjs
// Fixes the smoking section to correctly display data based on the actual enum:
//   1 = Current smoker
//   2 = Never smoked
//   3 = Ex-smoker
//
// For current smokers (1):    shows Start + Average + Pack-years (years counted to today)
// For ex-smokers (3):         shows Start + Stopped + Average + Pack-years
// For never smokers (2):      shows nothing beyond Status
//
// Supersedes pack-years v1 (which had the wrong enum mapping).
// Idempotent.
//
// Run from project root:
//   node patch_sidebar_smoking_v2.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join("src", "components", "dashboard", "Sidebar.jsx");

const MARKER_V1 = "/* PATCH:pack-years v1 */";
const MARKER_V2 = "/* PATCH:smoking-section v2 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER_V2)) {
  console.log("✓ Already on v2 — skipping.");
  process.exit(0);
}

// ── Build a single replacement block for the smoking conditional area ────
// We match the whole block from the "Start" row through the v1 pack-years
// IIFE (if present) OR through the "Average" row (if v1 was never applied).

// The new block (replaces everything between the "Start" row and the end of
// the smoking-data subtree, but NOT including the Status row above it).
const newBlock = `{smoking.smoking > 0 && smoking.startAge > 0 && (
                  <Row
                    label={t.sSmokingStart ?? "Start"}
                    value={\`\${t.sAge ?? "Age"} \${smoking.startAge}\`}
                  />
                )}
                {smoking.smoking === 3 && smoking.endAge > 0 && (
                  <Row
                    label={t.sSmokingStop ?? "Stopped"}
                    value={\`\${t.sAge ?? "Age"} \${smoking.endAge}\`}
                    color={OK}
                  />
                )}
                {(smoking.smoking === 1 || smoking.smoking === 3) && smoking.frequency > 0 && (
                  <Row
                    label={t.sSmokingAverage ?? "Average"}
                    value={\`\${smoking.frequency} \${t.sCigarettesPerDay ?? "cig/day"}\`}
                    color={smoking.smoking === 1 ? DANGER : MU}
                  />
                )}
                {(smoking.smoking === 1 || smoking.smoking === 3) && (() => {
                  ${MARKER_V2}
                  // Pack-years: (cig/day ÷ 20) × years smoked.
                  // Current (1): years = patient.age - startAge.
                  // Ex (3):      years = endAge - startAge.
                  const cpd = Number(smoking.frequency) || 0;
                  const start = Number(smoking.startAge) || 0;
                  const end = Number(smoking.endAge) || 0;
                  const currentAge = Number(patient.age) || 0;
                  let years = 0;
                  if (smoking.smoking === 3 && end > start) years = end - start;
                  else if (smoking.smoking === 1 && currentAge > start) years = currentAge - start;
                  const packYears = (cpd / 20) * years;
                  const py = Number.isFinite(packYears)
                    ? Math.round(packYears * 10) / 10
                    : 0;
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

// Pattern A: file already has v1 pack-years patch applied.
const v1Block =
  /\{smoking\.smoking > 0 && smoking\.startAge > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}\s*\{smoking\.smoking === 1 && smoking\.endAge > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}\s*\{smoking\.smoking === 2 && smoking\.frequency > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}\s*\{\(\(\) => \{\s*\/\* PATCH:pack-years v1 \*\/[\s\S]*?\}\)\(\)\}/m;

// Pattern B: file is in original state (no v1 patch).
const originalBlock =
  /\{smoking\.smoking > 0 && smoking\.startAge > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}\s*\{smoking\.smoking === 1 && smoking\.endAge > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}\s*\{smoking\.smoking === 2 && smoking\.frequency > 0 && \(\s*<Row[\s\S]*?\/>\s*\)\}/m;

let appliedFrom = null;
if (v1Block.test(src)) {
  src = src.replace(v1Block, newBlock);
  appliedFrom = "v1";
} else if (originalBlock.test(src)) {
  src = src.replace(originalBlock, newBlock);
  appliedFrom = "original";
} else {
  console.error("✗ Could not locate the smoking conditional block.");
  process.exit(1);
}

fs.writeFileSync(FILE, src, "utf8");
console.log(`✓ Patched Sidebar.jsx → v2 (from ${appliedFrom})`);
