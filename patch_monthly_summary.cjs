// patch_monthly_summary.cjs
// Restores the icon column in MonthlySummary rows.
// Idempotent: re-running is a no-op.
//
// Run from project root:
//   node patch_monthly_summary.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join(
  "src",
  "components",
  "dashboard",
  "MonthlySummary.jsx",
);

const MARKER = "/* PATCH:monthly-summary-icons v1 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER)) {
  console.log("✓ Already patched — skipping.");
  process.exit(0);
}

// Match the entire rows.map(...) JSX block and replace it.
const oldBlock =
  /rows\.map\(\(\{\s*icon,\s*iconSrc,\s*iconColor,\s*label,\s*sublabel,\s*value\s*\}\) => \{[\s\S]*?\}\)\s*\)\}/m;

const newBlock = `rows.map(({ icon, iconSrc, iconColor, label, sublabel, value }) => {
          ${MARKER}
          const isEmpty = value === "–" || value === 0;
          return (
            <div
              key={label}
              className="flex items-center px-4 py-1.5"
              style={{ borderBottom: "1px solid rgba(38,142,134,0.06)", gap: 10 }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  lineHeight: 1,
                  color: iconColor,
                }}
                aria-hidden="true"
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt=""
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: "contain",
                      opacity: isEmpty ? 0.4 : 1,
                    }}
                  />
                ) : (
                  <span style={{ opacity: isEmpty ? 0.4 : 1 }}>{icon}</span>
                )}
              </span>
              <span
                className="flex-1 text-sm"
                style={{ color: "#4a7a78" }}
              >
                {label}
                {sublabel && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color: "#7a9a98",
                      fontWeight: 500,
                      fontStyle: "italic",
                    }}
                  >
                    {sublabel}
                  </span>
                )}
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: isEmpty ? "#7a9a98" : "#b91c1c",
                  fontStyle: isEmpty ? "italic" : "normal",
                  opacity: isEmpty ? 0.7 : 1,
                }}
              >
                {value}
              </span>
            </div>
          );
        })
      )}`;

if (!oldBlock.test(src)) {
  console.error(
    "✗ Could not locate the rows.map(...) block in MonthlySummary.jsx",
  );
  console.error(
    "  The file may have been edited since this patch was written.",
  );
  process.exit(1);
}

src = src.replace(oldBlock, newBlock);

fs.writeFileSync(FILE, src, "utf8");
console.log("✓ Patched src/components/dashboard/MonthlySummary.jsx");
