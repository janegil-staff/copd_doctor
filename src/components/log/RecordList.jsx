import { useRef } from "react";
import { RecordRow } from "./RecordRow";
import { isoWeekYear } from "@/lib/log/logHelpers";

export function RecordList({
  t,
  visible,
  filtered,
  patient,
  expandedDate,
  onToggle,
  hasMore,
  sentinelRef,
  PAGE_SIZE,
}) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: "#a0b8b6" }}>
          {t.noEntries}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(38,142,134,0.14)",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}
      >
        {visible.map((record, idx) => {
          const year = isoWeekYear(record.date);
          const prevYear = idx > 0 ? isoWeekYear(visible[idx - 1].date) : null;
          const showYear = year !== prevYear;

          return (
            <div key={record.date}>
              {showYear && (
                <div
                  className="flex items-center gap-2 px-4"
                  style={{
                    paddingTop: idx > 0 ? 10 : 6,
                    paddingBottom: 6,
                    borderTop: idx > 0 ? "1px solid #c8c8c8" : "none",
                  }}
                >
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "#268E86" }}
                  >
                    {year}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(38,142,134,0.2)" }}
                  />
                </div>
              )}
              <RecordRow
                record={record}
                medicines={patient.medicines}
                userMedicines={patient.userMedicines}
                t={t}
                expanded={expandedDate === record.date}
                onToggle={() => onToggle(record.date)}
                isFirst={idx === 0 || showYear}
              />
            </div>
          );
        })}
      </div>

      <div ref={sentinelRef} className="py-2 text-center">
        {hasMore ? (
          <p className="text-xs" style={{ color: "#a0b8b6" }}>
            {visible.length} / {filtered.length} {t.entries}
          </p>
        ) : filtered.length > PAGE_SIZE ? (
          <p className="text-xs" style={{ color: "#c8dedd" }}>
            ✓ {filtered.length} {t.entries}
          </p>
        ) : null}
      </div>
    </>
  );
}
