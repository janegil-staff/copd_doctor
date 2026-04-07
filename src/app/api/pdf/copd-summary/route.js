// app/api/pdf/copd-summary/route.js
import { NextResponse }                               from "next/server";
import { execFile }                                   from "child_process";
import { writeFile, readFile, unlink, mkdir, access } from "fs/promises";
import { tmpdir }                                     from "os";
import { join }                                       from "path";
import { promisify }                                  from "util";

const execFileAsync = promisify(execFile);

const SCRIPT_PATH  = join(process.cwd(), "scripts",           "generate_copd_pdf.py");
const ICON_PATH    = join(process.cwd(), "public",            "ico_intensity_medicine.png");
const MESSAGES_DIR = join(process.cwd(), "src", "app", "messages");

export async function POST(request) {
  let inputPath  = null;
  let outputPath = null;

  try {
    const body = await request.json();
    const lang = body.lang ?? "en";

    const id  = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const dir = tmpdir();
    await mkdir(dir, { recursive: true });

    inputPath  = join(dir, `copd-in-${id}.json`);
    outputPath = join(dir, `copd-out-${id}.pdf`);

    await writeFile(inputPath, JSON.stringify(body));

    console.log("[copd-summary] script:   ", SCRIPT_PATH);
    console.log("[copd-summary] icon:     ", ICON_PATH);
    console.log("[copd-summary] messages: ", MESSAGES_DIR);
    console.log("[copd-summary] lang:     ", lang);

    let stdout = "", stderr = "";
    try {
      const result = await execFileAsync(
        "python3",
        [SCRIPT_PATH, inputPath, outputPath, ICON_PATH, lang, MESSAGES_DIR],
        {
          timeout: 60_000,
          env: { ...process.env, MPLBACKEND: "Agg" },
        }
      );
      stdout = result.stdout ?? "";
      stderr = result.stderr ?? "";
    } catch (pyErr) {
      stdout = pyErr.stdout ?? "";
      stderr = pyErr.stderr ?? "";
      console.error("[copd-summary] Python exit error:", pyErr.message);
      console.error("[copd-summary] stdout:", stdout);
      console.error("[copd-summary] stderr:", stderr);
      throw new Error(`Python failed:\n${stderr || pyErr.message}`);
    }

    if (stdout) console.log("[copd-summary] stdout:", stdout.trim());
    if (stderr) console.warn("[copd-summary] stderr:", stderr.trim());

    // Verify the file was actually created
    try {
      await access(outputPath);
    } catch {
      throw new Error(
        `Python exited OK but did not create the output file.\nstdout: ${stdout}\nstderr: ${stderr}`
      );
    }

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
    console.error("[copd-summary] final error:", err.message);
    return NextResponse.json(
      { error: "PDF generation failed", detail: err.message },
      { status: 500 }
    );
  } finally {
    for (const p of [inputPath, outputPath]) {
      if (p) unlink(p).catch(() => {});
    }
  }
}