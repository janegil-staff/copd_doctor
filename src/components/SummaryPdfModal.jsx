"use client";
import { useState } from "react";

/**
 * SummaryPdfModal
 *
 * Triggers the one-page clinical summary PDF (the "landesiden" layout).
 * Calls POST /api/pdf/summary, receives the PDF blob, and auto-downloads it.
 *
 * Props:
 *   open     – boolean
 *   onClose  – () => void
 *   patient  – full patient object from sessionStorage
 *   t        – translation object
 */
export default function SummaryPdfModal({ open, onClose, patient, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pdf/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "Unknown error");
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `copd-summary-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Summary PDF error:", err);
      setError(err.message ?? "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
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
          width: "min(420px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(38,142,134,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.12)" }}
        >
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: "#7a9a98" }}
            >
              {t.downloadSummaryPdf ?? "Clinical Summary"}
            </p>
            <p
              className="text-lg font-bold"
              style={{
                color: "#1a3a38",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {t.summaryPdfTitle ?? "Patient Overview"}
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

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* What's included */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#7a9a98" }}
            >
              {t.includes ?? "Includes"}
            </p>
            <ul className="space-y-2">
              {[
                t.summaryIncludesCat     ?? "CAT score radar chart (best / worst / last week)",
                t.summaryIncludesCalendar?? "12-month exacerbation calendar",
                t.summaryIncludesMeds    ?? "Medication & satisfaction",
                t.summaryIncludesVacc    ?? "Vaccination status",
                t.summaryIncludesGad7    ?? "GAD-7 anxiety chart & table",
                t.summaryIncludesPhq9    ?? "PHQ-9 depression chart & table",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "#1a3a38" }}
                >
                  <span style={{ color: "#268E86", flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Data note */}
          <p className="text-xs" style={{ color: "#a0b8b6" }}>
            {t.summaryDataNote ??
              "Uses all records on file. The report is generated server-side and sent as a PDF file."}
          </p>

          {/* Error */}
          {error && (
            <p
              className="text-xs px-3 py-2 rounded-xl"
              style={{ background: "#fff0f0", color: "#c0392b" }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
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
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#268E86", color: "#fff" }}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>📋</span>
            )}
            {loading
              ? (t.generating ?? "Generating…")
              : (t.downloadSummaryPdf ?? "Download Summary")}
          </button>
        </div>
      </div>
    </>
  );
}
