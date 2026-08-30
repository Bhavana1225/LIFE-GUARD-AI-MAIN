import { createFileRoute } from "@tanstack/react-router";
import { Apple, CalendarCheck, Dumbbell, Moon } from "lucide-react";
import { AppShell, NeedsAssessment } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Recommendations } from "@/components/dashboard/recommendations";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Preventive Recommendation Engine — LifeGuard AI" },
      {
        name: "description",
        content:
          "Personalised diet, exercise, sleep and preventive healthcare recommendations generated from your predicted risk profile.",
      },
      { property: "og:title", content: "Preventive Recommendation Engine — LifeGuard AI" },
      { property: "og:description", content: "A weekly prevention plan built from your own risk scores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecommendationsPage,
});

const PILLARS = [
  { icon: Apple, title: "Nutrition", body: "Protein-forward meals, refined carbs under 20% of intake, 30 g fibre daily." },
  { icon: Dumbbell, title: "Movement", body: "150 min zone-2 cardio plus two resistance sessions each week." },
  { icon: Moon, title: "Sleep", body: "Fixed wake time, caffeine cut-off 10 h before bed, dark and cool room." },
  { icon: CalendarCheck, title: "Preventive care", body: "Quarterly lipids, HbA1c, blood pressure and resting heart rate." },
];

function RecommendationsPage() {
  const { result } = useHealthStore();

  return (
    <AppShell
      title="Personalised preventive plan"
      description="Diet, exercise, lifestyle and preventive-care actions derived from your predicted risk — highest impact first."
    >
      {result ? (
        <div className="space-y-6">
          <Recommendations result={result} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <GlassPanel key={title} className="p-6" interactive>
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </GlassPanel>
            ))}
          </div>

          <GlassPanel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">Your 4-week schedule</h2>
            <ol className="mt-4 space-y-3">
              {[
                "Week 1 — Baseline: log sleep and steps daily, apply the top recommendation only.",
                "Week 2 — Add the second recommendation and one resistance session.",
                "Week 3 — Increase cardio volume by 10% and book any clinical follow-up.",
                "Week 4 — Re-run the assessment and compare your vitality trajectory.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3 rounded-2xl border border-border/70 bg-background/45 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </GlassPanel>
        </div>
      ) : (
        <NeedsAssessment what="a personalised diet, exercise and preventive-care plan" />
      )}
    </AppShell>
  );
}
