"use client";
import { useState, useMemo } from "react";

const A = "#268E86";
const BO = "rgba(38,142,134,0.14)";
const TX = "#1a3a38";
const MU = "#7a9a98";
const WARN = "#e8a838";
const DANGER = "#e05050";
const OK = "#4aba7a";

const CAT_COLOR = (score) => {
  if (score === null || score === undefined)
    return { bg: "transparent", text: "#b0c4c2", border: "transparent" };
  if (score <= 10) return { bg: "#edfaf6", text: "#0f8a6a", border: "#a8e6d4" };
  if (score <= 20) return { bg: "#fefbe8", text: "#a16200", border: "#f6df85" };
  if (score <= 30) return { bg: "#fff4ed", text: "#c05400", border: "#fdc99a" };
  return { bg: "#fff0f0", text: "#b91c1c", border: "#fca5a5" };
};

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// ─── Exacerbation icon (left of week row) ──────────────────────────────────
function ExacerbationTriangle({ level }) {
  const color = level === "serious" ? "#E53935" : "#FFB300";
  const title =
    level === "serious"
      ? "Serious exacerbation this week"
      : "Moderate exacerbation this week";

  return (
    <div
      title={title}
      style={{
        position: "absolute",
        left: -24,
        top: "50%",
        transform: "translateY(-50%)",
        width: 20,
        height: 20,
        zIndex: 10,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        lineHeight: 1,
        color,
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      ⚠
    </div>
  );
}

// ─── Medicine icon (top-right) ─────────────────────────────────────────────
function MedicineIcon() {
  return (
    <div
      title="Medicine used this week"
      style={{
        position: "absolute",
        right: -4,
        top: -3,
        width: 13,
        height: 13,
        zIndex: 10,
        pointerEvents: "none",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
      }}
    >
      <img
        src="/icons/ico_medicine.png"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}

// ─── Exercise icon (bottom-right) ──────────────────────────────────────────
function ExerciseIcon() {
  return (
    <div
      title="Physical activity this week"
      style={{
        position: "absolute",
        right: -2,
        bottom: -4,
        width: 16,
        height: 16,
        zIndex: 10,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        lineHeight: 1,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
      }}
    >
      🏃
    </div>
  );
}

// ─── Satisfaction dice ─────────────────────────────────────────────────────
function SatDice({ value = 0 }) {
  const color =
    value <= 1
      ? DANGER
      : value <= 2
        ? WARN
        : value <= 3
          ? "#e07a30"
          : value === 4
            ? A
            : OK;
  const dots = {
    1: [[9, 9]],
    2: [
      [5, 5],
      [13, 13],
    ],
    3: [
      [5, 5],
      [9, 9],
      [13, 13],
    ],
    4: [
      [5, 5],
      [13, 5],
      [5, 13],
      [13, 13],
    ],
    5: [
      [5, 5],
      [13, 5],
      [9, 9],
      [5, 13],
      [13, 13],
    ],
  };
  const v = Math.min(5, Math.max(1, Math.round(value)));
  const positions = dots[v] ?? dots[1];
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="20" height="20" rx="4" ry="4" fill={color} />
      {positions.map(([cx, cy], i) => (
        <circle key={i} cx={cx + 2} cy={cy + 2} r="2" fill="#fff" />
      ))}
    </svg>
  );
}

// ─── Training chip ─────────────────────────────────────────────────────────
function Chip({ label }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 6px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        marginRight: 3,
        marginBottom: 2,
        background: A,
        color: "#fff",
      }}
    >
      {label}
    </span>
  );
}

export default function CalendarPanel({
  t,
  records,
  medicines,
  userMedicines = [],
  latestMedicineTraining = null,
  latestMedicineSatisfaction = null,
  onDayClick,
  selectedDate,
}) {
  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [records]);

  const weekMap = useMemo(() => {
    const map = {};

    const parseLocal = (dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const toKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    (records || []).forEach((r) => {
      const d = parseLocal(r.date);
      const dow = (d.getDay() + 6) % 7;
      for (let i = 0; i < 7; i++) {
        const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + i);
        const key = toKey(dd);
        if (!map[key]) map[key] = r;
      }
    });
    (records || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [records]);

  const now = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(0, 4));
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(5, 7)) - 1;
    return now.getMonth();
  });

  const cells = buildCalendar(viewYear, viewMonth);
  const pad = (n) => String(n).padStart(2, "0");
  const months = t.monthNames ?? [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const days = t.days ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // FIX: strict date filter — matches exactly what SummaryPage uses
  const monthRecords = useMemo(() => {
    const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;
    return (records || []).filter((r) => r.date.startsWith(monthKey));
  }, [viewYear, viewMonth, records]);

  const catRecords = monthRecords.filter((r) => r.cat8 != null);
  const avgCat = catRecords.length
    ? Math.round(catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length)
    : null;
  const avgCatRaw = catRecords.length
    ? catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length
    : null;

  const counts = {
    low:                   monthRecords.filter((r) => r.cat8 != null && r.cat8 <= 10).length,
    medium:                monthRecords.filter((r) => r.cat8 != null && r.cat8 > 10 && r.cat8 <= 20).length,
    high:                  monthRecords.filter((r) => r.cat8 != null && r.cat8 > 20 && r.cat8 <= 30).length,
    veryHigh:              monthRecords.filter((r) => r.cat8 != null && r.cat8 > 30).length,
    moderateExacerbations: monthRecords.filter((r) => r.moderateExacerbations && !r.seriousExacerbations).length,
    seriousExacerbations:  monthRecords.filter((r) => r.seriousExacerbations).length,
    filled:                monthRecords.length,
  };

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#268E86", fontSize: 18 }}
        >
          ‹
        </button>
        <h2
          className="text-lg font-bold tracking-wide"
          style={{
            color: "#1a3a38",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {months[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#268E86", fontSize: 18 }}
        >
          ›
        </button>
      </div>

      {/* Week rows */}
      <div style={{ paddingLeft: 26, paddingRight: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {(() => {
          const rows = [];
          const seen = new Set();

          const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            const dow = (date.getDay() + 6) % 7;
            const mon = new Date(viewYear, viewMonth, d - dow);
            const monKey = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
            if (seen.has(monKey)) continue;
            seen.add(monKey);

            const thu = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 3);
            const jan4 = new Date(thu.getFullYear(), 0, 4);
            const wn = 1 + Math.round((thu - jan4) / 604800000);

            const record = weekMap[monKey];
            const isSelected = record && selectedDate === record.date;

            let exLevel = null;
            if (record?.seriousExacerbations) {
              exLevel = "serious";
            } else if (record?.moderateExacerbations) {
              exLevel = "moderate";
            }

            const bgColor = record
              ? record.cat8 == null
                ? "rgba(38,142,134,0.08)"
                : record.cat8 <= 10
                  ? "#4CC189"
                  : record.cat8 <= 20
                    ? "#FFC659"
                    : record.cat8 <= 30
                      ? "#FF7473"
                      : "#BE3830"
              : "rgba(38,142,134,0.03)";

            const stripeColor = isSelected
              ? "#0f6b63"
              : record
                ? record.cat8 == null
                  ? "rgba(38,142,134,0.2)"
                  : record.cat8 <= 10
                    ? "#2e9e68"
                    : record.cat8 <= 20
                      ? "#c99500"
                      : record.cat8 <= 30
                        ? "#cc4040"
                        : "#8a2020"
                : "rgba(38,142,134,0.08)";

            rows.push(
              <div
                key={monKey}
                style={{ position: "relative" }}
              >
                {exLevel && <ExacerbationTriangle level={exLevel} />}
                {record?.medicines?.length > 0 && <MedicineIcon />}
                {record?.physicalActivity > 0 && <ExerciseIcon />}

                <div
                  role="button"
                  tabIndex={record ? 0 : -1}
                  onClick={() => record && onDayClick(record)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && record && onDayClick(record)
                  }
                  className="w-full flex flex-col rounded-xl transition-all overflow-hidden"
                  style={{
                    background: bgColor,
                    border: "none",
                    cursor: record ? "pointer" : "default",
                    boxShadow: record ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    paddingLeft: 8,
                    paddingRight: 10,
                    paddingTop: 3,
                    paddingBottom: 3,
                    gap: 1,
                    color: record ? "#1a1a1a" : "#a0b8b6",
                    WebkitTextFillColor: record ? "#1a1a1a" : "#a0b8b6",
                  }}
                >
                  <div
                    className="flex items-center justify-between w-full"
                    style={{ direction: "ltr" }}
                  >
                    {Array.from({ length: 7 }).map((_, di) => {
                      const dd = new Date(
                        mon.getFullYear(),
                        mon.getMonth(),
                        mon.getDate() + di,
                      );
                      const inMonth = dd.getMonth() === viewMonth;
                      const dayNum = dd.getDate();
                      const isToday = dd.toDateString() === now.toDateString();
                      return (
                        <div
                          key={di}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background:
                              isToday && record
                                ? "rgba(0,0,0,0.12)"
                                : "transparent",
                            border:
                              isToday && record
                                ? "1.5px solid rgba(0,0,0,0.5)"
                                : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: isToday ? 900 : 700,
                              color: record
                                ? record.cat8 == null
                                  ? inMonth
                                    ? "rgba(38,142,134,0.5)"
                                    : "rgba(38,142,134,0.25)"
                                  : inMonth
                                    ? "#1a1a1a"
                                    : "rgba(0,0,0,0.3)"
                                : inMonth
                                  ? "#a0b8b6"
                                  : "#d0e0de",
                              lineHeight: 1,
                            }}
                          >
                            {dayNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>,
            );
          }
          return rows;
        })()}
      </div>

      {/* Monthly summary */}
      <div
        className="mt-5 rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid rgba(38,142,134,0.14)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="px-4 pt-3 pb-2"
          style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#268E86" }}
          >
            {t.monthlySummary}
          </p>
        </div>

        {[
          {
            icon: "⬤",
            iconColor:
              avgCatRaw == null
                ? "#a0b8b6"
                : avgCatRaw <= 10
                  ? "#4CC189"
                  : avgCatRaw <= 20
                    ? "#FFC659"
                    : avgCatRaw <= 30
                      ? "#FF7473"
                      : "#BE3830",
            label: t.avgSymptoms,
            value: avgCat ?? "–",
          },
          {
            icon: "⚠",
            iconColor: "#f97316",
            label: t.moderateExacerbation,
            value: counts.moderateExacerbations,
          },
          {
            icon: "⚠",
            iconColor: "#ef4444",
            label: t.seriousExacerbation,
            value: counts.seriousExacerbations,
          },
          {
            icon: "🏃",
            iconColor: "#268E86",
            label: t.physicalActivity,
            value: (() => {
              const vals = monthRecords.filter((r) => r.physicalActivity > 0);
              if (!vals.length) return "–";
              const avg = Math.round(
                vals.reduce((s, r) => s + r.physicalActivity, 0) / vals.length,
              );
              return t.activityLabels?.[avg] ?? avg;
            })(),
          },
          {
            iconSrc: "/icons/ico_medicine.png",
            icon: "💊",
            iconColor: "#0ea5e9",
            label: t.weeksWithMedicine ?? t.medicines,
            value: monthRecords.filter((r) => r.medicines?.length > 0).length,
          },
        ].map(({ icon, iconSrc, iconColor, label, value }) => (
          <div
            key={label}
            className="flex items-center px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(38,142,134,0.06)" }}
          >
            <span
              className="w-6 text-base flex items-center"
              style={{ color: iconColor }}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt=""
                  style={{ width: 18, height: 18, objectFit: "contain" }}
                />
              ) : (
                icon
              )}
            </span>
            <span className="flex-1 text-sm ml-2" style={{ color: "#4a7a78" }}>
              {label}
            </span>
            <span className="text-sm font-bold" style={{ color: "#b91c1c" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Active medications */}
      <ActiveMedicationsList
        t={t}
        userMedicines={userMedicines}
        medicines={medicines}
        latestMedicineTraining={latestMedicineTraining}
        latestMedicineSatisfaction={latestMedicineSatisfaction}
      />

      {/* Previously used medications */}
      <StoppedMedicationsList t={t} userMedicines={userMedicines} />
    </div>
  );
}

// ─── ActiveMedicationsList ────────────────────────────────────────────────────
function ActiveMedicationsList({
  t,
  userMedicines,
  medicines,
  latestMedicineTraining,
  latestMedicineSatisfaction,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const activeMeds = (userMedicines || []).filter(
    (m) => !m.stoppedUsage || m.stoppedUsage >= today,
  );

  if (activeMeds.length === 0) return null;

  const MED_TYPE = { 1: "Inhaler", 2: "Tablet", 3: "Injection" };
  const MED_REASON = { 0: "Rescue", 1: "Maintenance", 2: "Add-on" };

  const TRAINING_KEYS = [
    { key: "generalPractitioner", label: t.sGp ?? "GP" },
    { key: "pharmacy", label: t.sPharmacy ?? "Pharmacy" },
    { key: "homeCareNurse", label: t.sHomeCareNurse ?? "Home nurse" },
    { key: "rehabilitationCenter", label: t.sRehab ?? "Rehab" },
    { key: "hospitalLungSpecialist", label: t.sLungSpecialist ?? "Lung specialist" },
    { key: "trainingVideo", label: t.sVideo ?? "Video" },
  ];

  const satMap = {};
  (latestMedicineSatisfaction?.medicines ?? []).forEach((m) => {
    satMap[m.medicineId] = m.satisfaction;
  });

  const medName = (id) => {
    const um = (userMedicines || []).find((m) => m.medicineId === id);
    if (um?.medicine?.name) return um.medicine.name;
    return (medicines || []).find((m) => m.id === id)?.name ?? `Med #${id}`;
  };

  return (
    <div
      className="mt-5 rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid rgba(38,142,134,0.14)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="px-4 pt-3 pb-2 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: A, margin: 0 }}
        >
          {t.sMedication ?? "Medication"}
        </p>
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: A, margin: 0 }}
        >
          {t.sSatisfaction ?? "Satisfaction"}
        </p>
      </div>

      <div style={{ padding: "4px 14px 8px" }}>
        {activeMeds.map((um) => {
          const trainEntry = (latestMedicineTraining?.medicines ?? []).find(
            (m) => m.medicineId === um.medicineId,
          );
          const trainSources = trainEntry
            ? TRAINING_KEYS.filter((k) => trainEntry[k.key] === true)
            : [];
          const hasTrain = trainSources.length > 0;

          return (
            <div
              key={um.medicineId}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid rgba(38,142,134,0.07)",
              }}
            >
              {um.medicine?.image ? (
                <img
                  src={um.medicine.image}
                  alt={um.medicine.name ?? ""}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "contain",
                    borderRadius: 6,
                    border: `1px solid ${BO}`,
                    background: "#fff",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    flexShrink: 0,
                    marginTop: 2,
                    background: "rgba(38,142,134,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  💊
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: TX,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textTransform: "capitalize",
                  }}
                >
                  {medName(um.medicineId)}
                </p>
                {um.startedUsage && (
                  <p style={{ fontSize: 10, color: MU, margin: "2px 0 0" }}>
                    {um.startedUsage}
                  </p>
                )}
                {/* Training: only shown for inhalers (type 1) */}
                {um.medicine?.type === 1 && (
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: MU,
                      }}
                    >
                      {t.sTrainingLabel ?? "Training:"}
                    </span>
                    {hasTrain ? (
                      trainSources.map((s) => (
                        <Chip key={s.key} label={s.label} />
                      ))
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: DANGER,
                        }}
                      >
                        {t.sNoTraining ?? "✗ No training"}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {satMap[um.medicineId] != null && (
                <SatDice value={satMap[um.medicineId]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── StoppedMedicationsList ───────────────────────────────────────────────────
const REASON_CONFIG = {
  0: { key: "sideEffects",     color: { bg: "#fde8e8", text: "#b42525", border: "#f5b5b5" } },
  1: { key: "ineffective",     color: { bg: "#fff4e8", text: "#a35400", border: "#f5c9a0" } },
  2: { key: "otherReason",     color: { bg: "#f0f0f0", text: "#555",    border: "#cecece" } },
};
const DEFAULT_REASON_COLOR = { bg: "#f0f0f0", text: "#555", border: "#cecece" };

function StoppedMedicationsList({ t, userMedicines }) {
  const [expanded, setExpanded] = useState(false);

  const stopped = (userMedicines || [])
    .filter((m) => m.stoppedUsage)
    .sort((a, b) => new Date(b.stoppedUsage) - new Date(a.stoppedUsage));

  if (stopped.length === 0) return null;

  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString();
  };

  const daysBetween = (start, end) => {
    if (!start || !end) return null;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  };

  const reasonLabel = (reason) => {
    if (reason == null) return t.notSpecified ?? "Not specified";
    const cfg = REASON_CONFIG[reason];
    if (!cfg) return t.otherReason ?? "Other";
    const fallbacks = {
      sideEffects:     "Side effects",
      ineffective:     "Not effective",
      otherReason:     "Other",
    };
    return t[cfg.key] ?? fallbacks[cfg.key];
  };

  const reasonColor = (reason) =>
    REASON_CONFIG[reason]?.color ?? DEFAULT_REASON_COLOR;

  return (
    <div
      className="mt-5 rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid rgba(38,142,134,0.14)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 pt-3 pb-2 flex items-center justify-between"
        style={{
          borderBottom: expanded ? "1px solid rgba(38,142,134,0.08)" : "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#268E86", margin: 0 }}
        >
          {t.stoppedMedications ?? "Previously used medications"}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: "#268E86",
              borderRadius: 20,
              padding: "2px 8px",
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {stopped.length}
          </span>
          <span
            style={{
              fontSize: 14,
              color: "#268E86",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {stopped.map((um) => {
          const med = um.medicine ?? {};
          const color = reasonColor(um.reason);
          const days = daysBetween(um.startedUsage, um.stoppedUsage);

          return (
            <div
              key={`${um.medicineId}-${um.stoppedUsage}`}
              style={{
                padding: "10px 12px",
                background: "rgba(38,142,134,0.03)",
                borderRadius: 10,
                border: "1px solid rgba(38,142,134,0.08)",
                borderLeft: `3px solid ${color.text}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              {med.image ? (
                <img
                  src={med.image}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    objectFit: "cover",
                    flexShrink: 0,
                    background: "#e8f5f3",
                    opacity: 0.8,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#e8f5f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0,
                    opacity: 0.7,
                  }}
                >
                  💊
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a6b65",
                    textTransform: "capitalize",
                  }}
                >
                  {med.name ?? `#${um.medicineId}`}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#7a9a98",
                    marginTop: 3,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2px 8px",
                  }}
                >
                  <span>
                    {um.startedUsage ? fmtDate(um.startedUsage) : "?"} →{" "}
                    {fmtDate(um.stoppedUsage)}
                  </span>
                  {days != null && (
                    <span>
                      · {days} {t.daysLabel ?? "days"}
                    </span>
                  )}
                  {med.atcCode && <span>· {med.atcCode}</span>}
                </div>
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                  borderRadius: 20,
                  padding: "3px 10px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                {reasonLabel(um.reason)}
              </span>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}