export function StatRow({ label, value, color }) {
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: "1px solid rgba(38,142,134,0.07)" }}
    >
      <span className="text-xs" style={{ color: "#7a9a98" }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: color ?? "#268E86" }}>
        {value}
      </span>
    </div>
  );
}
