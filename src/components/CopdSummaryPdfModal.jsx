// src/components/CopdSummaryPdfModal.jsx
"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
/**
 * CopdSummaryPdfModal
 *
 * Generates the "landesiden" one-page COPD summary PDF (server-side via
 * /api/pdf/copd-summary) and triggers a browser download.
 *
 * Styled to be pixel-identical to PdfExportModal.
 *
 * Props:
 *   open     – boolean
 *   onClose  – () => void
 *   patient  – full patient object from sessionStorage
 *   t        – translation object
 */
export default function CopdSummaryPdfModal({ open, onClose, patient, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset error when re-opened
  useEffect(() => {
    if (open) setError(null);
  }, [open]);
  const { lang } = useLang();
  const handleDownload = async () => {
    if (!patient || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pdf/copd-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patient, lang }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.detail ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `copd-summary-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("[CopdSummaryPdfModal]", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Build a quick preview of what the PDF will contain
  const records = patient?.records ?? [];
  const catScores = records.map((r) => r.cat8).filter((v) => v != null);
  const lastCat = catScores.at(-1) ?? "–";
  const vacc = (patient?.vaccinations ?? []).at(-1) ?? {};
  const vaccCount = [
    vacc.flue,
    vacc.covid,
    vacc.pneumococ,
    vacc.rs,
    vacc.pertussis,
  ].filter(Boolean).length;

  const smoking = patient?.smoking ?? {};
  const smokeLabel =
    smoking.smoking === 1
      ? (t.exSmoker ?? "Ex-smoker")
      : smoking.smoking === 2
        ? (t.smoker ?? "Current smoker")
        : (t.nonSmoker ?? "Non-smoker");

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setFullYear(today.getFullYear() - 1);
  const exacPast12 = records.filter((r) => {
    const d = new Date(r.date);
    return d >= cutoff && (r.moderateExacerbations || r.seriousExacerbations);
  }).length;

  const previewItems = [
    { icon: "📋", label: t.catScore ?? "CAT score", value: `${lastCat}/40` },
    { icon: "⚡", label: t.exacerbation ?? "Exacerbations", value: exacPast12 },
    {
      icon: "💊",
      label: t.medicines ?? "Medications",
      value: (patient?.userMedicines ?? []).length,
    },
    {
      icon: "💉",
      label: t.vaccinations ?? "Vaccinations",
      value: `${vaccCount}/5`,
    },
    { icon: "🚬", label: t.smoking ?? "Smoking", value: smokeLabel },
    {
      icon: "🧠",
      label: "GAD-7 / PHQ-9",
      value: `${patient?.latestGad7 ? "✓" : "–"} / ${patient?.latestPhq9 ? "✓" : "–"}`,
    },
  ];

  return (
    <>
      {/* Backdrop — identical z-index stack as PdfExportModal */}
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 z-[401] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(38,142,134,0.2)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.12)" }}
        >
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: "#7a9a98" }}
            >
              {t.downloadPdf ?? "Download PDF"}
            </p>
            <p
              className="text-lg font-bold"
              style={{
                color: "#1a3a38",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {t.summaryReport ?? "COPD Summary"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#a0b8b6" }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">
          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "#4a6a68" }}>
            {t.summaryPdfDesc ??
              "Generates a single-page clinical overview including CAT radar chart, 12-month calendar, medications, vaccinations, GAD-7 and PHQ-9 charts."}
          </p>

          {/* Preview grid */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#7a9a98" }}
            >
              {t.reportContains ?? "Report contains"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {previewItems.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "#f4f8f8",
                    border: "1px solid rgba(38,142,134,0.1)",
                  }}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <div className="min-w-0">
                    <p
                      className="text-xs truncate"
                      style={{ color: "#7a9a98" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#1a3a38" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#b91c1c",
              }}
            >
              {t.pdfError ?? "Could not generate PDF."} — {error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(38,142,134,0.12)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(38,142,134,0.08)",
              color: "#268E86",
              border: "1px solid rgba(38,142,134,0.2)",
            }}
          >
            {t.back ?? "Cancel"}
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || !patient}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#268E86", color: "#fff" }}
          >
            {loading ? (
              <span
                className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                }}
              />
            ) : (
              <span>⬇</span>
            )}
            {loading
              ? (t.generating ?? t.loading ?? "Generating…")
              : (t.downloadSummaryPdf ??
                t.downloadPdf ??
                "Download Summary PDF")}
          </button>
        </div>
      </div>
    </>
  );
}
