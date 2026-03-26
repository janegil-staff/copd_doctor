import { isoWeek, weekMonday } from "./dateHelpers";

export const buildWeeks = (records, t) => {
  const weekMap = {};
  records.forEach((r) => {
    const wn = isoWeek(r.date);
    if (!weekMap[wn]) weekMap[wn] = { wn, mon: weekMonday(r.date), items: [] };
    weekMap[wn].items.push(r);
  });
  return Object.values(weekMap).sort((a, b) => a.wn - b.wn);
};

export const buildCatTrend = (weeks, t) =>
  weeks
    .map((w) => {
      const catItems = w.items.filter((r) => r.cat8 != null);
      if (!catItems.length) return null;
      return {
        label: `${t.week ?? "W"}${w.wn}`,
        value: Math.round(
          catItems.reduce((s, r) => s + r.cat8, 0) / catItems.length,
        ),
      };
    })
    .filter(Boolean);

export const buildExWeekly = (weeks, t) =>
  weeks.map((w) => ({
    label: `${t.week ?? "W"}${w.wn}`,
    value: w.items.filter(
      (r) => r.moderateExacerbations || r.seriousExacerbations,
    ).length,
  }));

export const buildWeightData = (weeks, t) =>
  weeks
    .map((w) => {
      const withWeight = w.items.filter((r) => r.weight != null);
      if (!withWeight.length) return null;
      const avg =
        withWeight.reduce((s, r) => s + r.weight, 0) / withWeight.length;
      return {
        label: `${t.week ?? "W"}${w.wn}`,
        value: Math.round(avg * 10) / 10,
      };
    })
    .filter(Boolean);

export const buildActivityData = (weeks, t) =>
  weeks
    .map((w) => {
      const total = w.items.reduce((s, r) => s + (r.physicalActivity ?? 0), 0);
      return { label: `${t.week ?? "W"}${w.wn}`, value: total };
    })
    .filter((d) => d.value > 0);

export const buildMedUsage = (records, patient) => {
  const medUsage = {};
  records.forEach((r) => {
    (r.medicines ?? []).forEach((id, i) => {
      const name =
        patient.medicines?.find((m) => m.id === id)?.name ??
        patient.userMedicines?.find((um) => um.medicineId === id)?.medicine
          ?.name ??
        `ID ${id}`;
      if (!medUsage[name]) medUsage[name] = { count: 0, times: 0 };
      medUsage[name].count++;
      medUsage[name].times += r.medicinesUsedTimes?.[i] ?? 1;
    });
  });
  return Object.entries(medUsage).sort((a, b) => b[1].count - a[1].count);
};

export const buildCatStats = (records) => {
  const catVals = records.map((r) => r.cat8).filter((v) => v != null);
  return {
    avgCat: catVals.length
      ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length)
      : null,
    minCat: catVals.length ? Math.min(...catVals) : null,
    maxCat: catVals.length ? Math.max(...catVals) : null,
    modEx: records.filter(
      (r) => r.moderateExacerbations && !r.seriousExacerbations,
    ).length,
    sevEx: records.filter((r) => r.seriousExacerbations).length,
  };
};

export const buildGad7 = (patient, t) => {
  const gad7 = patient.latestGad7;
  const GAD7_KEYS = [
    "feelingNervous",
    "noWorryingControl",
    "worrying",
    "troubleRelaxing",
    "restless",
    "easilyAnnoyed",
    "afraid",
  ];
  const gad7Sum = gad7
    ? GAD7_KEYS.reduce((s, k) => s + (gad7[k] ?? 0), 0)
    : null;
  const gad7Level =
    gad7Sum === null
      ? null
      : gad7Sum <= 9
        ? t.mild
        : gad7Sum <= 14
          ? t.moderate
          : t.serious;
  const gad7Color =
    gad7Sum === null
      ? "#7a9a98"
      : gad7Sum <= 9
        ? "#0f8a6a"
        : gad7Sum <= 14
          ? "#a16200"
          : "#b91c1c";
  return { gad7, gad7Sum, gad7Level, gad7Color };
};
