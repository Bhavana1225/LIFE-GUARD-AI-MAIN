import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell, NeedsAssessment } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { VitalsSummary } from "@/components/dashboard/vitals-summary";
import { RiskCards } from "@/components/dashboard/risk-cards";
import { HealthCharts } from "@/components/dashboard/health-charts";
import { GlassPanel } from "@/components/glass-panel";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Dynamic Risk Scoring Engine — LifeGuard AI" },
      {
        name: "description",
        content:
          "Multi-factor AI risk scoring across cardiovascular, metabolic, sleep and mental-load domains with charts and named drivers.",
      },
      { property: "og:title", content: "Dynamic Risk Scoring Engine — LifeGuard AI" },
      { property: "og:description", content: "Multi-factor disease risk prediction scored 0-100 per domain." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const { result } = useHealthStore();

  return (
    <AppShell
      title="Multi-factor risk scoring engine"
      description="Every stored signal is combined into per-domain disease risk scores, updated the moment your assessment changes."
      actions={
        result ? (
          <Link to="/explain">
            <Button variant="outline" className="rounded-full">
              Why these scores <ArrowRight className="size-4" />
            </Button>
          </Link>
        ) : null
      }
    >
      {result ? (
        <div className="space-y-6">
          <VitalsSummary result={result} />
          <RiskCards result={result} />
          <HealthCharts result={result} />
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold">Engine summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
          </GlassPanel>
        </div>
      ) : (
        <NeedsAssessment what="your per-domain disease risk scores and charts" />
      )}
    </AppShell>
  );
}
