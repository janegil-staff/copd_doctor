import Image from "next/image";
import { Card } from "@/components/ui/Card";

export function MedicineCard({ t, medList, patient, recordsCount }) {
  if (!medList.length) return null;

  return (
    <Card title={t.medicines}>
      <div className="space-y-2 mt-1">
        {medList.map(([name, stats]) => {
          const um = patient.userMedicines?.find(
            (u) => u.medicine?.name === name,
          );
          return (
            <div
              key={name}
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(38,142,134,0.05)",
                border: "1px solid rgba(38,142,134,0.12)",
              }}
            >
              {um?.medicine?.image && (
                <Image
                  src={um.medicine.image}
                  alt={name}
                  width={32}
                  height={32}
                  className="object-contain rounded-lg"
                  style={{ background: "rgba(38,142,134,0.07)", padding: 3 }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#1a3a38" }}
                >
                  {name}
                </p>
                <p className="text-xs" style={{ color: "#7a9a98" }}>
                  {stats.count}{" "}
                  {(t.weeksRecorded ?? t.daysRecorded)?.toLowerCase()} ·{" "}
                  {stats.times} {t.timesUsed}
                </p>
              </div>
              <div
                className="w-16 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(38,142,134,0.1)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(stats.count / recordsCount) * 100}%`,
                    background: "#268E86",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
