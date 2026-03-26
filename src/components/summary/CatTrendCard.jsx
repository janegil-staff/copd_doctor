import { Card } from "@/components/ui/Card";
import { LineChart } from "@/components/charts/LineChart";

export function CatTrendCard({ t, catTrend, months, vm, vy }) {
  if (!catTrend.length) return null;

  return (
    <Card
      title={t.catScore + " – " + t.symptomLog}
      subtitle={months[vm] + " " + vy}
    >
      <LineChart data={catTrend} color="#268E86" min={0} max={40} height={90} />
      <div className="flex justify-between mt-1">
        {catTrend.map((d, i) => (
          <span
            key={i}
            className="text-xs tabular-nums"
            style={{ color: "#a0b8b6", fontSize: 10 }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}