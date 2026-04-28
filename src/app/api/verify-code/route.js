// app/api/verify-code/route.js
import { NextResponse } from "next/server";
import { mockPatient } from "@/lib/mockPatient";

const SUPPORTED = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"];

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const code = body?.code;
  const requestedLang = String(body?.language || "en").toLowerCase();
  const language = SUPPORTED.includes(requestedLang) ? requestedLang : "en";

  if (!/^\d{6}$/.test(code?.trim())) {
    return NextResponse.json({ valid: false });
  }

  if (code === "000000") {
    return NextResponse.json({ valid: true, patient: mockPatient });
  }

  try {
    const url =
      `https://server.copdcalendar.com/api/patients/details/json?accessCode=${encodeURIComponent(code.trim())}&language=${encodeURIComponent(language)}`;

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ valid: false });
    }

    const data = await res.json();

    if (!data || !data.records) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true, patient: data });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
