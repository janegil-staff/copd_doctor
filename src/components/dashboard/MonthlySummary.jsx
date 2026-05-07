"use client";
import { useMemo } from "react";

export default function MonthlySummary({ t, records, viewYear, viewMonth }) {
  const { monthRecords, monthLabel, hasData } = useMemo(() => {
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

    return {
      monthRecords: filtered,
      monthLabel: `${months[month]} ${year}`,
      hasData: filtered.length > 0,
    };
  }, [records, t, viewYear, viewMonth]);

  const catRecords = monthRecords.filter((r) => r.cat8 != null);
  const avgCat = catRecords.length
    ? Math.round(catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length)
    : null;
  const avgCatRaw = catRecords.length
    ? catRecords.reduce((s, r) => s + r.cat8, 0) / catRecords.length
    : null;

  const counts = {
    moderateExacerbations: monthRecords.filter(
      (r) => r.moderateExacerbations && !r.seriousExacerbations,
    ).length,
    seriousExacerbations: monthRecords.filter((r) => r.seriousExacerbations)
      .length,
  };

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
    },
    {
      icon: "⚠",
      iconColor: "#f97316",
      label: t.moderateExacerbation,
      sublabel: t.moderateExacerbationSub ?? "(prednisolon / antibiotika)",
      value: counts.moderateExacerbations,
    },
    {
      icon: "⚠",
      iconColor: "#ef4444",
      label: t.seriousExacerbation,
      sublabel: t.seriousExacerbationSub ?? "(sykehusinnleggelse)",
      value: counts.seriousExacerbations,
    },
    {
      icon: "🏃",
      iconColor: "#268E86",
      label: t.physicalActivity,
      value: monthRecords.filter((r) => r.physicalActivity > 0).length,
    },
    {
      iconSrc: "/icons/ico_medicine.png",
      icon: "💊",
      iconColor: "#0ea5e9",
      label: t.weeksWithMedicine ?? t.medicines,
      value: monthRecords.filter((r) => r.medicines?.length > 0).length,
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
        rows.map(({ icon, iconSrc, iconColor, label, sublabel, value }) => {
          const isEmpty = value === "–" || value === 0;
          return (
            <div
              key={label}
              className="flex items-center px-4 py-1"
              style={{ borderBottom: "1px solid rgba(38,142,134,0.06)" }}
            >
              <span
                className="flex-1 text-sm ml-2"
                style={{ color: "#4a7a78" }}
              >
                {label}
                {sublabel && (
                  <span
                    style={{
                      marginLeft: 4,
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
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
