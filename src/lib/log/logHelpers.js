export const isoWeekYear = (dateStr) => {
  const d = new Date(
    dateStr.slice(0, 4),
    dateStr.slice(5, 7) - 1,
    dateStr.slice(8, 10),
  );
  const dow = (d.getDay() + 6) % 7;
  const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
  return String(thu.getFullYear());
};

export const filterRecords = (records, search, patient, t) => {
  if (!search) return records;
  const q = search.toLowerCase().trim();

  return records.filter((r) => {
    const d = new Date(
      r.date.slice(0, 4),
      r.date.slice(5, 7) - 1,
      r.date.slice(8, 10),
    );
    const dow = (d.getDay() + 6) % 7;
    const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
    const jan4 = new Date(thu.getFullYear(), 0, 4);
    const wn = 1 + Math.round((thu - jan4) / 604800000);
    const weekStr = `${t.week ?? "w"}${wn}`.toLowerCase();
    const catStr = String(r.cat8 ?? "");

    return (
      weekStr.includes(q) ||
      String(wn) === q ||
      catStr === q ||
      r.note?.toLowerCase().includes(q) ||
      (r.notes?.toLowerCase() ?? "").includes(q) ||
      (r.medicines ?? []).some((id) => {
        const m = patient.medicines?.find((x) => x.id === id);
        return m?.name?.toLowerCase().includes(q);
      })
    );
  });
};
