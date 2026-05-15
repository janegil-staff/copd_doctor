#!/usr/bin/env node
/**
 * Idempotent patch — restructures the Spirometry section in
 * src/components/dashboard/Sidebar.jsx so that:
 *
 *   • The Edit link sits on the divider line (right side)
 *   • The Read more link moves to the right side of the inline values row
 *   • Color-coded FEV1 / FVC / FEV1-FVC ratio / GOLD chips stay intact
 *
 * Result:
 *
 *   SPIROMETRY ──────────────────────────────────  Rediger
 *   2026-05-13 · FEV1 1.0 L · FVC 1.0 L · …       Read more
 *
 * Run from project root:
 *   node patch_sidebar_spirometry_edit.cjs
 */

const fs = require("fs");
const path = require("path");

const SIDEBAR = path.join("src", "components", "dashboard", "Sidebar.jsx");

if (!fs.existsSync(SIDEBAR)) {
  console.error(`✗ Could not find ${SIDEBAR}`);
  process.exit(1);
}

let src = fs.readFileSync(SIDEBAR, "utf8");

if (src.includes("/* SPIROMETRY_EDIT_V1 */")) {
  console.log("✓ Sidebar.jsx already patched — no changes.");
  process.exit(0);
}

// ── 1. Replace the Spirometry <Divider> call ───────────────────────────
//
// Current:
//   <Divider
//     label={t.sSpirometry ?? "Spirometry"}
//     onReadMore={latestSpiro ? () => setShowSpirometryModal(true) : undefined}
//     readMoreLabel={readMoreLabel}
//   />

const oldDividerRe =
  /<Divider\s+label=\{t\.sSpirometry \?\? "Spirometry"\}\s+onReadMore=\{latestSpiro \? \(\) => setShowSpirometryModal\(true\) : undefined\}\s+readMoreLabel=\{readMoreLabel\}\s+\/>/;

if (!oldDividerRe.test(src)) {
  console.error("✗ Could not find the Spirometry <Divider> call.");
  process.exit(1);
}

const newDivider =
  `<Divider
              label={t.sSpirometry ?? "Spirometry"}
              onEdit={() => setShowEditPlaceholder(true)}
              editLabel={t.sEdit ?? "Edit"}
            />{/* SPIROMETRY_EDIT_V1 */}`;

src = src.replace(oldDividerRe, newDivider);

// ── 2. Append a flex spacer + Read more button to the inline values row
//
// The inline div is the one that opens with:
//
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       gap: 8,
//       padding: "6px 0",
//       borderBottom: "1px solid rgba(38,142,134,0.07)",
//       fontSize: 11,
//       flexWrap: "wrap",
//     }}
//   >
//     {latestSpiro.date && ...}
//
// We anchor on the GOLD-grade block, walk forward to find the closing
// `</div>` of that inline row, and insert the spacer + button just before it.

// Anchor on the closing of the GOLD-grade ternary block in the JSX.
// Note: JSX uses {expr}, not ${expr} (no $ prefix).
const goldAnchor =
  "{latestSpiro.goldGrade}\n                    </strong>\n                  </>\n                )}";

const goldIdx = src.indexOf(goldAnchor);
if (goldIdx === -1) {
  console.error(
    "✗ Could not find the GOLD-grade block inside the Spirometry inline row.",
  );
  process.exit(1);
}

// Walk forward from the end of the goldAnchor to find the next `</div>`.
const closeStart = src.indexOf("</div>", goldIdx);
if (closeStart === -1) {
  console.error("✗ Could not find the closing </div> for the Spirometry row.");
  process.exit(1);
}

// Determine indentation of the closing tag so the inserted JSX matches.
let lineStart = closeStart;
while (lineStart > 0 && src[lineStart - 1] !== "\n") lineStart--;
const indent = src.slice(lineStart, closeStart);

const spacerAndButton =
  `${indent}<div style={{ flex: 1, minWidth: 8 }} />\n` +
  `${indent}{latestSpiro && (\n` +
  `${indent}  <button\n` +
  `${indent}    onClick={() => setShowSpirometryModal(true)}\n` +
  `${indent}    style={{\n` +
  `${indent}      background: "none",\n` +
  `${indent}      border: "none",\n` +
  `${indent}      padding: 0,\n` +
  `${indent}      fontSize: 10,\n` +
  `${indent}      fontWeight: 700,\n` +
  `${indent}      color: A,\n` +
  `${indent}      cursor: "pointer",\n` +
  `${indent}      whiteSpace: "nowrap",\n` +
  `${indent}      flexShrink: 0,\n` +
  `${indent}      textDecoration: "underline",\n` +
  `${indent}      letterSpacing: 0.3,\n` +
  `${indent}    }}\n` +
  `${indent}  >\n` +
  `${indent}    {readMoreLabel}\n` +
  `${indent}  </button>\n` +
  `${indent})}\n`;

src = src.slice(0, lineStart) + spacerAndButton + src.slice(lineStart);

fs.writeFileSync(SIDEBAR, src, "utf8");
console.log(`✓ Patched ${SIDEBAR}`);
console.log("  · Spirometry divider now shows Edit (no Read more)");
console.log("  · Read more moved to the right side of the inline values row");
console.log("  · Color-coded FEV1 / FVC / GOLD chips unchanged");
