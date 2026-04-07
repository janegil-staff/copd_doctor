// app/api/pdf/copd-summary/route.js
import { NextResponse } from "next/server";
import { execFile }     from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir }  from "os";
import { join }    from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Place generate_copd_pdf.py in <project-root>/scripts/
const SCRIPT_PATH = join(process.cwd(), "scripts", "generate_copd_pdf.py");

export async function POST(request) {
  let inputPath  = null;
  let outputPath = null;

  try {
    const body = await request.json();

    const id   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    inputPath  = join(tmpdir(), `copd-in-${id}.json`);
    outputPath = join(tmpdir(), `copd-out-${id}.pdf`);

    await writeFile(inputPath, JSON.stringify(body));

    await execFileAsync("python3", [SCRIPT_PATH, inputPath, outputPath], {
      timeout: 30_000,
      env: { ...process.env, MPLBACKEND: "Agg" },
    });

    const pdfBuffer = await readFile(outputPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="copd-summary-${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Content-Length":      String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[copd-summary route]", err);
    return NextResponse.json(
      { error: "PDF generation failed", detail: err.message },
      { status: 500 },
    );
  } finally {
    for (const p of [inputPath, outputPath]) {
      if (p) unlink(p).catch(() => {});
    }
  }
}