import { HeartPulse, Scale, TrendingUp } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/lib/api";

const BMI_BANDS = [
  { label: "Under", to: 18.5 },
  { label: "Healthy", to: 25 },
  { label: "Over", to: 30 },
  { label: "Obese", to: 40 },
];

export function VitalsSummary({ result }: { result: AnalysisResult }) {
  const markerPercent = Math.min(100, Math.max(0, (result.bmi / 40) * 100));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassPanel interactive className="p-6 lg:col-span-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/20 text-accent-foreground">
            <Scale className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">Body mass index</h3>
            <p className="text-sm text-muted-foreground">Calculated from height and weight</p>
          </div>
        </div>

        <div className="mt-6 flex items-end gap-4">
          <span className="font-display text-6xl font-bold leading-none text-brand">{result.bmi}</span>
          <span className="pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {result.bmiLabel}
          </span>
        </div>

        <div className="mt-6">
          <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-caution via-safe to-vital">
            <span
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-lg"
              style={{ left: `${markerPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {BMI_BANDS.map((band) => (
              <span key={band.label}>{band.label}</span>
            ))}
          </div>
        </div>
      </GlassPanel>

      <GlassPanel interactive className="flex flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-vital/15 text-vital">
            <HeartPulse className="size-5 animate-pulse" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">Vitality score</h3>
            <p className="text-sm text-muted-foreground">Composite index</p>
          </div>
        </div>

        <div className="mt-6">
          <span className="font-display text-5xl font-bold leading-none">{result.vitalityScore}</span>
          <span className="ml-1 text-sm text-muted-foreground">/100</span>
          <Progress value={result.vitalityScore} className="mt-4 h-2.5" />
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-safe" />
            <span>{result.summary}</span>
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
