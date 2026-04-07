// ─────────────────────────────────────────────────────────────────────────────
// LogHeader — add a second PDF button alongside the existing one.
//
// If your current LogHeader looks roughly like this:
//
//   export function LogHeader({ t, filteredCount, onBack, onPdfOpen }) {
//     return (
//       <header ...>
//         <button onClick={onBack}>←</button>
//         <h1>{t.symptomLog}</h1>
//         <button onClick={onPdfOpen}>⬇ PDF</button>   ← existing button
//       </header>
//     );
//   }
//
// Add the onSummaryPdfOpen prop and a second button next to it:
// ─────────────────────────────────────────────────────────────────────────────

export function LogHeader({ t, filteredCount, onBack, onPdfOpen, onSummaryPdfOpen }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 gap-2"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(38,142,134,0.12)",
      }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-all flex-shrink-0"
        style={{ color: "#268E86" }}
      >
        ←
      </button>

      {/* Title + count */}
      <div className="flex-1 min-w-0">
        <p
          className="text-base font-bold truncate"
          style={{ color: "#1a3a38", fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t.symptomLog ?? "Symptom Log"}
        </p>
        {filteredCount != null && (
          <p className="text-xs" style={{ color: "#7a9a98" }}>
            {filteredCount} {t.entries ?? "entries"}
          </p>
        )}
      </div>

      {/* PDF buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Existing: week-log PDF 
        <button
          onClick={onPdfOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{
            background: "rgba(38,142,134,0.08)",
            color: "#268E86",
            border: "1px solid rgba(38,142,134,0.2)",
          }}
          title={t.downloadPdf ?? "Download log PDF"}
        >
          <span>⬇</span>
          <span className="hidden sm:inline">{t.downloadPdf ?? "Log PDF"}</span>
        </button>
*/}
        {/* New: one-page clinical summary */}
        <button
          onClick={onSummaryPdfOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
          style={{
            background: "#268E86",
            color: "#fff",
          }}
          title={t.downloadPdf ?? "Download log PDF"}
        >
          <span>⬇</span>
          <span className="hidden sm:inline">{t.downloadPdf ?? "Log PDF"}</span>
        </button>
      </div>
    </header>
  );
}