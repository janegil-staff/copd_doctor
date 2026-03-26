export function Card({ title, subtitle, children, accent }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(38,142,134,0.14)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#7a9a98" }}
        >
          {title}
        </p>
        {accent && (
          <span className="text-lg font-black" style={{ color: accent.color }}>
            {accent.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs mb-3" style={{ color: "#a0b8b6" }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
