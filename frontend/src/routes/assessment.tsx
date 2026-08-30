import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { HealthForm } from "@/components/dashboard/health-form";
import { useAuth } from "@/lib/auth";
import { useHealthStore } from "@/lib/health-store";
import { apiAnalyzeHealth, calculateBmi, type HealthProfile } from "@/lib/api";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Health Assessment & Profile — LifeGuard AI" },
      {
        name: "description",
        content:
          "Capture personal details, vital parameters, lifestyle habits, medical history and symptoms to power your LifeGuard AI risk forecast.",
      },
      { property: "og:title", content: "Health Assessment & Profile — LifeGuard AI" },
      {
        property: "og:description",
        content: "One adaptive intake for vitals, habits, history and symptoms.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { user } = useAuth();
  const { profile, saveAssessment } = useHealthStore();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handleSubmit(next: HealthProfile) {
    setPending(true);
    try {
      const analysis = await apiAnalyzeHealth(next);
      saveAssessment(next, analysis);
      toast.success("Assessment saved — risk engine updated");
      navigate({ to: "/risk" });
    } catch {
      toast.error("Could not process the assessment — please try again.");
    } finally {
      setPending(false);
    }
  }

  const bmi = profile ? calculateBmi(profile.heightCm, profile.weightKg) : null;

  return (
    <AppShell
      title="Health assessment & profile"
      description="Personal information, vital parameters, lifestyle habits and symptoms — everything the scoring engine needs."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <HealthForm onSubmit={handleSubmit} pending={pending} defaultName={profile?.name ?? user?.name ?? ""} />

        <div className="space-y-6">
          <GlassPanel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">Stored profile</h2>
            {profile ? (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Name", profile.name],
                  ["Age", `${profile.age} years`],
                  ["Gender", profile.gender],
                  ["Height", `${profile.heightCm} cm`],
                  ["Weight", `${profile.weightKg} kg`],
                  ["BMI", bmi ? `${bmi.bmi} · ${bmi.label}` : "—"],
                  ["Sleep", `${profile.sleepHours} h / night`],
                  ["Activity", profile.activityLevel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-muted/60 px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="truncate text-sm font-semibold capitalize">{value}</dd>
                  </div>
                ))}
                <div className="rounded-xl bg-muted/60 px-3 py-2 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Medical history</dt>
                  <dd className="text-sm font-semibold">
                    {profile.medicalHistory.length ? profile.medicalHistory.join(", ") : "None reported"}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/60 px-3 py-2 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Symptoms</dt>
                  <dd className="text-sm font-semibold">{profile.symptoms || "None reported"}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing saved yet. Submit the form and your profile is stored on this device, then reused by every
                module — risk engine, prevention plan, explainability and the AI assistant.
              </p>
            )}
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">How your data is used</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Vitals and body metrics feed the metabolic and cardiovascular components of the model.</li>
              <li>Sleep and activity habits drive the recovery and fitness sub-scores.</li>
              <li>History and free-text symptoms adjust the prior probability of each disease cluster.</li>
              <li>Everything stays on this device until you connect a backend endpoint.</li>
            </ul>
          </GlassPanel>
        </div>
      </div>
    </AppShell>
  );
}
