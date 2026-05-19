// patch_drawer_content_cat_max.cjs
// Adds "/40" suffix to the CAT score badge in DrawerContent.
// Idempotent: re-running is a no-op.
//
// Run from project root:
//   node patch_drawer_content_cat_max.cjs

const fs = require("fs");
const path = require("path");

const FILE = path.join(
  "src",
  "components",
  "dashboard",
  "DrawerContent.jsx",
);

const MARKER = "/* PATCH:drawer-cat-max v1 */";

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(MARKER)) {
  console.log("✓ Already patched — skipping.");
  process.exit(0);
}

// Match the entire CAT badge div and replace its content.
// Tolerant of whitespace; uses the specific class string as anchor.
const old =
  /(<div\s+className="text-2xl font-black px-4 py-2 rounded-xl"\s+style=\{\{\s*background:\s*catColor\.bg,\s*color:\s*catColor\.text,\s*border:\s*`1px solid \$\{catColor\.border\}`\s*\}\}\s*>)\s*\{record\.cat8\}\s*(<\/div>)/m;

const replacement =
  `$1{record.cat8}<span style={{ fontSize: "0.55em", fontWeight: 600, opacity: 0.65, marginLeft: 2 }}>/40</span>$2 ${MARKER}`;

if (!old.test(src)) {
  console.error("✗ Could not locate the CAT badge div in DrawerContent.jsx");
  process.exit(1);
}

src = src.replace(old, replacement);

fs.writeFileSync(FILE, src, "utf8");
console.log("✓ Patched src/components/dashboard/DrawerContent.jsx");
