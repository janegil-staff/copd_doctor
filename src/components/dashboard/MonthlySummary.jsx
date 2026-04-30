"use client";
import { useMemo } from "react";

export default function MonthlySummary({ t, records }) {
  const { monthRecords, monthLabel } = useMemo(() => {
    if (!records?.length) return { monthRecords: [], monthLabel: null };

    // Find most recent record's month
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = sorted[0].date;
    const monthKey = latestDate.slice(0, 7); // "YYYY-MM"

    const filtered = records.filter((r) => r.date.startsWith(monthKey));
    const [year, month] = monthKey.split("-").map(Number);
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
    return {
      monthRecords: filtered,
      monthLabel: `${months[month - 1]} ${year}`,
    };
  }, [records, t]);

  if (monthRecords.length === 0) return null;

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
          {t.monthlySummary}
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

      {rows.map(({ icon, iconSrc, iconColor, label, value }) => (
        <div
          key={label}
          className="flex items-center px-4 py-1"
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
  );
}
