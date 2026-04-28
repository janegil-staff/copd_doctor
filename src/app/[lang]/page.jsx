// app/[lang]/page.jsx
import { redirect } from "next/navigation";

const SUPPORTED_LANGS = [
  "no",
  "en",
  "nl",
  "fr",
  "de",
  "it",
  "sv",
  "da",
  "fi",
  "es",
  "pl",
  "pt",
];

export default function LangRedirect({ params }) {
  const { lang } = params;

  if (SUPPORTED_LANGS.includes(lang)) {
    redirect(`/?language=${lang}`);              // ← endret fra ?lang=
  }

  redirect("/");
}