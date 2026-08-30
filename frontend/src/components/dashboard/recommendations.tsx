import { Apple, Dumbbell, Moon, Sparkles, Stethoscope } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";
import type { AnalysisResult, Recommendation } from "@/lib/api";

const CATEGORY = {
  nutrition: { icon: Apple, tone: "text-safe", label: "Nutrition" },
  movement: { icon: Dumbbell, tone: "text-primary", label: "Movement" },
  sleep: { icon: Moon, tone: "text-chart-5", label: "Sleep" },
  clinical: { icon: Stethoscope, tone: "text-vital", label: "Clinical" },
} satisfies Record<Recommendation["category"], { icon: typeof Apple; tone: string; label: string }>;

export function Recommendations({ result }: { result: AnalysisResult }) {
  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold">Personalised plan</h3>
          <p className="text-sm text-muted-foreground">Generated for your profile — reviewed against clinical guidelines</p>
        </div>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {result.recommendations.map((rec, index) => {
          const meta = CATEGORY[rec.category];
          const Icon = meta.icon;
          return (
            <li
              key={rec.id}
              className="animate-rise rounded-2xl border border-border/70 bg-background/45 p-5"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center gap-2">
                <Icon className={`size-4 shrink-0 ${meta.tone}`} />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {meta.label}
                </span>
              </div>
              <h4 className="mt-2 text-base font-semibold">{rec.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.detail}</p>
            </li>
          );
        })}
      </ol>
    </GlassPanel>
  );
}
