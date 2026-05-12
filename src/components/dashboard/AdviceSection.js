"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdviceSection({
  advice = [],
  t,
  doctorLang,
  patientCode,
  onAdviceUpdated,
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  if (!advice || advice.length === 0) return null;

  const toggleExpanded = (i) =>
    setExpanded((p) => ({ ...p, [i]: !p[i] }));

  return (
    <section
      style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(38,142,134,0.18)",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(38,142,134,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Collapsible header / toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "14px 16px",
          background: open ? "rgba(38,142,134,0.06)" : "transparent",
          border: "none",
          borderBottom: open
            ? "1px solid rgba(38,142,134,0.12)"
            : "1px solid transparent",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
        aria-expanded={open}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#268E86",
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            flex: 1,
            minWidth: 0,
          }}
        >
          {t.relevantAdviceSubtitle ??
            "Advice the patient has marked as relevant."}
        </h2>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 22,
            height: 22,
            padding: "0 7px",
            borderRadius: 11,
            background: "#268E86",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {advice.length}
        </span>

        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: 10,
            color: "#268E86",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {advice.map((a, i) => (
              <article
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(38,142,134,0.12)",
                  background: "rgba(255,255,255,0.6)",
                }}
              >
                {a.image && (
                  <div
                    style={{
                      position: "relative",
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f0f4f3",
                    }}
                  >
                    <Image
                      src={a.image}
                      alt={a.title || "advice"}
                      fill
                      sizes="56px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {a.title && (
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1a3a38",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {a.title}
                    </h3>
                  )}
                  {a.shortDescription && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#5a7a78",
                        margin: "4px 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {a.shortDescription}
                    </p>
                  )}
                  {a.description && (
                    <>
                      {expanded[i] && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#3a5a58",
                            margin: "8px 0 0",
                            lineHeight: 1.5,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {a.description}
                        </p>
                      )}
                      <button
                        onClick={() => toggleExpanded(i)}
                        style={{
                          marginTop: 6,
                          padding: 0,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#268E86",
                        }}
                      >
                        {expanded[i]
                          ? (t.showLess ?? "Show less")
                          : (t.readMore ?? "Read more")}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}