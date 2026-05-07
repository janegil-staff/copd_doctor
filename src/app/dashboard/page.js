"use client";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(
  () => import("@/components/dashboard/DashboardClient"),
  { ssr: false, loading: () => null },
);

export default function DashboardPage() {
  const data = JSON.parse(sessionStorage.getItem("patientData"));
  const sorted = [...data.records].sort((a, b) => b.date.localeCompare(a.date));
  const monthKey = sorted[0].date.slice(0, 7);
  const monthRecords = data.records.filter((r) => r.date.startsWith(monthKey));
  console.table(
    monthRecords.map((r) => ({
      date: r.date,
      physicalActivity: r.physicalActivity,
      type: typeof r.physicalActivity,
      countsAsActive: r.physicalActivity > 0,
    })),
  );
  return <DashboardClient />;
}
