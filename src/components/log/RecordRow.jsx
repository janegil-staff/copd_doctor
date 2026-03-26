import Image from "next/image";

const CAT_KEYS = [
  "cat8Cough",
  "cat8Phlegm",
  "cat8ChestTightness",
  "cat8Breathlessness",
  "cat8Activities",
  "cat8Confidence",
  "cat8Sleep",
  "cat8Energy",
];

const CAT_COLOR = (score) => {
  if (score == null)
    return { text: "#7a9a98", bg: "#f0f7f6", border: "#c8e0de" };
  if (score <= 10) return { text: "#0f8a6a", bg: "#edfaf6", border: "#a8e6d4" };
  if (score <= 20) return { text: "#a16200", bg: "#fefbe8", border: "#f6df85" };
  if (score <= 30) return { text: "#c05400", bg: "#fff4ed", border: "#fdc99a" };
  return { text: "#b91c1c", bg: "#fff0f0", border: "#fca5a5" };
};

const BAR_COLOR = (v) =>
  v <= 1 ? "#0f8a6a" : v <= 2 ? "#a16200" : v <= 3 ? "#c05400" : "#b91c1c";

function ScoreBar({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(38,142,134,0.12)", minWidth: 48 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / max) * 100}%`,
            background: BAR_COLOR(value),
          }}
        />
      </div>
      <span
        className="text-xs font-semibold w-3 text-right tabular-nums"
        style={{ color: BAR_COLOR(value) }}
      >
        {value}
      </span>
    </div>
  );
}

export function RecordRow({
  record,
  medicines,
  userMedicines,
  t,
  expanded,
  onToggle,
  isFirst,
}) {
  const c = CAT_COLOR(record.cat8);

  const usedMeds = (record.medicines ?? []).map((id, i) => {
    const base = medicines?.find((m) => m.id === id);
    const user = userMedicines?.find((um) => um.medicineId === id);
    return {
      id,
      name: base?.name ?? user?.medicine?.name ?? `${t.medication} ${id}`,
      image: user?.medicine?.image,
      times: record.medicinesUsedTimes?.[i] ?? null,
    };
  });

  const hasExacerbation =
    record.moderateExacerbations || record.seriousExacerbations;

  const rd = new Date(
    record.date.slice(0, 4),
    record.date.slice(5, 7) - 1,
    record.date.slice(8, 10),
  );
  const dow = (rd.getDay() + 6) % 7;
  const mon = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow);
  const sun = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate() - dow + 6);
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  const thu = new Date(rd);
  thu.setDate(rd.getDate() - dow + 3);
  const jan4 = new Date(thu.getFullYear(), 0, 4);
  const wn = 1 + Math.round((thu - jan4) / 604800000);

  const noteText =
    record.note?.trim() ||
    record.notes?.trim() ||
    record.noteText?.trim() ||
    record.comment?.trim();

  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        background: expanded
          ? "rgba(255,255,255,0.95)"
          : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isFirst ? "none" : "1px solid #c8c8c8",
        boxShadow: expanded ? "0 2px 12px rgba(38,142,134,0.06)" : "none",
      }}
    >
      {/* Compact row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-black/[0.015]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="font-bold tabular-nums shrink-0"
            style={{ color: "#b8cccb", fontSize: 10, minWidth: 22 }}
          >
            {t.week ?? "W"}
            {wn}
          </span>
          <span
            className="text-sm font-semibold shrink-0"
            style={{ color: "#4a7a78" }}
          >
            {fmt(mon)} – {fmt(sun)}
          </span>
          <div className="flex gap-1 items-center">
            {hasExacerbation && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#ef4444" }}
              />
            )}
            {noteText && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#8b5cf6" }}
              />
            )}
            {usedMeds.length > 0 && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#0ea5e9" }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {record.weight != null && (
            <span
              className="text-xs hidden sm:inline"
              style={{ color: "#a0b8b6" }}
            >
              ⚖ {record.weight} kg
            </span>
          )}
          {record.physicalActivity > 0 && (
            <span
              className="text-xs hidden sm:inline"
              style={{ color: "#a0b8b6" }}
            >
              🚶{" "}
              {t.activityLabels?.[record.physicalActivity] ??
                record.physicalActivity}
            </span>
          )}
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
            }}
          >
            {t.catScore} {record.cat8}
          </span>
          <span
            className="transition-transform text-xs"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "#a0b8b6",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-4"
          style={{
            borderTop: "1px solid rgba(38,142,134,0.1)",
            paddingTop: 14,
          }}
        >
          {/* CAT sub-scores */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2.5"
              style={{ color: "#a0b8b6" }}
            >
              {t.catSubScores}
            </p>
            <div className="space-y-2">
              {CAT_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="text-xs shrink-0"
                    style={{ color: "#7a9a98", width: 120 }}
                  >
                    {t[k]}
                  </span>
                  <ScoreBar value={record[k] ?? 0} />
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between mt-2 pt-2"
              style={{ borderTop: "1px solid rgba(38,142,134,0.08)" }}
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "#7a9a98" }}
              >
                Total
              </span>
              <span className="text-sm font-black" style={{ color: c.text }}>
                {record.cat8} / 40
              </span>
            </div>
          </div>

          {/* Weight + activity */}
          {(record.weight != null || record.physicalActivity > 0) && (
            <div className="flex gap-2">
              {record.weight != null && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.05)",
                    border: "1px solid rgba(38,142,134,0.12)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {t.weight}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                    {record.weight} kg
                  </p>
                </div>
              )}
              {record.physicalActivity > 0 && (
                <div
                  className="flex-1 px-3 py-2 rounded-xl text-center"
                  style={{
                    background: "rgba(38,142,134,0.05)",
                    border: "1px solid rgba(38,142,134,0.12)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#7a9a98" }}>
                    {t.physicalActivity}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#268E86" }}>
                    {t.activityLabels?.[record.physicalActivity] ??
                      record.physicalActivity}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Exacerbation */}
          {hasExacerbation && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "#fff0f0", border: "1px solid #fca5a5" }}
            >
              <span>⚠️</span>
              <span
                className="text-xs font-semibold"
                style={{ color: "#b91c1c" }}
              >
                {record.seriousExacerbations
                  ? t.seriousExacerbation
                  : t.moderateExacerbation}
              </span>
            </div>
          )}

          {/* Medicines */}
          {usedMeds.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "#a0b8b6" }}
              >
                {t.usedMedicines}
              </p>
              <div className="space-y-1.5">
                {usedMeds.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #bae6fd",
                    }}
                  >
                    {m.image && (
                      <Image
                        src={m.image}
                        alt={m.name}
                        width={28}
                        height={28}
                        className="object-contain rounded-lg"
                        style={{
                          background: "rgba(38,142,134,0.07)",
                          padding: 2,
                        }}
                      />
                    )}
                    <span
                      className="text-xs font-semibold flex-1"
                      style={{ color: "#1a3a38" }}
                    >
                      {m.name}
                    </span>
                    {m.times != null && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#e0f2fe", color: "#0369a1" }}
                      >
                        {m.times}
                        {t.timesUsed}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {noteText && (
            <div
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#8b5cf6" }}
              >
                {t.note}
              </p>
              <p className="text-sm" style={{ color: "#6d28d9" }}>
                {noteText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
