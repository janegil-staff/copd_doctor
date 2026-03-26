export const isoWeek = (dateStr) => {
  const d = new Date(
    dateStr.slice(0, 4),
    dateStr.slice(5, 7) - 1,
    dateStr.slice(8, 10),
  );
  const dow = (d.getDay() + 6) % 7;
  const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 3);
  const jan4 = new Date(thu.getFullYear(), 0, 4);
  return 1 + Math.round((thu - jan4) / 604800000);
};

export const weekMonday = (dateStr) => {
  const d = new Date(
    dateStr.slice(0, 4),
    dateStr.slice(5, 7) - 1,
    dateStr.slice(8, 10),
  );
  const dow = (d.getDay() + 6) % 7;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
  return `${String(mon.getDate()).padStart(2, "0")}.${String(mon.getMonth() + 1).padStart(2, "0")}`;
};

export const parseInitialState = () => {
  if (typeof window === "undefined")
    return { patient: null, viewYear: null, viewMonth: null };
  const raw = sessionStorage.getItem("patientData");
  if (!raw) return { patient: null, viewYear: null, viewMonth: null };
  const data = JSON.parse(raw);
  const sorted = [...(data.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  if (sorted.length) {
    const last = sorted[sorted.length - 1].date;
    return {
      patient: data,
      viewYear: parseInt(last.slice(0, 4)),
      viewMonth: parseInt(last.slice(5, 7)) - 1,
    };
  }
  return { patient: data, viewYear: null, viewMonth: null };
};
