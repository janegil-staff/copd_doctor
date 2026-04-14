"use client";

// src/components/dashboard/DashboardClient.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel from "@/components/dashboard/CalendarPanel";
import DayDetailDrawer from "@/components/dashboard/DayDetailDrawer";
import Sidebar from "@/components/dashboard/Sidebar";

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

const translations = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };

function parsePatientData() {
  if (typeof window === "undefined") return { patient: null, selectedRecord: null };
  try {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) return { patient: null, selectedRecord: null };
    const data = JSON.parse(raw);
    const records = Array.isArray(data.records) ? data.records : [];
    const selectedRecord = records.length ? records[records.length - 1] : null;
    return { patient: data, selectedRecord };
  } catch {
    return { patient: null, selectedRecord: null };
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [patient, setPatient]               = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [mounted, setMounted]               = useState(false);

  const [show, setShow] = useState({
    catScore: true, exacerbation: true, medicine: true,
    note: true, activity: true, weight: true,
  });
  const toggleShow = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const { patient: p, selectedRecord: r } = parsePatientData();
    setPatient(p);
    setSelectedRecord(r);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !patient) router.replace("/");
  }, [mounted, patient, router]);

  const handleDayClick = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  // Don't render anything until mounted (avoids SSR mismatch)
  if (!mounted || !patient) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/background-copd.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(38,142,134,0.15)",
      }}>
        {/* Patient badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#268E86",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {patient.gender === "male" ? (t.male?.[0] ?? "M") : (t.female?.[0] ?? "F")}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a3a38" }}>
              {patient.age} · {patient.gender === "male" ? (t.male ?? "Male") : (t.female ?? "Female")}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#7a9a98" }}>
              {(patient.records ?? []).length} {t.registrations ?? "registrations"}
            </p>
          </div>
        </div>

        {/* Nav buttons — desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
          className="hidden sm:flex">
          {[
            { label: t.summaryTab ?? "Summary", path: "/summary" },
            { label: t.logTab ?? "Log",         path: "/log" },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => router.push(path)} style={{
              fontSize: 12, padding: "6px 16px", borderRadius: 20, cursor: "pointer",
              fontWeight: 600, border: "1px solid rgba(38,142,134,0.2)",
              background: "rgba(38,142,134,0.08)", color: "#268E86",
            }}>
              {label}
            </button>
          ))}
          <button onClick={() => {
            sessionStorage.removeItem("patientData");
            localStorage.removeItem("sessionStartAt");
            router.replace("/");
          }} style={{
            fontSize: 12, padding: "6px 16px", borderRadius: 20, cursor: "pointer",
            fontWeight: 600, border: "1px solid rgba(38,142,134,0.3)",
            background: "rgba(38,142,134,0.12)", color: "#268E86",
          }}>
            {t.logout ?? "Sign out"}
          </button>
        </div>

        {/* Hamburger — mobile */}
        <div style={{ position: "relative" }} className="sm:hidden">
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              background: menuOpen ? "rgba(38,142,134,0.15)" : "rgba(38,142,134,0.08)",
              border: "1px solid rgba(38,142,134,0.25)",
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 16, height: 2, borderRadius: 2,
                background: "#268E86",
                transform: menuOpen
                  ? i === 0 ? "translateY(7px) rotate(45deg)"
                  : i === 2 ? "translateY(-7px) rotate(-45deg)"
                  : "none"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
                transition: "all 0.2s",
              }} />
            ))}
          </button>

          {menuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 199 }}
                onClick={() => setMenuOpen(false)}
              />
              <div style={{
                position: "absolute", right: 0, top: 42, zIndex: 200,
                borderRadius: 16, overflow: "hidden",
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(38,142,134,0.2)",
                boxShadow: "0 8px 32px rgba(38,142,134,0.15)",
                minWidth: 160,
              }}>
                {[
                  { label: t.summaryTab ?? "Summary", path: "/summary" },
                  { label: t.logTab ?? "Log",         path: "/log" },
                  { label: t.logout ?? "Sign out",    path: null, danger: true },
                ].map(({ label, path, danger }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setMenuOpen(false);
                      if (danger) {
                        sessionStorage.removeItem("patientData");
                        localStorage.removeItem("sessionStartAt");
                        router.replace("/");
                      } else {
                        router.push(path);
                      }
                    }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "12px 20px", fontSize: 13, fontWeight: 600,
                      color: danger ? "#b91c1c" : "#268E86",
                      background: "none", border: "none", cursor: "pointer",
                      borderBottom: "1px solid rgba(38,142,134,0.08)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      {/*
        Layout:
        - mobile  (<1024px): single column, calendar first, sidebar below
        - desktop (≥1024px): two columns, calendar left, sidebar right (sticky)
      */}
      <main style={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",          // stacks on small screens
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 20,
        padding: "24px 16px 40px",
      }}>

        {/* Calendar card */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(38,142,134,0.18)",
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(38,142,134,0.10)",
          padding: "20px 16px",
          width: "100%",
          maxWidth: 480,
          flexShrink: 0,
        }}>
          <h1 style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16,
            marginTop: 0,
            color: "#268E86",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            {t.title ?? "COPD Calendar"}
          </h1>
          <CalendarPanel
            t={t}
            records={patient.records}
            medicines={patient.medicines}
            onDayClick={handleDayClick}
            selectedDate={selectedRecord?.date}
            show={show}
            onToggleShow={toggleShow}
          />
        </div>

        {/* Sidebar — full width on mobile, fixed width on desktop */}
        <div style={{
          width: "100%",
          maxWidth: 480,  // matches calendar on mobile so it doesn't look odd
          // On wider screens Sidebar's own maxWidth:260 takes over
        }}
          className="lg:max-w-[260px]"
        >
          <Sidebar patient={patient} t={t} />
        </div>

      </main>

      {/* ── Day detail drawer ──────────────────────────────────────────────── */}
      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
        medicines={patient.medicines}
        userMedicines={patient.userMedicines}
        show={show}
      />
    </div>
  );
}