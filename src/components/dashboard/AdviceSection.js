"use client";

// src/components/dashboard/AdviceSection.jsx
// Renders relevant advice from patient.advice (already localized server-side
// via the &language=<code> URL parameter on /patients/details/json).
//
// Matches the Sidebar/CalendarPanel style: inline styles, glassmorphism,
// t-prop translations, single card.

import { useMemo, useState } from "react";

const A      = "#268E86";
const BG     = "rgba(255,255,255,0.92)";
const BO     = "rgba(38,142,134,0.14)";
const TX     = "#1a3a38";
const MU     = "#7a9a98";
const WARN   = "#e8a838";
const DANGER = "#e05050";

const SEVERITY_COLOR = {
  high:   DANGER,
  medium: WARN,
  low:    A,
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      year:  "numeric",
      month: "short",
      day:   "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Single advice card ──────────────────────────────────────────────────────
function AdviceCard({ item, t }) {
  const sevColor = item.severity ? SEVERITY_COLOR[item.severity] : A;

  return (
    <article
      style={{
        background: "rgba(38,142,134,0.04)",
        border: `1px solid ${BO}`,
        borderLeft: `3px solid ${sevColor}`,
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: A,
            background: "rgba(38,142,134,0.1)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {t[`advCat_${item.category}`] ?? item.category}
        </span>
        {item.date && (
          <time
            dateTime={item.date}
            style={{ fontSize: 10, color: MU, fontWeight: 500 }}
          >
            {formatDate(item.date)}
          </time>
        )}
      </div>

      {item.title && (
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 13,
            fontWeight: 700,
            color: TX,
            lineHeight: 1.35,
          }}
        >
          {item.title}
        </h3>
      )}

      {item.text && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#3d4a5c",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {item.text}
        </p>
      )}

      {item.source && (
        <a
          href={item.source}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            fontSize: 11,
            fontWeight: 600,
            color: A,
            textDecoration: "none",
          }}
        >
          {t.adviceReadMore ?? "Read more"} →
        </a>
      )}
    </article>
  );
}

// ── Main section ────────────────────────────────────────────────────────────
export default function AdviceSection({ advice = [], t = {} }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const normalized = useMemo(
    () =>
      (Array.isArray(advice) ? advice : [])
        .map((a, i) => ({
          id:       a?.id       ?? `advice-${i}`,
          category: a?.category ?? a?.type ?? "general",
          title:    a?.title    ?? a?.heading ?? "",
          text:     a?.text     ?? a?.body ?? a?.description ?? "",
          date:     a?.date     ?? a?.createdAt ?? null,
          severity: a?.severity ?? null,
          source:   a?.source   ?? a?.link ?? null,
        }))
        .filter((a) => a.title || a.text)
        .sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.localeCompare(a.date);
        }),
    [advice]
  );

  const categories = useMemo(() => {
    const set = new Set(normalized.map((a) => a.category));
    return ["all", ...Array.from(set)];
  }, [normalized]);

  const filtered =
    activeCategory === "all"
      ? normalized
      : normalized.filter((a) => a.category === activeCategory);

  // Empty state — hide the whole section to match the rest of the dashboard's
  // "hide if empty" pattern.  If you'd rather keep an empty placeholder, swap
  // this `return null` for the commented-out empty state below.
  if (normalized.length === 0) return null;

  return (
    <aside
      style={{
        width: "100%",
        maxWidth: "100%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: BG,
          backdropFilter: "blur(14px)",
          border: `1px solid ${BO}`,
          borderRadius: 20,
          overflow: "hidden",
          padding: "16px 16px 12px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: A,
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {t.adviceTitle ?? "Relevant advice"}
          </h1>
          <span style={{ fontSize: 11, color: MU, fontWeight: 600 }}>
            {normalized.length} {t.adviceItems ?? "items"}
          </span>
        </div>

        {/* Category filter chips */}
        {categories.length > 2 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: `1px solid ${BO}`,
            }}
            role="tablist"
          >
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    background: active ? A : "rgba(38,142,134,0.08)",
                    color: active ? "#fff" : A,
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat === "all"
                    ? (t.adviceFilterAll ?? "All")
                    : (t[`advCat_${cat}`] ?? cat)}
                </button>
              );
            })}
          </div>
        )}

        {/* Advice list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((item) => (
            <AdviceCard key={item.id} item={item} t={t} />
          ))}
        </div>
      </div>
    </aside>
  );
}