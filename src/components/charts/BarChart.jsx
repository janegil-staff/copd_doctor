
export function BarChart({ data, colorFn, height = 90 }) {
  if (!data?.length)
    return (
      <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>
        –
      </p>
    );
 
  const vals = data.map((d) => d.value);
  const maxV = Math.max(...vals, 1);
  const W = 400,
    H = height;
  const padL = 36,
    padR = 8,
    padT = 8,
    padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const bw = chartW / data.length;
 
  const ticks = [0, 0.5, 1].map((f) => ({
    value: Math.round(f * maxV),
    y: padT + chartH - f * chartH,
  }));
 
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={tick.y}
            x2={W - padR}
            y2={tick.y}
            stroke="#e0eeec"
            strokeWidth="1"
          />
          <text
            x={padL - 4}
            y={tick.y + 3.5}
            textAnchor="end"
            fontSize="9"
            fill="#a0b8b6"
          >
            {tick.value}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = (d.value / maxV) * chartH;
        const x = padL + i * bw + bw * 0.15;
        const y = padT + chartH - barH;
        const color = colorFn ? colorFn(d.value) : "#268E86";
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={bw * 0.7}
            height={Math.max(barH, 2)}
            rx="3"
            fill={color}
            opacity="0.85"
          />
        );
      })}
    </svg>
  );
}
