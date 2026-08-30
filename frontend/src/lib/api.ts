/**
 * Placeholder API layer for LifeGuard AI.
 *
 * Every function here mimics a real network call (latency + typed payloads) so
 * the UI is fully functional today. Swap each `simulate(...)` body for a real
 * `fetch(API_BASE + path)` call when the backend is ready — signatures stay the same.
 */

export const API_BASE = "http://127.0.0.1:8000";

export interface HealthProfile {
  name: string;
  age: number;
  gender: "female" | "male" | "other";
  heightCm: number;
  weightKg: number;
  sleepHours: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
  medicalHistory: string[];
  symptoms: string;
}

export interface RiskItem {
  id: string;
  label: string;
  score: number;
  level: "low" | "moderate" | "high";
  drivers: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  category: "nutrition" | "movement" | "sleep" | "clinical";
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  bmi: number;
  bmiLabel: string;
  vitalityScore: number;
  risks: RiskItem[];
  recommendations: Recommendation[];
  trend: { label: string; vitality: number; risk: number }[];
  systems: { system: string; score: number }[];
  summary: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

function simulate<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ---------------------------------- auth ---------------------------------- */

export async function apiSignIn(email: string, password: string): Promise<AuthUser> {
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  return simulate({
    id: `usr_${btoa(email).replace(/=/g, "").slice(0, 10)}`,
    name: email.split("@")[0].replace(/[._-]/g, " "),
    email,
  });
}

export async function apiSignUp(name: string, email: string, password: string): Promise<AuthUser> {
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  return simulate({ id: `usr_${Date.now().toString(36)}`, name, email });
}

export async function apiSignOut(): Promise<void> {
  return simulate(undefined, 200);
}

/* -------------------------------- analysis -------------------------------- */

export function calculateBmi(heightCm: number, weightKg: number) {
  const meters = heightCm / 100;
  const bmi = meters > 0 ? weightKg / (meters * meters) : 0;
  const rounded = Math.round(bmi * 10) / 10;
  const label =
    rounded === 0
      ? "Unknown"
      : rounded < 18.5
        ? "Underweight"
        : rounded < 25
          ? "Healthy"
          : rounded < 30
            ? "Overweight"
            : "Obese";
  return { bmi: rounded, label };
}

function clamp(n: number) {
  return Math.max(2, Math.min(97, Math.round(n)));
}

function levelFor(score: number): RiskItem["level"] {
  return score < 34 ? "low" : score < 67 ? "moderate" : "high";
}

/** Placeholder inference — replace with POST `${API_BASE}/predict`. */
export async function apiAnalyzeHealth(profile: HealthProfile): Promise<AnalysisResult> {
  const { bmi, label } = calculateBmi(profile.heightCm, profile.weightKg);
  const activityWeight = {
    sedentary: 24,
    light: 15,
    moderate: 7,
    active: 2,
    athlete: 0,
  }[profile.activityLevel];

  const bmiPenalty = Math.abs(bmi - 22) * 2.4;
  const sleepPenalty = Math.abs(7.5 - profile.sleepHours) * 6;
  const agePenalty = Math.max(0, profile.age - 30) * 0.55;
  const historyPenalty = profile.medicalHistory.length * 7;
  const symptomPenalty = Math.min(18, profile.symptoms.trim().split(/\s+/).filter(Boolean).length * 1.6);

  const base = bmiPenalty + sleepPenalty + agePenalty + activityWeight + historyPenalty + symptomPenalty;

  const risks: RiskItem[] = [
    {
      id: "cardio",
      label: "Cardiovascular",
      score: clamp(base * 0.92),
      level: "low",
      drivers: [`BMI ${bmi}`, `Activity: ${profile.activityLevel}`],
    },
    {
      id: "metabolic",
      label: "Metabolic / Diabetes",
      score: clamp(base * 0.84 + bmiPenalty * 0.6),
      level: "low",
      drivers: [`BMI ${bmi}`, `Age ${profile.age}`],
    },
    {
      id: "sleep",
      label: "Sleep & Recovery",
      score: clamp(sleepPenalty * 3.1 + activityWeight * 0.6),
      level: "low",
      drivers: [`${profile.sleepHours}h nightly`],
    },
    {
      id: "mental",
      label: "Stress & Mental Load",
      score: clamp(sleepPenalty * 2.2 + symptomPenalty * 2.1 + 12),
      level: "low",
      drivers: ["Reported symptoms", "Sleep debt"],
    },
  ].map((r) => ({ ...r, level: levelFor(r.score) }));

  const vitalityScore = clamp(100 - base * 0.85);

  const recommendations: Recommendation[] = [];
  if (bmi >= 25 || bmi < 18.5)
    recommendations.push({
      id: "r-nutrition",
      title: bmi >= 25 ? "Shift to a 300 kcal daily deficit" : "Add nutrient-dense calories",
      detail:
        bmi >= 25
          ? "Prioritise protein at every meal (1.6 g/kg) and keep refined carbs under 20% of intake to move BMI toward the 22 target."
          : "Add two 400 kcal nutrient-dense snacks daily with healthy fats to reach a healthy BMI range.",
      category: "nutrition",
    });
  if (profile.sleepHours < 7)
    recommendations.push({
      id: "r-sleep",
      title: `Recover ${(7.5 - profile.sleepHours).toFixed(1)}h of nightly sleep`,
      detail:
        "Anchor a fixed wake time, cut caffeine 10 hours before bed, and dim ambient light 60 minutes before sleep.",
      category: "sleep",
    });
  if (profile.activityLevel === "sedentary" || profile.activityLevel === "light")
    recommendations.push({
      id: "r-move",
      title: "Build to 150 minutes of zone-2 cardio weekly",
      detail: "Start with three 20-minute brisk walks and two short resistance sessions, then extend by 10% per week.",
      category: "movement",
    });
  if (profile.medicalHistory.length > 0)
    recommendations.push({
      id: "r-clinical",
      title: "Schedule a follow-up for your existing conditions",
      detail: `Bring this report and your history (${profile.medicalHistory.join(", ")}) to your clinician for lab confirmation.`,
      category: "clinical",
    });
  if (recommendations.length < 4)
    recommendations.push({
      id: "r-maintain",
      title: "Lock in quarterly biomarker tracking",
      detail: "Your profile is stable — track lipids, HbA1c and resting heart rate every 3 months to catch drift early.",
      category: "clinical",
    });

  const trend = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map((labelName, i) => ({
    label: labelName,
    vitality: clamp(vitalityScore - 9 + i * 2.1),
    risk: clamp(base * 0.85 + 6 - i * 1.5),
  }));

  const systems = [
    { system: "Heart", score: clamp(100 - risks[0].score) },
    { system: "Metabolism", score: clamp(100 - risks[1].score) },
    { system: "Sleep", score: clamp(100 - risks[2].score) },
    { system: "Mind", score: clamp(100 - risks[3].score) },
    { system: "Fitness", score: clamp(100 - activityWeight * 3.4) },
    { system: "Nutrition", score: clamp(100 - bmiPenalty * 2.2) },
  ];

  return simulate(
    {
      id: `an_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      bmi,
      bmiLabel: label,
      vitalityScore,
      risks,
      recommendations,
      trend,
      systems,
      summary: `${profile.name || "Your"} profile scores ${vitalityScore}/100 on vitality with a ${label.toLowerCase()} BMI of ${bmi}. The dominant risk driver is ${
        [...risks].sort((a, b) => b.score - a.score)[0].label.toLowerCase()
      }.`,
    },
    1100,
  );
}

/* -------------------------------- uploads --------------------------------- */

export interface UploadResult {
  id: string;
  fileName: string;
  kind: "report" | "image";
  insight: string;
  extracted: { label: string; value: string }[];
}

/** Replace with POST `${API_BASE}/documents` (multipart). */
export async function apiUploadReport(file: File): Promise<UploadResult> {
  return simulate(
    {
      id: `doc_${Date.now().toString(36)}`,
      fileName: file.name,
      kind: "report" as const,
      insight:
        "Lab panel parsed. Lipids and fasting glucose are within reference range; vitamin D sits slightly below optimal.",
      extracted: [
        { label: "Total cholesterol", value: "184 mg/dL" },
        { label: "Fasting glucose", value: "94 mg/dL" },
        { label: "Vitamin D", value: "24 ng/mL" },
        { label: "Resting HR", value: "68 bpm" },
      ],
    },
    1400,
  );
}

/** Replace with POST `${API_BASE}/vision` (multipart). */
export async function apiUploadImage(file: File): Promise<UploadResult> {
  return simulate(
    {
      id: `img_${Date.now().toString(36)}`,
      fileName: file.name,
      kind: "image" as const,
      insight:
        "Image analysed. No high-urgency markers detected; mild inflammation pattern suggested — clinical review recommended.",
      extracted: [
        { label: "Confidence", value: "87%" },
        { label: "Urgency", value: "Routine" },
        { label: "Suggested next step", value: "Dermatology review" },
      ],
    },
    1600,
  );
}

/** Replace with POST `${API_BASE}/assistant`. */
export async function apiAskAssistant(
  question: string,
  context?: AnalysisResult | null
): Promise<string> {

  const response = await fetch(`${API_BASE}/assistant/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error("Assistant unavailable");
  }

  const data = await response.json();

  return data.answer;
}