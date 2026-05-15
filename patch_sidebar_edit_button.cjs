#!/usr/bin/env node
/**
 * Idempotent patch — adds an "Edit" link to the right side of the title
 * row in dividers that have a `subLabel` (currently SPO₂ and Eosinophils).
 *
 * Layout when subLabel + onEdit are both present:
 *
 *   SPO₂ ──────────────────────────────  Edit
 *   2026-04-17  99.0%                Read more
 *
 * Changes in src/components/dashboard/Sidebar.jsx:
 *
 *   1. New `EditPlaceholderModal` component near the other modal components.
 *   2. `Divider` accepts `onEdit` and `editLabel` props.
 *   3. New `showEditPlaceholder` state inside the Sidebar component.
 *   4. SPO₂ and Eosinophils dividers receive `onEdit` and `editLabel`.
 *   5. Modal rendered in the Sidebar's top-level fragment.
 *
 * Run from project root:
 *   node patch_sidebar_edit_button.cjs
 */

const fs = require("fs");
const path = require("path");

const SIDEBAR = path.join("src", "components", "dashboard", "Sidebar.jsx");

if (!fs.existsSync(SIDEBAR)) {
  console.error(`✗ Could not find ${SIDEBAR}`);
  process.exit(1);
}

let src = fs.readFileSync(SIDEBAR, "utf8");

if (src.includes("/* EDIT_BUTTON_V1 */")) {
  console.log("✓ Sidebar.jsx already patched — no changes.");
  process.exit(0);
}

// ── 1. Update Divider to accept onEdit and render an Edit link ─────────
//
// Match any prior version of Divider (no marker, V1/V2/V3 sublabel).
const dividerRe =
  /function Divider\(\{ label,(?: subLabel,)? onReadMore, readMoreLabel, extra, disabled \}\)[^]*?\n\}/;

if (!dividerRe.test(src)) {
  console.error("✗ Could not find the Divider component.");
  process.exit(1);
}

const newDivider = `function Divider({ label, subLabel, onReadMore, readMoreLabel, onEdit, editLabel, extra, disabled }) { /* EDIT_BUTTON_V1 */
  const headerExtras = !subLabel && (extra || (onReadMore && !disabled));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 0 4px",
      }}
    >
      {/* Row 1 — title, divider line, optional Edit (and on single-line dividers, extras) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: A,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(38,142,134,0.15)" }}
        />
        {headerExtras && extra && (
          <span style={{ flexShrink: 0, fontSize: 11 }}>{extra}</span>
        )}
        {headerExtras && onReadMore && !disabled && (
          <button
            onClick={onReadMore}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 10,
              fontWeight: 700,
              color: A,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "underline",
              letterSpacing: 0.3,
            }}
          >
            {readMoreLabel ?? "Read more"}
          </button>
        )}
        {onEdit && !disabled && (
          <button
            onClick={onEdit}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 10,
              fontWeight: 700,
              color: A,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "underline",
              letterSpacing: 0.3,
            }}
          >
            {editLabel ?? "Edit"}
          </button>
        )}
      </div>

      {/* Row 2 — date + value on the left, Read more on the far right */}
      {subLabel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 1,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: MU,
              fontStyle: "italic",
              letterSpacing: 0.2,
              flexShrink: 0,
            }}
          >
            {subLabel}
          </span>
          {extra && (
            <span style={{ flexShrink: 0, fontSize: 11 }}>{extra}</span>
          )}
          <div style={{ flex: 1 }} />
          {onReadMore && !disabled && (
            <button
              onClick={onReadMore}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10,
                fontWeight: 700,
                color: A,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                textDecoration: "underline",
                letterSpacing: 0.3,
              }}
            >
              {readMoreLabel ?? "Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}`;

src = src.replace(dividerRe, newDivider);

// ── 2. Insert the EditPlaceholderModal component ───────────────────────
//
// Place it right before the main Sidebar export.
const exportAnchor =
  "// ── main ──────────────────────────────────────────────────────────────────────";
if (!src.includes(exportAnchor)) {
  console.error("✗ Could not find the // ── main ── anchor.");
  process.exit(1);
}

const editModal = `// ── Edit placeholder modal ───────────────────────────────────────────────────

function EditPlaceholderModal({ t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: TX,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.025em",
            marginBottom: 12,
          }}
        >
          {t.sEdit ?? "Edit"}
        </h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: MU }}>
          {t.sEditNotImplemented ?? "Edit not yet implemented"}
        </p>
        <button
          onClick={onClose}
          style={{
            background: A,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 22px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 0.3,
          }}
        >
          {t.sOk ?? "OK"}
        </button>
      </div>
    </div>
  );
}

`;

src = src.replace(exportAnchor, editModal + exportAnchor);

// ── 3. Add showEditPlaceholder state inside Sidebar ────────────────────
const stateAnchor = "const [showMore, setShowMore] = useState(false);";
if (!src.includes(stateAnchor)) {
  console.error("✗ Could not find the showMore state hook anchor.");
  process.exit(1);
}
src = src.replace(
  stateAnchor,
  stateAnchor +
    "\n  const [showEditPlaceholder, setShowEditPlaceholder] = useState(false);",
);

// ── 4. Render the EditPlaceholderModal at the top of the Sidebar JSX ───
//
// Anchor on the WeightModal render at the very top of the return.
const modalAnchor =
  `{showWeightModal && (
        <WeightModal`;
if (!src.includes(modalAnchor)) {
  console.error("✗ Could not find the WeightModal render anchor.");
  process.exit(1);
}

const editModalRender =
  `{showEditPlaceholder && (
        <EditPlaceholderModal
          t={t}
          onClose={() => setShowEditPlaceholder(false)}
        />
      )}
      `;
src = src.replace(modalAnchor, editModalRender + modalAnchor);

// ── 5. Wire SPO₂ divider → onEdit ──────────────────────────────────────
//
// Anchor on `subLabel={latestSpo2v?.date ?? undefined}` and add onEdit on
// the next line, with matching indentation.
const spo2Re =
  /([ \t]*)subLabel=\{latestSpo2v\?\.date \?\? undefined\}/;
if (!spo2Re.test(src)) {
  console.error(
    "✗ Could not find the SPO₂ subLabel line — did the sublabel patch run?",
  );
  process.exit(1);
}
src = src.replace(spo2Re, (_m, indent) =>
  `${indent}subLabel={latestSpo2v?.date ?? undefined}\n${indent}onEdit={() => setShowEditPlaceholder(true)}\n${indent}editLabel={t.sEdit ?? "Edit"}`,
);

// ── 6. Wire Eosinophils divider → onEdit ───────────────────────────────
const eosRe =
  /([ \t]*)subLabel=\{latestEos\?\.date \?\? undefined\}/;
if (!eosRe.test(src)) {
  console.error(
    "✗ Could not find the Eosinophils subLabel line — did the sublabel patch run?",
  );
  process.exit(1);
}
src = src.replace(eosRe, (_m, indent) =>
  `${indent}subLabel={latestEos?.date ?? undefined}\n${indent}onEdit={() => setShowEditPlaceholder(true)}\n${indent}editLabel={t.sEdit ?? "Edit"}`,
);

fs.writeFileSync(SIDEBAR, src, "utf8");
console.log(`✓ Patched ${SIDEBAR}`);
console.log("  · Divider accepts onEdit + editLabel props");
console.log("  · Added EditPlaceholderModal component");
console.log("  · Added showEditPlaceholder state");
console.log("  · SPO₂ and Eosinophils dividers now have Edit buttons");
