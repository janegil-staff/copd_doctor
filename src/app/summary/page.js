"use client";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { getT } from "@/translations";

import { parseInitialState } from "@/lib/summary/dateHelpers";
import {
  buildWeeks,
  buildCatTrend,
  buildExWeekly,
  buildWeightData,
  buildActivityData,
  buildMedUsage,
  buildCatStats,
} from "@/lib/summary/summaryStats";

import { SummaryHeader } from "@/components/summary/SummaryHeader";
import { CatOverviewCard } from "@/components/summary/CatOverviewCard";
import { CatTrendCard } from "@/components/summary/CatTrendCard";
import { ExacerbationCard } from "@/components/summary/ExacerbationCard";
import { WeightCard } from "@/components/summary/WeightCard";
import { ActivityCard } from "@/components/summary/ActivityCard";
import { MedicineCard } from "@/components/summary/MedicineCard";
import { Card } from "@/components/ui/Card";

export default function SummaryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = getT(lang);

  const [state, setState] = useState({
    patient: null,
    viewYear: null,
    viewMonth: null,
  });
  const { patient, viewYear, viewMonth } = state;

  useEffect(() => {
    const parsed = parseInitialState();
    if (!parsed.patient) {
      router.replace("/");
      return;
    }
    startTransition(() => setState(parsed));
  }, [router]);

  if (!patient) return null;

  const allRecords = [...(patient.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const pad = (n) => String(n).padStart(2, "0");

  const vy = viewYear ?? new Date().getFullYear();
  const vm = viewMonth ?? new Date().getMonth();
  const monthKey = `${vy}-${pad(vm + 1)}`;

  const records = allRecords.filter((r) => r.date.startsWith(monthKey));

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

  const prevMonth = () =>
    setState((s) =>
      s.viewMonth === 0
        ? { ...s, viewMonth: 11, viewYear: s.viewYear - 1 }
        : { ...s, viewMonth: s.viewMonth - 1 },
    );
  const nextMonth = () =>
    setState((s) =>
      s.viewMonth === 11
        ? { ...s, viewMonth: 0, viewYear: s.viewYear + 1 }
        : { ...s, viewMonth: s.viewMonth + 1 },
    );
  const hasPrev = allRecords.some((r) => r.date < monthKey);
  const hasNext = allRecords.some((r) => r.date > monthKey + "-31");

  const weeks = buildWeeks(records, t);
  const catTrend = buildCatTrend(weeks, t);
  const exWeekly = buildExWeekly(weeks, t);
  const weightData = buildWeightData(weeks, t);
  const activityData = buildActivityData(weeks, t);
  const medList = buildMedUsage(records, patient);
  const { avgCat, minCat, maxCat, modEx, sevEx } = buildCatStats(records);

  const avgActivity = activityData.length
    ? Math.round(
        activityData.reduce((s, d) => s + d.value, 0) / activityData.length,
      )
    : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background-copd.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <SummaryHeader
        t={t}
        months={months}
        vm={vm}
        vy={vy}
        hasPrev={hasPrev}
        hasNext={hasNext}
        weeksCount={weeks.length}
        onBack={() => router.push("/dashboard")}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <CatOverviewCard
            t={t}
            avgCat={avgCat}
            minCat={minCat}
            maxCat={maxCat}
            modEx={modEx}
            sevEx={sevEx}
            weeksCount={weeks.length}
          />

          <CatTrendCard
            t={t}
            catTrend={catTrend}
            months={months}
            vm={vm}
            vy={vy}
          />

          {records.length === 0 && (
            <Card title={t.summaryTab}>
              <p
                className="text-sm text-center py-4"
                style={{ color: "#a0b8b6" }}
              >
                {t.noEntries}
              </p>
            </Card>
          )}

          <ExacerbationCard
            t={t}
            exWeekly={exWeekly}
            months={months}
            vm={vm}
            vy={vy}
          />
          <WeightCard t={t} weightData={weightData} />
          <ActivityCard
            t={t}
            activityData={activityData}
            avgActivity={avgActivity}
          />
          <MedicineCard
            t={t}
            medList={medList}
            patient={patient}
            recordsCount={records.length}
          />
        </div>
      </main>
    </div>
  );
}
