import { Card } from "@/components/ui/Card";
import { LineChart } from "@/components/charts/LineChart";

export function WeightCard({ t, weightData }) {
  if (!weightData.length) return null;

  return (
    <Card
      title={t.weight}
      accent={{
        value: weightData[weightData.length - 1].value + " kg",
        color: "#268E86",
      }}
    >
      <LineChart data={weightData} color="#0ea5e9" height={80} />
      <div className="flex justify-between mt-1">
        {weightData.map((d, i) => (
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