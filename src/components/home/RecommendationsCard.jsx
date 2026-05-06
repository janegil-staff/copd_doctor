"use client";
import { useState } from "react";

export default function RecommendationsCard({ t }) {
  const [open, setOpen] = useState(false);

  const items = [
    t.recommendations1,
    t.recommendations2,
    t.recommendations3,
    t.recommendations4,
    t.recommendations5,
    t.recommendations6,
    t.recommendations7,
    t.recommendations8,
    t.recommendations9,
    t.recommendations10,
    t.recommendations11,
    t.recommendations12,
    t.recommendations13,
    t.recommendations14,
    t.recommendations15,
    t.recommendations16,
  ];

  return (
    <div className="w-full max-w-[480px] mx-auto min-[900px]:w-[480px] min-[900px]:mx-0 flex-shrink-0">
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(38,142,134,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/[0.02] transition-colors"
        >
          <span className="font-bold tracking-widest text-sm uppercase text-gray-800">
            {t.recommendationsToggle}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="px-6 pb-6 text-sm text-gray-700 space-y-3">
            <p>{t.recommendationsIntro}</p>
            <ul className="list-disc pl-5 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
