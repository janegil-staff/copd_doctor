#!/usr/bin/env node
/**
 * Idempotent patch — moves the Asthma row from the "Diagnosis" section
 * to the top of the "Comorbidities" section in
 * src/components/dashboard/Sidebar.jsx.
 *
 * Asthma keeps its date when confirmed (e.g. "Yes · 2026-05-14"),
 * but is now color-coded consistently with the other comorbidities:
 *   confirmed  → DANGER (red)
 *   not        → OK (green)
 *
 * Run from project root:
 *   node patch_sidebar_asthma_move.cjs
 */

const fs = require("fs");
const path = require("path");

const SIDEBAR = path.join("src", "components", "dashboard", "Sidebar.jsx");

if (!fs.existsSync(SIDEBAR)) {
  console.error(`✗ Could not find ${SIDEBAR}`);
  process.exit(1);
}

let src = fs.readFileSync(SIDEBAR, "utf8");

if (src.includes("/* ASTHMA_MOVED_TO_COMORBID */")) {
  console.log("✓ Sidebar.jsx already patched — no changes.");
  process.exit(0);
}

// ── 1. Remove the existing Asthma Row in the Diagnosis section ─────────
//
// Matches the exact JSX block from Sidebar.jsx:
//
//   <Row
//     label={t.sAsthma ?? "Asthma"}
//     value={
//       asthma
//         ? `${t.sConfirmed ?? "Confirmed"}${asthmaDate ? ` · ${asthmaDate}` : ""}`
//         : (t.sNotConfirmed ?? "Not confirmed")
//     }
//     color={asthma ? DANGER : DANGER}
//     alwaysShow
//   />

const oldAsthmaRow =
  /\n\s*<Row\s+label=\{t\.sAsthma \?\? "Asthma"\}[\s\S]*?color=\{asthma \? DANGER : DANGER\}[\s\S]*?alwaysShow\s*\/>\n/;

if (!oldAsthmaRow.test(src)) {
  console.error(
    "✗ Could not find the Asthma <Row> in the Diagnosis section.\n" +
      "  The file may have been edited since this patch was written.",
  );
  process.exit(1);
}

src = src.replace(oldAsthmaRow, "\n");

// ── 2. Insert Asthma row at the top of the Comorbidities map ───────────
//
// We anchor on the Comorbidities divider + the existing COND_FIELDS.map():
//
//   <Divider label={t.sComorbidities ?? "Comorbidities"} />
//   {COND_FIELDS.map((c) => {
//
// Insert the Asthma row between them.

const anchor =
  '<Divider label={t.sComorbidities ?? "Comorbidities"} />';
const anchorIdx = src.indexOf(anchor);
if (anchorIdx === -1) {
  console.error("✗ Could not find the Comorbidities <Divider>.");
  process.exit(1);
}

// Walk forward to find the start of "{COND_FIELDS.map" so we can splice
// our new row in between.
const mapStr = "{COND_FIELDS.map(";
const mapIdx = src.indexOf(mapStr, anchorIdx);
if (mapIdx === -1) {
  console.error("✗ Could not find COND_FIELDS.map() after the divider.");
  process.exit(1);
}

// Determine indentation of the `{COND_FIELDS.map` line so the new JSX
// matches the surrounding style.
let lineStart = mapIdx;
while (lineStart > 0 && src[lineStart - 1] !== "\n") lineStart--;
const indent = src.slice(lineStart, mapIdx);

const newAsthmaRow =
  `${indent}{/* ASTHMA_MOVED_TO_COMORBID */}\n` +
  `${indent}<Row\n` +
  `${indent}  label={t.sAsthma ?? "Asthma"}\n` +
  `${indent}  value={\n` +
  `${indent}    asthma\n` +
  `${indent}      ? \`\${t.sYes ?? "Yes"}\${asthmaDate ? \` · \${asthmaDate}\` : ""}\`\n` +
  `${indent}      : (t.sNo ?? "No")\n` +
  `${indent}  }\n` +
  `${indent}  color={asthma ? DANGER : OK}\n` +
  `${indent}  alwaysShow\n` +
  `${indent}/>\n`;

src = src.slice(0, lineStart) + newAsthmaRow + src.slice(lineStart);

fs.writeFileSync(SIDEBAR, src, "utf8");
console.log(`✓ Patched ${SIDEBAR}`);
console.log("  · Removed Asthma <Row> from Diagnosis section");
console.log("  · Added Asthma as first row in Comorbidities section");
console.log("  · Fixed bug: color is now OK when asthma is not confirmed");
