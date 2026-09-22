import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassPanel } from "@/components/glass-panel";
import type { AnalysisResult } from "@/lib/api";

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--glass-border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  boxShadow: "var(--shadow-glass)",
};

export function HealthCharts({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <GlassPanel interactive className="p-6 xl:col-span-2">
        <h3 className="text-lg font-bold">Projected 6-week trajectory</h3>
        <p className="text-sm text-muted-foreground">If you follow the recommended plan</p>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.trend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="vitalityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="vitality"
                name="Vitality"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#vitalityFill)"
              />
              <Area
                type="monotone"
                dataKey="risk"
                name="Risk"
                stroke="var(--chart-4)"
                strokeWidth={2.5}
                fill="url(#riskFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel interactive className="p-6">
        <h3 className="text-lg font-bold">System balance</h3>
        <p className="text-sm text-muted-foreground">Higher is healthier</p>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={result.systems} outerRadius="66%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="system" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="var(--chart-2)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel interactive className="p-6 xl:col-span-3">
        <h3 className="text-lg font-bold">Risk index by domain</h3>
        <p className="text-sm text-muted-foreground">Ranked contribution to your overall forecast</p>
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.risks} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="score" name="Risk index" fill="var(--chart-1)" radius={[10, 10, 4, 4]} barSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </div>
  );
}
