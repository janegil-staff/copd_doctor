/**
 * Fetch patient details from the COPD calendar server, including
 * language-localized advice.
 *
 * Usage in your patient page:
 *   const data = await fetchPatientDetails(accessCode, lang);
 *   sessionStorage.setItem("patient", JSON.stringify(data));
 */

const BASE_URL = "https://server.copdcalendar.com/api/patients/details/json";

// Map your app's language codes to what the server accepts.
// Adjust if Kjell confirms different supported codes.
const SERVER_LANG_MAP = {
  no: "no",
  nb: "no",
  nn: "no",
  en: "en",
  de: "de",
  // fall-through: send the user's lang as-is and let the server fallback
};

export function buildPatientDetailsUrl(accessCode, lang = "en") {
  const serverLang = SERVER_LANG_MAP[lang] || lang || "en";
  const params = new URLSearchParams({
    accessCode: String(accessCode),
    language: serverLang,
  });
  return `${BASE_URL}?${params.toString()}`;
}

export async function fetchPatientDetails(accessCode, lang = "en") {
  const url = buildPatientDetailsUrl(accessCode, lang);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch patient details (${res.status} ${res.statusText})`,
    );
  }
  return res.json();
}
