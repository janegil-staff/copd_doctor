"use client";

import { useState } from "react";

// src/components/dashboard/Sidebar.jsx
// All sections always visible. Empty data shows placeholder rows.

const A = "#268E86";
const BG = "rgba(255,255,255,0.92)";
const BO = "rgba(38,142,134,0.14)";
const TX = "#1a3a38";
const MU = "#7a9a98";
const WARN = "#e8a838";
const DANGER = "#e05050";
const OK = "#4aba7a";

// ── primitives ───────────────────────────────────────────────────────────────

function Row({ label, value, color, alwaysShow = false }) {
  const isEmpty = value == null || value === "" || value === "–";
  if (isEmpty && !alwaysShow) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
        borderBottom: `1px solid rgba(38,142,134,0.07)`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: MU,
          fontWeight: 500,
          flexShrink: 0,
          paddingRight: 10,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: isEmpty ? 500 : 700,
          color: isEmpty ? MU : (color ?? TX),
          textAlign: "right",
          fontStyle: isEmpty ? "italic" : "normal",
          opacity: isEmpty ? 0.7 : 1,
        }}
      >
        {isEmpty ? "–" : value}
      </span>
    </div>
  );
}

function EmptyNote({ text }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: MU,
        fontStyle: "italic",
        padding: "6px 0",
        margin: 0,
        opacity: 0.75,
        borderBottom: "1px solid rgba(38,142,134,0.07)",
      }}
    >
      {text}
    </p>
  );
}

function Divider({ label, subLabel, onReadMore, readMoreLabel, onEdit, editLabel, extra, disabled }) { /* EDIT_BUTTON_V1 */
  const headerExtras = !subLabel && (extra || (onReadMore && !disabled));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 0 4px",
      }}
    >
      {/* Row 1 — title, divider line, optional Edit (and on single-line dividers, extras) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: A,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(38,142,134,0.15)" }}
        />
        {headerExtras && extra && (
          <span style={{ flexShrink: 0, fontSize: 11 }}>{extra}</span>
        )}
        {headerExtras && onReadMore && !disabled && (
          <button
            onClick={onReadMore}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 10,
              fontWeight: 700,
              color: A,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "underline",
              letterSpacing: 0.3,
            }}
          >
            {readMoreLabel ?? "Read more"}
          </button>
        )}
        {onEdit && !disabled && (
          <button
            onClick={onEdit}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 10,
              fontWeight: 700,
              color: A,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "underline",
              letterSpacing: 0.3,
            }}
          >
            {editLabel ?? "Edit"}
          </button>
        )}
      </div>

      {/* Row 2 — date + value on the left, Read more on the far right */}
      {subLabel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 1,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: MU,
              fontStyle: "italic",
              letterSpacing: 0.2,
              flexShrink: 0,
            }}
          >
            {subLabel}
          </span>
          {extra && (
            <span style={{ flexShrink: 0, fontSize: 11 }}>{extra}</span>
          )}
          <div style={{ flex: 1 }} />
          {onReadMore && !disabled && (
            <button
              onClick={onReadMore}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10,
                fontWeight: 700,
                color: A,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                textDecoration: "underline",
                letterSpacing: 0.3,
              }}
            >
              {readMoreLabel ?? "Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct =
    max > 0 ? Math.min(100, Math.round(((value ?? 0) / max) * 100)) : 0;
  return (
    <div
      style={{
        height: 4,
        borderRadius: 3,
        background: "rgba(38,142,134,0.1)",
        flex: 1,
        minWidth: 40,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 3,
          background: color ?? A,
        }}
      />
    </div>
  );
}

// ── eosinophil severity ──────────────────────────────────────────────────────

function eosColor(v) {
  if (v == null) return MU;
  if (v >= 0.5) return DANGER;
  if (v >= 0.3) return "#e07a30";
  if (v >= 0.1) return WARN;
  return OK;
}

// ── weight-loss severity (1=No good, 2=Unsure, 3=Yes, 4=Yes worse, 5=Yes unsure) ─

function weightLossColor(v) {
  if (v == null) return MU;
  if (v === 1) return OK;
  if (v === 2) return WARN;
  if (v === 3) return "#e07a30";
  if (v === 4) return DANGER;
  if (v === 5) return WARN;
  return MU;
}

function weightLossLabel(v, t) {
  if (v == null) return "–";
  const map = {
    1: t.sWeightLossNo ?? "Nei",
    2: t.sWeightLossUnsure ?? "Usikker",
    3: t.sWeightLossYes ?? "Ja",
    4: t.sWeightLossYes ?? "Ja",
    5: t.sWeightLossYes ?? "Ja",
    6: t.sWeightLossYesUnsure ?? "Ja, men usikker",
  };
  return map[v] ?? String(v);
}
// ── Spirometry modal ─────────────────────────────────────────────────────────

function SpirometryModal({ entries, t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: TX,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.025em",
            }}
          >
            {t.sSpirometry ?? "Spirometry"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: MU,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {[...entries].reverse().map((entry, i) => (
          <div
            key={i}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(38,142,134,0.14)",
              padding: "10px 14px",
              marginBottom: 10,
              background: i === 0 ? "rgba(38,142,134,0.04)" : "#fff",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                fontWeight: 700,
                color: A,
              }}
            >
              {entry.date ?? "–"}
              {i === 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    background: A,
                    color: "#fff",
                    borderRadius: 20,
                    padding: "1px 8px",
                  }}
                >
                  Latest
                </span>
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {entry.fev1 != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>
                    {t.sFev1 ?? "FEV1"}:{" "}
                  </span>
                  <strong>{entry.fev1} L</strong>
                </span>
              )}
              {entry.fvc != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>
                    {t.sFvc ?? "FVC"}:{" "}
                  </span>
                  <strong>{entry.fvc} L</strong>
                </span>
              )}
              {entry.fev1fvc != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>
                    {t.sFev1Fvc ?? "FEV1/FVC"}:{" "}
                  </span>
                  <strong>{entry.fev1fvc}%</strong>
                </span>
              )}
              {entry.goldGrade != null && (
                <span style={{ fontSize: 11, color: TX }}>
                  <span style={{ color: MU, fontWeight: 500 }}>
                    {t.sGoldGrade ?? "GOLD grade"}:{" "}
                  </span>
                  <strong>
                    {t.sGrade ?? "Grade"} {entry.goldGrade}
                  </strong>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SPO₂ modal ───────────────────────────────────────────────────────────────

function Spo2Modal({ entries, t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: TX,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.025em",
            }}
          >
            {t.sSpo2 ?? "SPO₂"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: MU,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {[...entries].reverse().map((entry, i) => {
          const satColor =
            entry.value < 90 ? DANGER : entry.value < 94 ? WARN : OK;
          return (
            <div
              key={i}
              style={{
                borderRadius: 10,
                border: "1px solid rgba(38,142,134,0.14)",
                padding: "10px 14px",
                marginBottom: 10,
                background: i === 0 ? "rgba(38,142,134,0.04)" : "#fff",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: A,
                }}
              >
                {entry.date ?? "–"}
                {i === 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      background: A,
                      color: "#fff",
                      borderRadius: 20,
                      padding: "1px 8px",
                    }}
                  >
                    Latest
                  </span>
                )}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 16px",
                  alignItems: "center",
                }}
              >
                {entry.value != null && (
                  <span style={{ fontSize: 11, color: TX }}>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sSaturation ?? "Saturation"}:{" "}
                    </span>
                    <strong style={{ color: satColor }}>{entry.value}%</strong>
                  </span>
                )}
                {entry.pulseRate != null && (
                  <span style={{ fontSize: 11, color: TX }}>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sPulseRate ?? "Pulse rate"}:{" "}
                    </span>
                    <strong>{entry.pulseRate} bpm</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Eosinophil modal ─────────────────────────────────────────────────────────

function EosinophilModal({ entries, t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: TX,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.025em",
            }}
          >
            {t.sEosinophil ?? "Eosinophils"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: MU,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {[...entries].reverse().map((entry, i) => {
          const c = eosColor(entry.value);
          return (
            <div
              key={i}
              style={{
                borderRadius: 10,
                border: "1px solid rgba(38,142,134,0.14)",
                padding: "10px 14px",
                marginBottom: 10,
                background: i === 0 ? "rgba(38,142,134,0.04)" : "#fff",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: A,
                }}
              >
                {entry.date ?? "–"}
                {i === 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      background: A,
                      color: "#fff",
                      borderRadius: 20,
                      padding: "1px 8px",
                    }}
                  >
                    Latest
                  </span>
                )}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 16px",
                  alignItems: "center",
                }}
              >
                {entry.value != null && (
                  <span style={{ fontSize: 11, color: TX }}>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sEosinophilCount ?? "Count"}:{" "}
                    </span>
                    <strong style={{ color: c }}>
                      {Number(entry.value).toFixed(1)} ×10⁹/L
                    </strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weight modal ─────────────────────────────────────────────────────────────

function WeightModal({ records, t, onClose }) {
  const weightEntries = [...(records ?? [])]
    .filter((r) => r.weight != null)
    .reverse();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: TX,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.025em",
            }}
          >
            {t.sWeight ?? t.weight ?? "Weight"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: MU,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {weightEntries.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: MU,
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            {t.noData ?? "No data recorded."}
          </p>
        ) : (
          <WeightChart entries={weightEntries} t={t} />
        )}
      </div>
    </div>
  );
}

// ── Weight chart (inline SVG line chart) ─────────────────────────────────────

function WeightChart({ entries, t }) {
  const points = [...entries].reverse();
  if (points.length === 0) return null;

  const weights = points.map((p) => p.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const rangeW = maxW - minW || 1;
  const padW = rangeW * 0.15 || 1;
  const yMin = minW - padW;
  const yMax = maxW + padW;

  const first = points[0].weight;
  const last = points[points.length - 1].weight;
  const trendColor = last < first ? OK : last > first ? DANGER : MU;

  const W = 420;
  const H = 160;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xFor = (i) =>
    points.length === 1
      ? padL + chartW / 2
      : padL + (i / (points.length - 1)) * chartW;
  const yFor = (w) => padT + chartH - ((w - yMin) / (yMax - yMin)) * chartH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.weight)}`)
    .join(" ");

  const areaD = `${pathD} L ${xFor(points.length - 1)} ${padT + chartH} L ${xFor(0)} ${padT + chartH} Z`;

  const yTicks = [yMax, (yMin + yMax) / 2, yMin];

  const fmt = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };
  const xLabelIdx =
    points.length <= 3
      ? points.map((_, i) => i)
      : [0, Math.floor(points.length / 2), points.length - 1];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: "block" }}
      >
        {yTicks.map((v, i) => (
          <line
            key={i}
            x1={padL}
            x2={W - padR}
            y1={yFor(v)}
            y2={yFor(v)}
            stroke="rgba(38,142,134,0.12)"
            strokeWidth="1"
            strokeDasharray={i === 1 ? "2 3" : "none"}
          />
        ))}

        {yTicks.map((v, i) => (
          <text
            key={i}
            x={padL - 6}
            y={yFor(v) + 3}
            textAnchor="end"
            fontSize="9"
            fill={MU}
            fontWeight="600"
          >
            {v.toFixed(1)}
          </text>
        ))}

        <path d={areaD} fill={trendColor} fillOpacity="0.10" />

        <path
          d={pathD}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xFor(i)}
              cy={yFor(p.weight)}
              r="3.5"
              fill="#fff"
              stroke={trendColor}
              strokeWidth="2"
            />
            <circle
              cx={xFor(i)}
              cy={yFor(p.weight)}
              r="10"
              fill="transparent"
              style={{ cursor: "pointer" }}
            >
              <title>
                {p.date}: {p.weight} kg
              </title>
            </circle>
          </g>
        ))}

        {xLabelIdx.map((i) => (
          <text
            key={i}
            x={xFor(i)}
            y={H - 8}
            textAnchor={
              i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
            }
            fontSize="9"
            fill={MU}
            fontWeight="600"
          >
            {fmt(points[i].date)}
          </text>
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
          fontSize: 10,
          color: MU,
        }}
      >
        <span>
          {points.length} {t.registrations ?? "entries"}
        </span>
        <span style={{ color: trendColor, fontWeight: 700 }}>
          {first.toFixed(1)} → {last.toFixed(1)} kg
          {last !== first && (
            <>
              {" "}
              ({last < first ? "-" : "+"}
              {Math.abs(last - first).toFixed(1)})
            </>
          )}
        </span>
      </div>
    </div>
  );
}

// ── Score modal ───────────────────────────────────────────────────────────────

const SCORE_LABELS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

function ScoreModal({
  title,
  date,
  questions,
  data,
  score,
  max,
  sev,
  onClose,
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: TX,
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "0.025em",
              }}
            >
              {title}
            </h3>
            {date && (
              <p style={{ margin: "2px 0 0", fontSize: 11, color: MU }}>
                {date}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: MU,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: `${sev.color}18`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <Bar value={score} max={max} color={sev.color} />
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: sev.color,
              flexShrink: 0,
            }}
          >
            {score} / {max}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              background: sev.color,
              borderRadius: 20,
              padding: "2px 10px",
              flexShrink: 0,
            }}
          >
            {sev.label}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {questions.map(({ key, label }) => {
            const val = data[key] ?? 0;
            const scoreColor =
              val === 0
                ? OK
                : val === 1
                  ? WARN
                  : val === 2
                    ? "#e07a30"
                    : DANGER;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(38,142,134,0.07)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: TX,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: MU }}>
                    {SCORE_LABELS[val] ?? "–"}
                  </p>
                </div>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: scoreColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── question definitions ──────────────────────────────────────────────────────

const GAD7_QUESTIONS = [
  { key: "feelingNervous", label: "Feeling nervous, anxious or on edge" },
  {
    key: "noWorryingControl",
    label: "Not being able to stop or control worrying",
  },
  { key: "worrying", label: "Worrying too much about different things" },
  { key: "troubleRelaxing", label: "Trouble relaxing" },
  { key: "restless", label: "Being so restless that it is hard to sit still" },
  { key: "easilyAnnoyed", label: "Becoming easily annoyed or irritable" },
  { key: "afraid", label: "Feeling afraid as if something awful might happen" },
];

const PHQ9_QUESTIONS = [
  {
    key: "noPleasureDoingThings",
    label: "Little interest or pleasure in doing things",
  },
  { key: "depressed", label: "Feeling down, depressed, or hopeless" },
  {
    key: "stayingAsleep",
    label: "Trouble falling or staying asleep, or sleeping too much",
  },
  { key: "noEnergy", label: "Feeling tired or having little energy" },
  { key: "noAppetite", label: "Poor appetite or overeating" },
  {
    key: "selfPity",
    label: "Feeling bad about yourself — or that you are a failure",
  },
  { key: "troubleConcentration", label: "Trouble concentrating on things" },
  {
    key: "slowMovingSpeeking",
    label: "Moving or speaking so slowly that other people could have noticed",
  },
  {
    key: "suicidal",
    label: "Thoughts that you would be better off dead or of hurting yourself",
  },
];

// ── score helpers ─────────────────────────────────────────────────────────────

const GAD7_KEYS = GAD7_QUESTIONS.map((q) => q.key);
const PHQ9_KEYS = PHQ9_QUESTIONS.map((q) => q.key);

function sumKeys(obj, keys) {
  if (!obj) return null;
  return keys.reduce((s, k) => s + (obj[k] ?? 0), 0);
}

function gad7Sev(s, t) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4) return { label: t.sSevMinimal ?? "Minimal", color: OK };
  if (s <= 9) return { label: t.sSevMild ?? "Mild", color: WARN };
  if (s <= 14) return { label: t.sSevModerate ?? "Moderate", color: "#e07a30" };
  return { label: t.sSevSevere ?? "Severe", color: DANGER };
}

function phq9Sev(s, t) {
  if (s == null) return { label: "–", color: MU };
  if (s <= 4) return { label: t.sSevNone ?? "None", color: OK };
  if (s <= 9) return { label: t.sSevMild ?? "Mild", color: WARN };
  if (s <= 14) return { label: t.sSevModerate ?? "Moderate", color: "#e07a30" };
  if (s <= 19) return { label: t.sSevModSevere ?? "Mod-severe", color: DANGER };
  return { label: t.sSevSevere ?? "Severe", color: DANGER };
}

// ── Edit placeholder modal ───────────────────────────────────────────────────

function EditPlaceholderModal({ t, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: TX,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.025em",
            marginBottom: 12,
          }}
        >
          {t.sEdit ?? "Edit"}
        </h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: MU }}>
          {t.sEditNotImplemented ?? "Edit not yet implemented"}
        </p>
        <button
          onClick={onClose}
          style={{
            background: A,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 22px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 0.3,
          }}
        >
          {t.sOk ?? "OK"}
        </button>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Sidebar({ patient, t = {} }) {
  if (!patient) return null;

  const [showSpirometryModal, setShowSpirometryModal] = useState(false);
  const [showSpo2Modal, setShowSpo2Modal] = useState(false);
  const [showEosinophilModal, setShowEosinophilModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showGad7Modal, setShowGad7Modal] = useState(false);
  const [showPhq9Modal, setShowPhq9Modal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showEditPlaceholder, setShowEditPlaceholder] = useState(false);

  const copdDiagnosed = patient.copdDiagnosed ?? false;
  const copdDiagnosedDate = patient.copdDiagnosedDate ?? null;
  const asthma = patient.asthma ?? false;
  const asthmaDate = patient.asthmaDate ?? null;
  const spirometry = Array.isArray(patient.spirometry)
    ? patient.spirometry
    : [];
  const spo2arr = Array.isArray(patient.spo2) ? patient.spo2 : [];
  const eosArr = Array.isArray(patient.eosinophil) ? patient.eosinophil : [];
  const vaccinations = Array.isArray(patient.vaccinations)
    ? patient.vaccinations
    : [];
  const smoking = patient.smoking ?? null;
  const vaping = patient.vaping ?? null;
  const latestGad7 = patient.latestGad7 ?? null;
  const latestPhq9 = patient.latestPhq9 ?? null;
  const records = Array.isArray(patient.records) ? patient.records : [];
  const latestAlpha1 = patient.latestAlpha1 ?? null;
  const latestNutrition = patient.latestNutrition ?? null;
  const cond = patient.latestRelevantConditions ?? null;

  const latestVax = vaccinations.length
    ? vaccinations[vaccinations.length - 1]
    : null;
  const latestSpiro = spirometry.length
    ? spirometry[spirometry.length - 1]
    : null;
  const latestSpo2v = spo2arr.length ? spo2arr[spo2arr.length - 1] : null;
  const latestEos = eosArr.length ? eosArr[eosArr.length - 1] : null;

  const gad7Score = sumKeys(latestGad7, GAD7_KEYS);
  const phq9Score = sumKeys(latestPhq9, PHQ9_KEYS);
  const gSev = gad7Sev(gad7Score, t);
  const pSev = phq9Sev(phq9Score, t);
  const fmt1 = (n) => (n == null ? "–" : Number(n).toFixed(1));

  const SMOKE_LABEL = {
    1: t.sCurrentSmoker ?? "Current smoker",
    2: t.sNever ?? "Never smoked",
    3: t.sExSmoker ?? "Ex-smoker",
  };
  const SMOKE_COLOR = {
    1: DANGER,
    2: OK,
    3: WARN,
  };

  const VAPE_LABEL = {
    1: t.sCurrentVaper ?? "Current vaper",
    2: t.sNeverVaped ?? "Never",
    3: t.sExVaper ?? "Ex-vaper",
  };
  const VAPE_COLOR = {
    1: DANGER,
    2: OK,
    3: WARN,
  };

  const VAX_FIELDS = [
    { key: "flue", label: t.sInfluenza ?? "Influenza" },
    { key: "covid", label: t.sCovid ?? "COVID-19" },
    { key: "pneumococ", label: t.sPneumococcal ?? "Pneumococcal" },
    { key: "herpes", label: t.sHerpes ?? "Herpes zoster" },
    { key: "rs", label: t.sRsv ?? "RSV" },
    { key: "pertussis", label: t.sPertussis ?? "Pertussis" },
  ];

  const COND_FIELDS = [
    { key: "heartFailure", label: t.sHeartFailure ?? "Heart failure" },
    { key: "highBloodPressure", label: t.sHighBloodPressure ?? "Hypertension" },
    { key: "kidneyFailure", label: t.sKidneyFailure ?? "Kidney failure" },
    { key: "cardiacArrhythmia", label: t.sCardiacArrhythmia ?? "Arrhythmia" },
    { key: "diabetes", label: t.sDiabetes ?? "Diabetes" },
    { key: "osteoporosis", label: t.sOsteoporosis ?? "Osteoporosis" },
    {
      key: "anxietyDepression",
      label: t.sAnxietyDepression ?? "Anxiety / Depression",
    },
    { key: "acidRefluxGerd", label: t.sAcidReflux ?? "Acid reflux (GERD)" },
    { key: "sleepApnea", label: t.sSleepApnea ?? "Sleep apnea" },
  ];

  const readMoreLabel = t.sReadMore ?? "Read more";
  const noDataText = t.noData ?? "No data registered.";

  // Weight derivation (works even when empty)
  const weightRecords = records.filter((r) => r.weight != null);
  const latestWeight = weightRecords.length
    ? weightRecords[weightRecords.length - 1]
    : null;
  const prevWeight =
    weightRecords.length > 1
      ? weightRecords[weightRecords.length - 2]
      : null;
  const weightDiff =
    latestWeight && prevWeight ? latestWeight.weight - prevWeight.weight : null;
  const weightDiffStr =
    weightDiff == null
      ? ""
      : weightDiff < 0
        ? ` (${weightDiff.toFixed(1)} kg)`
        : weightDiff > 0
          ? ` (+${weightDiff.toFixed(1)} kg)`
          : "";
  const weightColor =
    weightDiff == null
      ? undefined
      : weightDiff < 0
        ? OK
        : weightDiff > 0
          ? DANGER
          : undefined;

  return (
    <>
      {showEditPlaceholder && (
        <EditPlaceholderModal
          t={t}
          onClose={() => setShowEditPlaceholder(false)}
        />
      )}
      {showWeightModal && (
        <WeightModal
          records={records}
          t={t}
          onClose={() => setShowWeightModal(false)}
        />
      )}
      {showSpo2Modal && spo2arr.length > 0 && (
        <Spo2Modal
          entries={spo2arr}
          t={t}
          onClose={() => setShowSpo2Modal(false)}
        />
      )}
      {showEosinophilModal && eosArr.length > 0 && (
        <EosinophilModal
          entries={eosArr}
          t={t}
          onClose={() => setShowEosinophilModal(false)}
        />
      )}
      {showSpirometryModal && spirometry.length > 0 && (
        <SpirometryModal
          entries={spirometry}
          t={t}
          onClose={() => setShowSpirometryModal(false)}
        />
      )}
      {showGad7Modal && latestGad7 && (
        <ScoreModal
          title={t.sGad7 ?? "GAD-7 · Anxiety"}
          date={latestGad7.date}
          questions={GAD7_QUESTIONS}
          data={latestGad7}
          score={gad7Score}
          max={21}
          sev={gSev}
          onClose={() => setShowGad7Modal(false)}
        />
      )}
      {showPhq9Modal && latestPhq9 && (
        <ScoreModal
          title={t.sPhq9 ?? "PHQ-9 · Depression"}
          date={latestPhq9.date}
          questions={PHQ9_QUESTIONS}
          data={latestPhq9}
          score={phq9Score}
          max={27}
          sev={pSev}
          onClose={() => setShowPhq9Modal(false)}
        />
      )}
      <aside
        style={{
          width: "100%",
          maxWidth: "100%",
          flexShrink: 0,
          paddingBottom: 0,
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
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Header ── */}
          <div style={{ padding: "16px 16px 0" }}>
            <h1
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 16px 0",
                color: A,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {t.patientInformation ?? "Patient Information"}
            </h1>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ padding: "0 14px 12px", overflowY: "auto", flex: 1 }}>
            {/* ── Diagnosis (always visible) ─────────────────────────────── */}
            <Divider label={t.sDiagnosis ?? "Diagnosis"} />
            <Row
              label={t.sCopd ?? "COPD"}
              value={
                copdDiagnosed
                  ? `${t.sConfirmed ?? "Confirmed"}${copdDiagnosedDate ? ` · ${copdDiagnosedDate}` : ""}`
                  : (t.sNotConfirmed ?? "Not confirmed")
              }
              color={copdDiagnosed ? OK : DANGER}
              alwaysShow
            />

            {/* ── Spirometry (always visible) ─────────────────────────────── */}
            <Divider
              label={t.sSpirometry ?? "Spirometry"}
              onEdit={() => setShowEditPlaceholder(true)}
              editLabel={t.sEdit ?? "Edit"}
            />{/* SPIROMETRY_EDIT_V1 */}
            {latestSpiro ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(38,142,134,0.07)",
                  fontSize: 11,
                  flexWrap: "wrap",
                }}
              >
                {latestSpiro.date && (
                  <span /* SPIROMETRY_DATE_STYLE_V1 */
                    style={{
                      fontSize: 10,
                      color: MU,
                      fontStyle: "italic",
                      letterSpacing: 0.2,
                      flexShrink: 0,
                    }}
                  >
                    {latestSpiro.date}
                  </span>
                )}
                {latestSpiro.fev1 != null && (
                  <>
                    <span style={{ color: MU, opacity: 0.5 }}>·</span>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sFev1 ?? "FEV1"}
                    </span>
                    <strong
                      style={{
                        color:
                          latestSpiro.fev1 < 1.5
                            ? DANGER
                            : latestSpiro.fev1 < 2.5
                              ? WARN
                              : OK,
                      }}
                    >
                      {fmt1(latestSpiro.fev1)} L
                    </strong>
                  </>
                )}
                {latestSpiro.fvc != null && (
                  <>
                    <span style={{ color: MU, opacity: 0.5 }}>·</span>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sFvc ?? "FVC"}
                    </span>
                    <strong style={{ color: TX }}>
                      {fmt1(latestSpiro.fvc)} L
                    </strong>
                  </>
                )}
                {(() => {
                  const ratio =
                    latestSpiro.fev1fvc != null
                      ? latestSpiro.fev1fvc
                      : latestSpiro.fev1 != null &&
                          latestSpiro.fvc != null &&
                          latestSpiro.fvc > 0
                        ? (latestSpiro.fev1 / latestSpiro.fvc) * 100
                        : null;
                  if (ratio == null) return null;
                  return (
                    <>
                      <span style={{ color: MU, opacity: 0.5 }}>·</span>
                      <span style={{ color: MU, fontWeight: 500 }}>
                        {t.sFev1Fvc ?? "FEV1/FVC"}
                      </span>
                      <strong style={{ color: ratio < 70 ? DANGER : OK }}>
                        {ratio.toFixed(1)}%
                      </strong>
                    </>
                  );
                })()}
                {latestSpiro.goldGrade != null && (
                  <>
                    <span style={{ color: MU, opacity: 0.5 }}>·</span>
                    <span style={{ color: MU, fontWeight: 500 }}>
                      {t.sGoldGrade ?? "GOLD"}
                    </span>
                    <strong
                      style={{
                        color:
                          [OK, WARN, "#e07a30", DANGER, DANGER][
                            latestSpiro.goldGrade
                          ] ?? TX,
                      }}
                    >
                      {latestSpiro.goldGrade}
                    </strong>
                  </>
                )}
              <div style={{ flex: 1, minWidth: 8 }} />
              {latestSpiro && (
                <button
                  onClick={() => setShowSpirometryModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: A,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    textDecoration: "underline",
                    letterSpacing: 0.3,
                  }}
                >
                  {readMoreLabel}
                </button>
              )}
              </div>
            ) : (
              <EmptyNote text={noDataText} />
            )}

            {/* ── SPO2 (always visible) ─────────────────────────────────── */}
            <Divider
              label={t.sSpo2 ?? "SPO₂"}
              subLabel={latestSpo2v?.date ?? undefined}
              onEdit={() => setShowEditPlaceholder(true)}
              editLabel={t.sEdit ?? "Edit"}
              onReadMore={latestSpo2v ? () => setShowSpo2Modal(true) : undefined}
              readMoreLabel={readMoreLabel}
              extra={
                latestSpo2v?.value != null ? (
                  <strong
                    style={{
                      fontWeight: 700,
                      color:
                        latestSpo2v.value < 90
                          ? DANGER
                          : latestSpo2v.value < 94
                            ? WARN
                            : OK,
                    }}
                  >
                    {fmt1(latestSpo2v.value)}%
                  </strong>
                ) : null
              }
            />
            {!latestSpo2v && <EmptyNote text={noDataText} />}

            {/* ── Eosinophil (always visible) ───────────────────────────── */}
            <Divider
              label={t.sEosinophil ?? "Eosinophils"}
              subLabel={latestEos?.date ?? undefined}
              onEdit={() => setShowEditPlaceholder(true)}
              editLabel={t.sEdit ?? "Edit"}
              onReadMore={latestEos ? () => setShowEosinophilModal(true) : undefined}
              readMoreLabel={readMoreLabel}
              extra={
                latestEos?.value != null ? (
                  <strong
                    style={{
                      fontWeight: 700,
                      color: eosColor(latestEos.value),
                    }}
                  >
                    {fmt1(latestEos.value)} ×10⁹/L
                  </strong>
                ) : null
              }
            />
            {!latestEos && <EmptyNote text={noDataText} />}

            {/* ── Smoking (always visible) ───────────────────────────────── */}
            <Divider label={t.sSmoking ?? "Smoking"} />
            {smoking ? (
              <>
                <Row
                  label={t.sStatus ?? "Status"}
                  value={SMOKE_LABEL[smoking.smoking] ?? "–"}
                  color={SMOKE_COLOR[smoking.smoking] ?? MU}
                  alwaysShow
                />
                {smoking.smoking > 0 && smoking.startAge > 0 && (
                  <Row
                    label={t.sSmokingStart ?? "Start"}
                    value={`${t.sAge ?? "Age"} ${smoking.startAge}`}
                  />
                )}
                {smoking.smoking === 3 && smoking.endAge > 0 && (
                  <Row
                    label={t.sSmokingStop ?? "Stopped"}
                    value={`${t.sAge ?? "Age"} ${smoking.endAge}`}
                    color={OK}
                  />
                )}
                {(smoking.smoking === 1 || smoking.smoking === 3) && smoking.frequency > 0 && (
                  <Row
                    label={t.sSmokingAverage ?? "Average"}
                    value={`${smoking.frequency} ${t.sCigarettesPerDay ?? "cig/day"}`}
                    color={smoking.smoking === 1 ? DANGER : MU}
                  />
                )}
                {(smoking.smoking === 1 || smoking.smoking === 3) && (() => {
                  /* PATCH:smoking-section v2 */
                  // Pack-years: (cig/day ÷ 20) × years smoked.
                  // Current (1): years = patient.age - startAge.
                  // Ex (3):      years = endAge - startAge.
                  const cpd = Number(smoking.frequency) || 0;
                  const start = Number(smoking.startAge) || 0;
                  const end = Number(smoking.endAge) || 0;
                  const currentAge = Number(patient.age) || 0;
                  let years = 0;
                  if (smoking.smoking === 3 && end > start) years = end - start;
                  else if (smoking.smoking === 1 && currentAge > start) years = currentAge - start;
                  const packYears = (cpd / 20) * years;
                  const py = Number.isFinite(packYears)
                    ? Math.round(packYears * 10) / 10
                    : 0;
                  const pyColor =
                    py < 10 ? OK : py < 20 ? WARN : py < 40 ? "#e07a30" : DANGER;
                  return (
                    <Row
                      label={t.sPackYears ?? "Pack-years"}
                      value={`${py}`}
                      color={pyColor}
                      alwaysShow
                    />
                  );
                })()}
              </>
            ) : (
              <EmptyNote text={noDataText} />
            )}

            {/* ── Show more toggle ───────────────────────────────────────── */}
            <button
              onClick={() => setShowMore((v) => !v)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "8px 12px",
                background: showMore ? "rgba(38,142,134,0.08)" : "transparent",
                border: `1px solid ${BO}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color: A,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "background 0.15s ease",
              }}
            >
              {showMore
                ? (t.sShowLess ?? "Show less")
                : (t.sShowMore ?? "Show more")}
              <span
                style={{
                  display: "inline-block",
                  transform: showMore ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  fontSize: 10,
                }}
              >
                ▼
              </span>
            </button>

            {showMore && (
              <>
                {/* ── Vaping (always visible) ───────────────────────────── */}
                <Divider label={t.sVaping ?? "Vaping"} />
                {vaping ? (
                  <Row
                    label={t.sStatus ?? "Status"}
                    value={VAPE_LABEL[vaping.vaping] ?? "–"}
                    color={VAPE_COLOR[vaping.vaping] ?? MU}
                    alwaysShow
                  />
                ) : (
                  <EmptyNote text={noDataText} />
                )}

                {/* ── Vaccinations (always visible) ─────────────────────── */}
                <Divider label={t.sVaccinations ?? "Vaccinations"} />
                {latestVax ? (
                  VAX_FIELDS.map(({ key, label }) => (
                    <Row
                      key={key}
                      label={label}
                      value={latestVax[key] ? "✓" : (t.sNo ?? "No")}
                      color={latestVax[key] ? OK : MU}
                      alwaysShow
                    />
                  ))
                ) : (
                  VAX_FIELDS.map(({ key, label }) => (
                    <Row
                      key={key}
                      label={label}
                      value={null}
                      alwaysShow
                    />
                  ))
                )}

                {/* ── GAD-7 (always visible) ───────────────────────────── */}
                <Divider
                  label={t.sGad7 ?? "GAD-7 · Anxiety"}
                  onReadMore={latestGad7 ? () => setShowGad7Modal(true) : undefined}
                  readMoreLabel={readMoreLabel}
                />
                {latestGad7 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 0",
                      borderBottom: "1px solid rgba(38,142,134,0.07)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: MU,
                        fontWeight: 500,
                        flexShrink: 0,
                        paddingRight: 10,
                      }}
                    >
                      {t.sScore ?? "Score"}
                    </span>
                    <Bar value={gad7Score} max={21} color={gSev.color} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: gSev.color,
                        flexShrink: 0,
                      }}
                    >
                      {gad7Score}{" "}
                      <span style={{ fontSize: 10, fontWeight: 500 }}>
                        ({gSev.label})
                      </span>
                    </span>
                  </div>
                ) : (
                  <EmptyNote text={noDataText} />
                )}

                {/* ── PHQ-9 (always visible) ───────────────────────────── */}
                <Divider
                  label={t.sPhq9 ?? "PHQ-9 · Depression"}
                  onReadMore={latestPhq9 ? () => setShowPhq9Modal(true) : undefined}
                  readMoreLabel={readMoreLabel}
                />
                {latestPhq9 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 0",
                      borderBottom: "1px solid rgba(38,142,134,0.07)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: MU,
                        fontWeight: 500,
                        flexShrink: 0,
                        paddingRight: 10,
                      }}
                    >
                      {t.sScore ?? "Score"}
                    </span>
                    <Bar value={phq9Score} max={27} color={pSev.color} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: pSev.color,
                        flexShrink: 0,
                      }}
                    >
                      {phq9Score}{" "}
                      <span style={{ fontSize: 10, fontWeight: 500 }}>
                        ({pSev.label})
                      </span>
                    </span>
                  </div>
                ) : (
                  <EmptyNote text={noDataText} />
                )}

                {/* ── Weight loss (single-line divider) ────────────────── */}
                <Divider
                  label={
                    latestNutrition?.date
                      ? `${t.sWeightLoss ?? "Vektnedgang"} · ${latestNutrition.date}`
                      : (t.sWeightLoss ?? "Vektnedgang")
                  }
                  extra={
                    latestNutrition?.value != null ? (
                      <strong
                        style={{
                          fontWeight: 700,
                          color: weightLossColor(latestNutrition.value),
                        }}
                      >
                        {weightLossLabel(latestNutrition.value, t)}
                      </strong>
                    ) : null
                  }
                />
                {latestNutrition?.value == null && (
                  <EmptyNote text={noDataText} />
                )}

                {/* ── Weight (always visible) ──────────────────────────── */}
                <Divider
                  label={t.sWeight ?? t.weight ?? "Weight"}
                  onReadMore={
                    weightRecords.length ? () => setShowWeightModal(true) : undefined
                  }
                  readMoreLabel={readMoreLabel}
                />
                {latestWeight ? (
                  <Row
                    label={t.weight ?? "Weight"}
                    value={`${latestWeight.weight} kg${weightDiffStr}`}
                    color={weightColor}
                    alwaysShow
                  />
                ) : (
                  <EmptyNote text={noDataText} />
                )}

                {/* ── Alpha-1 (always visible) ─────────────────────────── */}
                <Divider label={t.sAlpha1 ?? "Alpha-1 Antitrypsin"} />
                {latestAlpha1 ? (
                  <Row
                    label={t.sAlpha1 ?? "Alpha-1 Antitrypsin"}
                    value={(() => {
                      if (!latestAlpha1.alpha1Tested)
                        return t.sNotTested ?? "Not tested";
                      if (latestAlpha1.alpha1Result == null)
                        return t.sTested ?? "Tested";
                      return latestAlpha1.alpha1Result === 0
                        ? (t.sNegative ?? "Negative")
                        : (t.sPositive ?? "Positive");
                    })()}
                    color={(() => {
                      if (!latestAlpha1.alpha1Tested) return WARN;
                      if (latestAlpha1.alpha1Result == null) return MU;
                      return latestAlpha1.alpha1Result === 0 ? OK : DANGER;
                    })()}
                    alwaysShow
                  />
                ) : (
                  <Row
                    label={t.sAlpha1 ?? "Alpha-1 Antitrypsin"}
                    value={t.sNotTested ?? "Not tested"}
                    color={WARN}
                    alwaysShow
                  />
                )}

                {/* ── Comorbidities (always visible, all listed) ───────── */}
                <Divider label={t.sComorbidities ?? "Comorbidities"} />
                {/* ASTHMA_MOVED_TO_COMORBID */}
                <Row
                  label={t.sAsthma ?? "Asthma"}
                  value={
                    asthma
                      ? `${t.sYes ?? "Yes"}${asthmaDate ? ` · ${asthmaDate}` : ""}`
                      : (t.sNo ?? "No")
                  }
                  color={asthma ? DANGER : OK}
                  alwaysShow
                />
                {COND_FIELDS.map((c) => {
                  const has = !!cond?.[c.key];
                  return (
                    <Row
                      key={c.key}
                      label={c.label}
                      value={has ? (t.sYes ?? "Yes") : (t.sNo ?? "No")}
                      color={has ? DANGER : OK}
                      alwaysShow
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}