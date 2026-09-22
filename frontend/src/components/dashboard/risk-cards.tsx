import { Activity, Brain, Droplets, Moon } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/healthUtils";
import type { AnalysisResult, RiskItem } from "@/lib/api";

const ICONS = {
  cardio: Activity,
  metabolic: Droplets,
  sleep: Moon,
  mental: Brain,
} as const;

const LEVEL_STYLES: Record<RiskItem["level"], { chip: string; text: string }> = {
  low: { chip: "bg-safe/15 text-safe-foreground border-safe/35", text: "text-safe" },
  moderate: { chip: "bg-caution/20 text-caution-foreground border-caution/40", text: "text-caution" },
  high: { chip: "bg-vital/15 text-vital border-vital/40", text: "text-vital" },
};

export function RiskCards({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {result.risks.map((risk, index) => {
        const Icon = ICONS[risk.id as keyof typeof ICONS] ?? Activity;
        const styles = LEVEL_STYLES[risk.level];
        return (
          <GlassPanel
            key={risk.id}
            interactive
            className="animate-rise p-5"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12", styles.text)}>
                <Icon className="size-4" />
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                  styles.chip,
                )}
              >
                {risk.level}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold leading-snug">{risk.label}</h3>

            <div className="mt-5 flex items-end gap-1">
              <span className={cn("font-display text-4xl font-bold leading-none", styles.text)}>{risk.score}</span>
              <span className="pb-1 text-xs text-muted-foreground">% risk index</span>
            </div>

            <Progress value={risk.score} className="mt-3 h-2" />

            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
              {risk.drivers.map((driver) => (
                <li key={driver} className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="truncate">{driver}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        );
      })}
    </div>
  );
}
