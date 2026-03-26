import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";

export function ActivityCard({ t, activityData, avgActivity }) {
  if (!activityData.length) return null;

  return (
    <Card
      title={t.physicalActivity}
      accent={
        avgActivity != null
          ? {
              value:
                t.activityLabels?.[Math.round(avgActivity)] ??
                Math.round(avgActivity),
              color: "#0f8a6a",
            }
          : undefined
      }
      subtitle={t.avgSymptoms}
    >
      <BarChart data={activityData} colorFn={() => "#34d399"} height={80} />
      <div className="flex justify-between mt-1">
        {activityData.map((d, i) => (
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