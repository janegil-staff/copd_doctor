#!/usr/bin/env node
/**
 * Idempotent patch — updates src/locales/no.json so the `sEdit` key
 * reads "editer" instead of "Rediger".
 *
 * Only changes Norwegian. All other locales are left untouched.
 *
 * Run from project root:
 *   node patch_locale_no_edit.cjs
 */

const fs = require("fs");
const path = require("path");

const FILE = path.join("src", "locales", "no.json");
const NEW_VALUE = "editer";

if (!fs.existsSync(FILE)) {
  console.error(`✗ Could not find ${FILE}`);
  process.exit(1);
}

let json;
try {
  json = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (e) {
  console.error(`✗ Failed to parse ${FILE}: ${e.message}`);
  process.exit(1);
}

if (json.sEdit === NEW_VALUE) {
  console.log(`✓ ${FILE} already has sEdit = "${NEW_VALUE}" — no changes.`);
  process.exit(0);
}

const prev = json.sEdit;
json.sEdit = NEW_VALUE;

fs.writeFileSync(FILE, JSON.stringify(json, null, 2) + "\n", "utf8");
console.log(`✓ Updated ${FILE}`);
console.log(`  · sEdit: "${prev ?? "(missing)"}" → "${NEW_VALUE}"`);
