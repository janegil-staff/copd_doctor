// src/app/log/page.js
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";

import no from "@/app/messages/no.json";
import en from "@/app/messages/en.json";
import nl from "@/app/messages/nl.json";
import fr from "@/app/messages/fr.json";
import de from "@/app/messages/de.json";
import it from "@/app/messages/it.json";
import sv from "@/app/messages/sv.json";
import da from "@/app/messages/da.json";
import fi from "@/app/messages/fi.json";
import es from "@/app/messages/es.json";
import pl from "@/app/messages/pl.json";
import pt from "@/app/messages/pt.json";

import { filterRecords } from "@/lib/log/logHelpers";
import { LogHeader } from "@/components/log/LogHeader";
import { LogSearch } from "@/components/log/LogSearch";
import { RecordList } from "@/components/log/RecordList";
import PdfExportModal from "@/components/PdfExportModal";
import CopdSummaryPdfModal from "@/components/CopdSummaryPdfModal";

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };
const PAGE_SIZE = 20;

export default function LogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  // ── Fix: read sessionStorage in useEffect, not useState initializer
  // This ensures server and client render the same thing on first pass,
  // eliminating the hydration mismatch.
  const [patient, setPatient]           = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchState, setSearchState]   = useState({ query: "", visibleCount: PAGE_SIZE });
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [summaryPdfOpen, setSummaryPdfOpen] = useState(false);
  const sentinelRef = useRef(null);

  // Load patient from sessionStorage once on mount
  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    setPatient(raw ? JSON.parse(raw) : null);
    setMounted(true);
  }, []);

  const search       = searchState.query;
  const visibleCount = searchState.visibleCount;

  const setSearch = (q) =>
    setSearchState({ query: q, visibleCount: PAGE_SIZE });

  const setVisibleCount = (updater) =>
    setSearchState((prev) => ({
      ...prev,
      visibleCount:
        typeof updater === "function" ? updater(prev.visibleCount) : updater,
    }));

  // Redirect to home if no patient data after mount
  useEffect(() => {
    if (mounted && !patient) router.replace("/");
  }, [mounted, patient, router]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((prev) => prev + PAGE_SIZE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [patient]);

  // Don't render until client has mounted — prevents hydration mismatch
  if (!mounted) return null;
  if (!patient) return null;

  const records  = [...(patient.records ?? [])].reverse();
  const filtered = filterRecords(records, search, patient, t);
  const visible  = filtered.slice(0, visibleCount);
  const hasMore  = visibleCount < filtered.length;

  const handleToggle = (date) =>
    setExpandedDate((prev) => (prev === date ? null : date));

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
      <LogHeader
        t={t}
        filteredCount={filtered.length}
        onBack={() => router.push("/dashboard")}
        onPdfOpen={() => setPdfModalOpen(true)}
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

      {/* Existing week-log PDF 
      <PdfExportModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        patient={patient}
        t={t}
      />
*/}
      {/* One-page clinical summary PDF */}
      <CopdSummaryPdfModal
        open={summaryPdfOpen}
        onClose={() => setSummaryPdfOpen(false)}
        patient={patient}
        t={t}
      />
    </div>
  );
}