#!/usr/bin/env node
/**
 * Idempotent patch — updates the Nutrition section in Sidebar.jsx so it
 * handles the 0–6 nutrition value correctly:
 *
 *   1–4  → existing colored bar + label  (Poor / Fair / OK / Good)
 *   5    → green bar + "Yes" label
 *   6    → no bar, grey "Unsure" chip
 *   other (0, null, undefined) → "No data recorded."
 *
 * Run from project root:
 *   node patch_sidebar_nutrition.cjs
 *
 * Pass --path=src/components/Sidebar.jsx to override the file path.
 */

const fs = require("fs");
const path = require("path");

const argPath = process.argv
  .find((a) => a.startsWith("--path="))
  ?.split("=")[1];
const SIDEBAR_PATH =
  argPath ?? path.join("src", "components","dashboard", "Sidebar.jsx");

if (!fs.existsSync(SIDEBAR_PATH)) {
  console.error(`✗ Could not find ${SIDEBAR_PATH}`);
  process.exit(1);
}

const src = fs.readFileSync(SIDEBAR_PATH, "utf8");

// Marker — if the new block is already in place, abort silently.
if (src.includes("/* NUTRITION_06_PATCH_V1 */")) {
  console.log("✓ Sidebar.jsx already patched — no changes.");
  process.exit(0);
}

// Find the start of the current Nutrition section.
const startMarker =
  "{/* ── Nutrition ──────────────────────────────────────────────────── */}";
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) {
  console.error(
    "✗ Could not locate the Nutrition section marker in Sidebar.jsx.\n" +
      "  Expected to find: " +
      startMarker,
  );
  process.exit(1);
}

// The current section ends just before the next divider section.
// Locate it by finding the next `{/* ── ` after the Nutrition section start.
const afterStart = src.indexOf("{/* ── ", startIdx + startMarker.length);
if (afterStart === -1) {
  console.error("✗ Could not locate the end of the Nutrition section.");
  process.exit(1);
}

// Walk back to the last `\n` before the next section so we keep indentation.
let endIdx = afterStart;
while (endIdx > 0 && src[endIdx - 1] !== "\n") endIdx--;

const before = src.slice(0, startIdx);
const after = src.slice(endIdx);

const newBlock = `{/* ── Nutrition ──────────────────────────────────────────────────── */ /* NUTRITION_06_PATCH_V1 */}
            <Divider label={t.sNutrition ?? "Nutrition"} />
            {(() => {
              const v = latestNutrition?.value;
              if (v == null || v === 0) {
                return (
                  <p
                    style={{
                      fontSize: 11,
                      color: MU,
                      fontStyle: "italic",
                      padding: "4px 0",
                    }}
                  >
                    {t.noData ?? "No data recorded."}
                  </p>
                );
              }
              // Value 6 = "Unsure" — neutral grey chip, no bar.
              if (v === 6) {
                const unsureLabel =
                  t.nutritionLabels?.[6] ?? t.sNutritionUnsure ?? "Unsure";
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 0",
                      borderBottom: "1px solid rgba(38,142,134,0.07)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: MU,
                        fontWeight: 500,
                        flexShrink: 0,
                        paddingRight: 10,
                      }}
                    >
                      {t.sScore ?? "Score"}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#5a6a78",
                        background: "#e6ebef",
                        border: "1px solid #d4dbe1",
                        padding: "2px 8px",
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {unsureLabel}
                    </span>
                  </div>
                );
              }
              // Values 1–5 — coloured bar + label
              const nColor =
                v <= 1
                  ? DANGER
                  : v === 2
                    ? "#e07a30"
                    : v === 3
                      ? WARN
                      : v === 4
                        ? A
                        : OK;
              const label =
                t.nutritionLabels?.[v] ??
                [
                  t.sNutritionPoor ?? "Poor",
                  t.sNutritionFair ?? "Fair",
                  t.sNutritionOk ?? "OK",
                  t.sNutritionGood ?? "Good",
                  t.sNutritionYes ?? "Yes",
                ][v - 1] ??
                String(v);
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(38,142,134,0.07)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: MU,
                      fontWeight: 500,
                      flexShrink: 0,
                      paddingRight: 10,
                    }}
                  >
                    {t.sScore ?? "Score"}
                  </span>
                  <Bar value={v} max={5} color={nColor} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: nColor,
                      flexShrink: 0,
                    }}
                  >
                    {v}{" "}
                    <span style={{ fontSize: 10, fontWeight: 500 }}>
                      ({label})
                    </span>
                  </span>
                </div>
              );
            })()}

            `;

const out = before + newBlock + after;
fs.writeFileSync(SIDEBAR_PATH, out, "utf8");
console.log(`✓ Patched Nutrition section in ${SIDEBAR_PATH}`);
