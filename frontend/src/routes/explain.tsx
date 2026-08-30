import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { AppShell, NeedsAssessment } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Progress } from "@/components/ui/progress";
import { useHealthStore } from "@/lib/health-store";
import { apiExplainRisk, type Explanation } from "@/lib/api-extra";
import { cn } from "@/lib/healthUtils";

export const Route = createFileRoute("/explain")({
  head: () => ({
    meta: [
      { title: "Explainable Risk Attribution — LifeGuard AI" },
      {
        name: "description",
        content:
          "See which factors drive your LifeGuard AI prediction, which parameters are abnormal, and the model confidence behind every score.",
      },
      { property: "og:title", content: "Explainable Risk Attribution — LifeGuard AI" },
      { property: "og:description", content: "Factor-level attribution, abnormal-parameter flags and confidence scores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ExplainPage,
});

const STATUS_STYLES = {
  normal: "border-primary/30 bg-primary/10 text-primary",
  borderline: "border-amber-500/35 bg-amber-500/12 text-amber-600 dark:text-amber-400",
  abnormal: "border-destructive/35 bg-destructive/12 text-destructive",
} as const;

function ExplainPage() {
  const { profile, result } = useHealthStore();
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile || !result) return;
    let active = true;
    setLoading(true);
    apiExplainRisk(profile, result)
      .then((data) => {
        if (active) setExplanation(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile, result]);

  if (!profile || !result) {
    return (
      <AppShell
        title="Explainable risk attribution"
        description="Transparency layer for every prediction the engine makes."
      >
        <NeedsAssessment what="a factor-by-factor explanation of your risk scores" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Explainable risk attribution"
      description="Which factors moved your prediction, which parameters sit outside the reference range, and how confident the model is."
    >
      {loading || !explanation ? (
        <GlassPanel className="grid min-h-64 place-items-center p-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Model confidence", value: `${explanation.confidence}%`, bar: explanation.confidence },
              { label: "Data completeness", value: `${explanation.dataCompleteness}%`, bar: explanation.dataCompleteness },
              { label: "Model version", value: explanation.modelVersion, bar: null },
            ].map((card) => (
              <GlassPanel key={card.label} className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <p className="mt-2 font-display text-2xl font-bold">{card.value}</p>
                {card.bar !== null ? <Progress value={card.bar} className="mt-4 h-2" /> : null}
              </GlassPanel>
            ))}
          </div>

          <GlassPanel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">Factor attribution</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share of the prediction attributable to each input, largest first.
            </p>
            <ul className="mt-6 space-y-4">
              {explanation.attributions.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border/70 bg-background/45 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-semibold">{item.factor}</span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                          STATUS_STYLES[item.status],
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      {item.direction === "raises" ? (
                        <ArrowUpRight className="size-4 text-destructive" />
                      ) : (
                        <ArrowDownRight className="size-4 text-primary" />
                      )}
                      {item.contribution}%
                    </span>
                  </div>
                  <Progress value={item.contribution * 2} className="mt-3 h-2" />
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Your value</p>
                      <p className="truncate text-sm font-semibold">{item.value}</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Reference</p>
                      <p className="truncate text-sm font-semibold">{item.reference}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.note}</p>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-destructive/12 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <h2 className="text-xl font-bold">Limitations of this prediction</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {explanation.caveats.map((caveat) => (
                <li key={caveat}>• {caveat}</li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      )}
    </AppShell>
  );
}
