"use client";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(
  () => import("@/components/dashboard/DashboardClient"),
  { ssr: false, loading: () => null }
);

export default function DashboardPage() {
  return <DashboardClient />;
}