"use client";
import { useState } from "react";

export default function TreatmentMedicationsCard({ t }) {
  const [open, setOpen] = useState(false);

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
            {t.treatmentMedicationsToggle}
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
            {/* Treatment section */}
            <h3 className="font-bold tracking-wide text-base uppercase text-gray-800 pt-1">
              {t.treatmentHeadline}
            </h3>
            <p>{t.treatmentIntro}</p>

            <p className="font-semibold" style={{ color: "#268E86" }}>
              {t.treatmentEvalE}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.treatmentEvalE1}</li>
              <li>{t.treatmentEvalE2}</li>
            </ul>

            <p className="font-semibold" style={{ color: "#268E86" }}>
              {t.treatmentEvalAB}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.treatmentEvalAB1}</li>
              <li>{t.treatmentEvalAB2}</li>
              <li>{t.treatmentEvalAB3}</li>
            </ul>

            {/* Divider */}
            <div
              className="h-px my-4"
              style={{ background: "rgba(38,142,134,0.15)" }}
            />

            {/* Medications section */}
            <h3 className="font-bold tracking-wide text-base uppercase text-gray-800 pt-1">
              {t.medicationsHeadline}
            </h3>
            <p>{t.medicationsIntro}</p>

            <p className="font-semibold" style={{ color: "#268E86" }}>
              {t.medicationsGroupA}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.medicationsGroupA1}</li>
              <li>{t.medicationsGroupA2}</li>
            </ul>

            <p className="font-semibold" style={{ color: "#268E86" }}>
              {t.medicationsGroupB}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.medicationsGroupB1}</li>
              <li>{t.medicationsGroupB2}</li>
            </ul>

            <p className="font-semibold" style={{ color: "#268E86" }}>
              {t.medicationsGroupE}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.medicationsGroupE1}</li>
              <li>{t.medicationsGroupE2}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
