import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";

export function ExacerbationCard({ t, exWeekly, months, vm, vy }) {
  if (!exWeekly.some((d) => d.value > 0)) return null;

  return (
    <Card title={t.exacerbation} subtitle={months[vm] + " " + vy}>
      <BarChart data={exWeekly} colorFn={() => "#ef4444"} height={80} />
      <div className="flex justify-between mt-1">
        {exWeekly.map((d, i) => (
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