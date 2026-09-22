import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  FileText,
  LineChart,
  Mic,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { GlassPanel, SectionTitle } from "@/components/glass-panel";
import heroImage from "@/assets/hero-health.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeGuard AI — AI Health Risk Screening & Vitality Score" },
      {
        name: "description",
        content:
          "Enter your vitals and habits to get an instant BMI reading, four risk forecasts, interactive charts and a personalised health plan from LifeGuard AI.",
      },
      { property: "og:title", content: "LifeGuard AI — AI Health Risk Screening" },
      {
        property: "og:description",
        content: "Instant BMI, risk prediction cards, charts, voice assistant and report analysis in one glass dashboard.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Full health intake",
    body: "Age, body metrics, sleep, activity, medical history and live symptoms in one adaptive form.",
  },
  {
    icon: ShieldCheck,
    title: "Risk prediction cards",
    body: "Cardiovascular, metabolic, sleep and mental-load indices scored 0-100 with named drivers.",
  },
  {
    icon: LineChart,
    title: "Interactive charts",
    body: "Six-week trajectory, system balance radar and domain risk ranking that respond to your data.",
  },
  {
    icon: Mic,
    title: "Voice assistant",
    body: "Ask about any result out loud and hear the answer read back in natural speech.",
  },
  {
    icon: FileText,
    title: "Report & image analysis",
    body: "Drop a lab PDF or a medical photograph and get structured findings extracted instantly.",
  },
  {
    icon: Brain,
    title: "Personalised plan",
    body: "Every recommendation is derived from your own numbers — nutrition, movement, sleep, clinical.",
  },
];

const STATS = [
  { value: "12", label: "Signals analysed" },
  { value: "4", label: "Risk domains" },
  { value: "<2s", label: "Forecast time" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="size-3.5" /> AI health intelligence
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
                Know your health <span className="text-brand">before</span> your body tells you.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                LifeGuard AI reads your vitals, habits, history and reports, then returns a vitality score, four risk
                forecasts and a plan you can act on this week.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth">
                  <Button className="rounded-full bg-brand px-7 py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90">
                    Start free screening
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="rounded-full px-7 py-6 text-base font-semibold">
                    Explore the dashboard
                  </Button>
                </Link>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="glass rounded-2xl px-4 py-3">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
                    <dd className="font-display text-2xl font-bold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="glass animate-float overflow-hidden rounded-4xl p-2">
                <img
                  src={heroImage}
                  alt="Translucent anatomical figure surrounded by glass health data panels"
                  width={1280}
                  height={1024}
                  className="w-full rounded-3xl object-cover"
                />
              </div>
              <GlassPanel className="absolute -bottom-6 left-4 flex items-center gap-3 px-5 py-4 sm:left-8">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-vital/15 text-vital">
                  <Activity className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Vitality score</p>
                  <p className="font-display text-xl font-bold">82 / 100</p>
                </div>
              </GlassPanel>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle
            eyebrow="Inside the platform"
            title="Everything a screening should include"
            description="One glass dashboard covering intake, prediction, visualisation, conversation and document analysis."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <GlassPanel
                key={feature.title}
                interactive
                className="animate-rise p-6"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-md">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </GlassPanel>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <GlassPanel className="flex flex-col items-center gap-5 px-6 py-14 text-center">
            <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Your first health forecast takes under two minutes
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Create an account, fill the intake once, and LifeGuard AI keeps your baseline for every future check.
            </p>
            <Link to="/auth">
              <Button className="rounded-full bg-brand px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90">
                Create my account
              </Button>
            </Link>
          </GlassPanel>
        </section>
      </main>

      <footer className="border-t border-glass-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground sm:px-6">
          <p className="font-semibold text-foreground">LifeGuard AI</p>
          <p className="mt-1">
            Educational screening support only — not a medical diagnosis. Always consult a licensed clinician.
          </p>
        </div>
      </footer>
    </div>
  );
}
