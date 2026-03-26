import { Card } from "@/components/ui/Card";
import { CAT_COLOR } from "@/lib/summary/catHelpers";
import { StatRow } from "../ui/StatRow";

export function CatOverviewCard({ t, avgCat, minCat, maxCat, modEx, sevEx, weeksCount }) {
  return (
    <Card
      title={t.catScore}
      accent={
        avgCat != null ? { value: avgCat, color: CAT_COLOR(avgCat) } : undefined
      }
      subtitle={t.avgSymptoms}
    >
      <StatRow
        label={t.weeksRecorded ?? t.daysRecorded}
        value={weeksCount}
      />
      {minCat != null && (
        <StatRow label="Min CAT" value={minCat} color={CAT_COLOR(minCat)} />
      )}
      {maxCat != null && (
        <StatRow label="Max CAT" value={maxCat} color={CAT_COLOR(maxCat)} />
      )}
      <StatRow
        label={t.moderateExacerbation}
        value={modEx}
        color={modEx > 0 ? "#f97316" : "#0f8a6a"}
      />
      <StatRow
        label={t.seriousExacerbation}
        value={sevEx}
        color={sevEx > 0 ? "#ef4444" : "#0f8a6a"}
      />
    </Card>
  );
}