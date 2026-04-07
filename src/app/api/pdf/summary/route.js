// src/app/api/pdf/summary/route.js
import { NextResponse } from "next/server";
import { generateCopdPdfBuffer } from "@/lib/pdf/generateCopdPdf";

export const runtime = "nodejs"; // needs Node APIs (fs, canvas, pdfkit)

export async function POST(req) {
  try {
    const { patient } = await req.json();
    if (!patient) {
      return NextResponse.json({ error: "Missing patient data" }, { status: 400 });
    }

    const buffer = await generateCopdPdfBuffer(patient);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="copd-summary-${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Content-Length":      String(buffer.length),
      },
    });
  } catch (err) {
    console.error("[pdf/summary]", err);
    return NextResponse.json(
      { error: err.message ?? "PDF generation failed" },
      { status: 500 },
    );
  }
}