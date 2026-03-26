export function LogSearch({ t, search, onSearch }) {
  const legend = [
    ["#ef4444", t.exacerbation],
    ["#8b5cf6", t.notes],
    ["#0ea5e9", t.medication],
  ].filter(Boolean);

  return (
    <div className="px-6 pt-6 pb-2 max-w-3xl mx-auto w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={`🔍  ${t.searchPlaceholder ?? t.placeholder}`}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(38,142,134,0.2)",
          color: "#1a3a38",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#268E86";
          e.target.style.boxShadow = "0 0 0 3px rgba(38,142,134,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(38,142,134,0.2)";
          e.target.style.boxShadow = "none";
        }}
      />

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {legend.map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            <span className="text-xs" style={{ color: "#7a9a98" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
