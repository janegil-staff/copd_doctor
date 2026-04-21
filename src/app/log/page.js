// src/app/log/page.js
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { getT } from "@/translations/translations-old";

import { filterRecords } from "@/lib/log/logHelpers";
import { LogHeader } from "@/components/log/LogHeader";
import { LogSearch } from "@/components/log/LogSearch";
import { RecordList } from "@/components/log/RecordList";
import CopdSummaryPdfModal from "@/components/CopdSummaryPdfModal";

const PAGE_SIZE = 20;

export default function LogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = getT(lang);

  const [patient] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("patientData");
    return raw ? JSON.parse(raw) : null;
  });

  const [mounted, setMounted] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchState, setSearchState] = useState({
    query: "",
    visibleCount: PAGE_SIZE,
  });
  const [summaryPdfOpen, setSummaryPdfOpen] = useState(false);
  const sentinelRef = useRef(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const search = searchState.query;
  const visibleCount = searchState.visibleCount;

  const setSearch = (q) =>
    setSearchState({ query: q, visibleCount: PAGE_SIZE });

  const setVisibleCount = (updater) =>
    setSearchState((prev) => ({
      ...prev,
      visibleCount:
        typeof updater === "function" ? updater(prev.visibleCount) : updater,
    }));

  useEffect(() => {
    if (mounted && !patient) router.replace("/");
  }, [mounted, patient, router]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisibleCount((prev) => prev + PAGE_SIZE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [patient]);

  if (!mounted) return null;
  if (!patient) return null;

  const records = [...(patient.records ?? [])].reverse();
  const filtered = filterRecords(records, search, patient, t);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleToggle = (date) =>
    setExpandedDate((prev) => (prev === date ? null : date));

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background-copd.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <LogHeader
        t={t}
        filteredCount={filtered.length}
        onBack={() => router.push("/dashboard")}
        onSummaryPdfOpen={() => setSummaryPdfOpen(true)}
      />

      <LogSearch t={t} search={search} onSearch={setSearch} />

      <main className="flex-1 px-6 py-4 max-w-3xl mx-auto w-full pb-12">
        <RecordList
          t={t}
          visible={visible}
          filtered={filtered}
          patient={patient}
          expandedDate={expandedDate}
          onToggle={handleToggle}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          PAGE_SIZE={PAGE_SIZE}
        />
      </main>

      <CopdSummaryPdfModal
        open={summaryPdfOpen}
        onClose={() => setSummaryPdfOpen(false)}
        patient={patient}
        t={t}
      />
    </div>
  );
}