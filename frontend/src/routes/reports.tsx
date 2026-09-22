import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { UploadPanels } from "@/components/dashboard/upload-panels";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Medical Report Upload & AI Analysis — LifeGuard AI" },
      {
        name: "description",
        content:
          "Upload lab reports, prescriptions and medical images for AI-assisted analysis with plain-language health insights.",
      },
      { property: "og:title", content: "Medical Report Upload & AI Analysis — LifeGuard AI" },
      { property: "og:description", content: "Drop a lab PDF or medical image and get structured findings back." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell
      title="Medical report upload & AI analysis"
      description="Lab panels, discharge summaries, prescriptions and medical images — parsed into simplified insights."
    >
      <div className="space-y-6">
        <UploadPanels />

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "What we extract",
              body: "Biomarker values, reference ranges, out-of-range flags, dates and prescribing details.",
            },
            {
              title: "How it is simplified",
              body: "Every finding is rewritten in plain language with the clinical implication stated once.",
            },
            {
              title: "Privacy",
              body: "Files are processed for analysis only. Nothing is shared until you connect a backend of your choice.",
            },
          ].map((card) => (
            <GlassPanel key={card.title} className="p-6">
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">Supported documents</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {["Blood panel (CBC, lipids)", "HbA1c / glucose", "Thyroid profile", "Vitamin & mineral panel", "X-ray / scan photo", "Dermatology photo", "Discharge summary", "Prescription"].map(
              (item) => (
                <span key={item} className="rounded-xl bg-muted/60 px-3 py-2 text-sm font-medium">
                  {item}
                </span>
              ),
            )}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
