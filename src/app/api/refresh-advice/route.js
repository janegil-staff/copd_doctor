// app/api/refresh-advice/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { code, language = 'en' } = await req.json();

    const apiBase =
      process.env.COPD_API_BASE || 'https://server.copdcalendar.com';

    const url = `${apiBase}/api/patients/details/json?accessCode=${encodeURIComponent(
      code
    )}&language=${encodeURIComponent(language)}`;

    console.log('[refresh-advice] code:', code, 'language:', language);

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: 'Failed to refresh advice.' },
        { status: 400 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      ok: true,
      advice: Array.isArray(data.advice) ? data.advice : [],
    });
  } catch (err) {
    console.error('[refresh-advice] error:', err);
    return NextResponse.json(
      { ok: false, message: err?.message ?? 'Network error.' },
      { status: 500 }
    );
  }
}