"use client";
import { useMemo } from "react";

// ── helpers (mirror CalendarPanel's week logic) ────────────────────────────

const parseLocal = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

// Monday key for a given date (matches CalendarPanel's `(dow + 6) % 7` logic).
const mondayKeyOf = (date) => {
  const dow = (date.getDay() + 6) % 7;
  const mon = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dow);
  return toKey(mon);
};

export default function MonthlySummary({ t, records, viewYear, viewMonth }) {
  const { monthRecords, weekRecords, monthLabel, hasData } = useMemo(() => {
    const months = t.monthNames ?? [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Determine which month to show: prefer viewYear/viewMonth from the calendar,
    // fall back to the most recent record's month, then to current calendar month.
    let year, month;
    if (Number.isInteger(viewYear) && Number.isInteger(viewMonth)) {
      year = viewYear;
      month = viewMonth; // 0-indexed (matches CalendarPanel)
    } else if (records?.length) {
      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
      const [y, m] = sorted[0].date.slice(0, 7).split("-").map(Number);
      year = y;
      month = m - 1;
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const filtered = (records ?? []).filter((r) =>
      r.date?.startsWith(monthKey),
    );

    // ── Build the set of Monday-keys that the calendar shows for this month ──
    // CalendarPanel renders every week that contains at least one day of the
    // viewed month. Mirror that exactly so the summary counts match what the
    // user sees on screen.
    const visibleMondayKeys = new Set();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      visibleMondayKeys.add(mondayKeyOf(new Date(year, month, d)));
    }

    // For each record, find its week's Monday. If that Monday is one of the
    // weeks shown in this month, attach the record to that week.
    // (A record can only belong to one week, so no double-counting.)
    const weekToRecords = {};
    (records ?? []).forEach((r) => {
      if (!r.date) return;
      const mKey = mondayKeyOf(parseLocal(r.date));
      if (!visibleMondayKeys.has(mKey)) return;
      if (!weekToRecords[mKey]) weekToRecords[mKey] = [];
      weekToRecords[mKey].push(r);
    });

    // Flatten to a list of records that the calendar would associate with a
    // visible week row this month. Each week contributes its records once.
    const flatWeekRecords = Object.values(weekToRecords).flat();

    return {
      monthRecords: filtered,
      weekRecords: { byWeek: weekToRecords, flat: flatWeekRecords },
      monthLabel: `${months[month]} ${year}`,
      hasData: filtered.length > 0 || flatWeekRecords.length > 0,
    };
  }, [records, t, viewYear, viewMonth]);

  // ── CAT average uses strict month records (one value per registration) ──
  const catRecords = monthRecords.filter((r) => r.cat8 != null);
  const avgCat = catRecords.length
    ? Math.round(catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length)
    : null;
  const avgCatRaw = catRecords.length
    ? catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length
    : null;

  // ── Exacerbations: count weeks (matches the ⚠ icons on the calendar) ──
  let moderateWeeks = 0;
  let seriousWeeks = 0;
  let activityWeeks = 0;
  let medicineWeeks = 0;

  for (const recs of Object.values(weekRecords.byWeek)) {
    // For each visible week, ask: does any record in this week trigger…?
    const anySerious = recs.some((r) => r.seriousExacerbations);
    const anyModerate =
      !anySerious && recs.some((r) => r.moderateExacerbations);
    if (anySerious) seriousWeeks++;
    if (anyModerate) moderateWeeks++;
    if (recs.some((r) => r.physicalActivity > 0)) activityWeeks++;
    if (recs.some((r) => r.medicines?.length > 0)) medicineWeeks++;
  }

  const rows = [
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
      suffix: avgCat != null ? "/40" : null, /* PATCH:cat-max-suffix v1 */
    },
    {
      icon: "⚠",
      iconColor: "#f97316",
      label: t.moderateExacerbation,
      sublabel: t.moderateExacerbationSub ?? "(prednisolon / antibiotika)",
      value: moderateWeeks,
    },
    {
      icon: "⚠",
      iconColor: "#ef4444",
      label: t.seriousExacerbation,
      sublabel: t.seriousExacerbationSub ?? "(sykehusinnleggelse)",
      value: seriousWeeks,
    },
    {
      icon: "🏃",
      iconColor: "#268E86",
      label: t.physicalActivity,
      value: activityWeeks,
    },
    {
      iconSrc: "/icons/ico_medicine.png",
      icon: "💊",
      iconColor: "#0ea5e9",
      label: t.weeksWithMedicine ?? t.medicines,
      value: medicineWeeks,
    },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid rgba(38,142,134,0.14)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="px-4 pt-2 pb-1.5"
        style={{ borderBottom: "1px solid rgba(38,142,134,0.08)" }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#268E86" }}
        >
          {t.monthlySummary ?? "Monthly summary"}
          {monthLabel && (
            <span
              style={{
                marginLeft: 8,
                color: "#7a9a98",
                fontWeight: 500,
                textTransform: "none",
                letterSpacing: "normal",
              }}
            >
              · {monthLabel}
            </span>
          )}
        </p>
      </div>

      {!hasData ? (
        <p
          style={{
            fontSize: 12,
            color: "#7a9a98",
            fontStyle: "italic",
            padding: "12px 16px",
            margin: 0,
            opacity: 0.75,
          }}
        >
          {t.noData ?? "No data registered."}
        </p>
      ) : (
        rows.map(({ icon, iconSrc, iconColor, label, sublabel, value, suffix }) => {
          /* PATCH:monthly-summary-icons v1 */
          const isEmpty = value === "–" || value === 0;
          return (
            <div
              key={label}
              className="flex items-center px-4 py-1.5"
              style={{ borderBottom: "1px solid rgba(38,142,134,0.06)", gap: 10 }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  lineHeight: 1,
                  color: iconColor,
                }}
                aria-hidden="true"
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt=""
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: "contain",
                      opacity: isEmpty ? 0.4 : 1,
                    }}
                  />
                ) : (
                  <span style={{ opacity: isEmpty ? 0.4 : 1 }}>{icon}</span>
                )}
              </span>
              <span
                className="flex-1 text-sm"
                style={{ color: "#4a7a78" }}
              >
                {label}
                {sublabel && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color: "#7a9a98",
                      fontWeight: 500,
                      fontStyle: "italic",
                    }}
                  >
                    {sublabel}
                  </span>
                )}
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: isEmpty ? "#7a9a98" : "#b91c1c",
                  fontStyle: isEmpty ? "italic" : "normal",
                  opacity: isEmpty ? 0.7 : 1,
                }}
              >
                {value}
                {suffix && (
                  <span
                    style={{
                      marginLeft: 2,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#7a9a98",
                      opacity: 0.8,
                    }}
                  >
                    {suffix}
                  </span>
                )}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}