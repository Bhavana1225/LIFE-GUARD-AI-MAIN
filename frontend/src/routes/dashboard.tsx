import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList } from "lucide-react";
import { AppShell, MODULES } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { VitalsSummary } from "@/components/dashboard/vitals-summary";
import { RiskCards } from "@/components/dashboard/risk-cards";
import { useAuth } from "@/lib/auth";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Health Dashboard — LifeGuard AI" },
      {
        name: "description",
        content:
          "Your LifeGuard AI overview: assessment status, vitality score, risk cards and quick access to every health module.",
      },
      { property: "og:title", content: "Health Dashboard — LifeGuard AI" },
      {
        property: "og:description",
        content: "One hub for assessment, risk scoring, prevention plan, reports, SOS, nearby care and the store.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const DESCRIPTIONS: Record<string, string> = {
  "/assessment": "Personal info, vitals, habits, history and symptoms.",
  "/risk": "Multi-factor disease risk scores and charts.",
  "/explain": "Factor attribution, abnormal flags and confidence.",
  "/recommendations": "Diet, exercise, lifestyle and preventive care.",
  "/reports": "Upload lab reports and medical images for AI analysis.",
  "/assistant": "Chat or speak with the AI health assistant.",
  "/emergency": "One-tap SOS, contacts, hotlines and doctors.",
  "/nearby": "Hospitals, clinics, pharmacies and diagnostics.",
  "/shop": "Order recommended medicines and devices.",
};

function Dashboard() {
  const { user } = useAuth();
  const { result } = useHealthStore();

  return (
    <AppShell
      title={`Hello, ${user?.name ?? "there"}`}
      description="Your health command centre — every module works from the single assessment you keep on file."
      actions={
        <Link to="/assessment">
          <Button className="rounded-full bg-brand text-primary-foreground shadow-md hover:opacity-90">
            <ClipboardList className="size-4" /> {result ? "Update assessment" : "Start assessment"}
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {result ? (
          <>
            <VitalsSummary result={result} />
            <RiskCards result={result} />
          </>
        ) : (
          <GlassPanel className="flex flex-col items-start gap-3 p-6 sm:p-8">
            <h2 className="text-2xl font-bold">No forecast yet</h2>
            <p className="max-w-xl text-muted-foreground">
              Complete the health assessment and LifeGuard AI will populate your risk engine, explainability dashboard and
              prevention plan.
            </p>
            <Link to="/assessment">
              <Button className="rounded-xl bg-brand px-6 text-primary-foreground shadow-md hover:opacity-90">
                Start now <ArrowRight className="size-4" />
              </Button>
            </Link>
          </GlassPanel>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.filter((m) => m.to !== "/dashboard").map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <GlassPanel className="h-full p-6" interactive>
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 flex items-center gap-2 text-lg font-bold">
                  {label} <ArrowRight className="size-4 text-muted-foreground" />
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{DESCRIPTIONS[to]}</p>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
