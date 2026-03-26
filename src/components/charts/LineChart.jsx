export function LineChart({
  data,
  color = "#268E86",
  min: forceMin,
  max: forceMax,
  height = 90,
}) {
  if (!data?.length)
    return (
      <p className="text-xs text-center py-4" style={{ color: "#a0b8b6" }}>
        –
      </p>
    );

  const vals = data.map((d) => d.value);
  const minV = forceMin ?? Math.min(...vals);
  const maxV = forceMax ?? Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 400,
    H = height;
  const padL = 36,
    padR = 8,
    padT = 8,
    padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const pts = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padT + chartH - ((d.value - minV) / range) * chartH;
    return [x, y];
  });
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${padT + chartH} L${pts[0][0]},${padT + chartH} Z`;

  const ticks = [0, 0.5, 1].map((f) => ({
    value: Math.round(minV + f * range),
    y: padT + chartH - f * chartH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
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
      <path d={area} fill={`url(#grad-${color.replace("#", "")})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
    </svg>
  );
}
