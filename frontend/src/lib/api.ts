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

  return {
    bmi: rounded,
    label,
  };
}

function clamp(n: number) {
  return Math.max(2, Math.min(97, Math.round(n)));
}

function levelFor(score: number): RiskItem["level"] {
  return score < 34 ? "low" : score < 67 ? "moderate" : "high";
}

async function postPrediction(path: string, data: unknown): Promise<number> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ||
        `Prediction request failed with status ${response.status}`,
    );
  }

  const result = await response.json();

  return Number(result.prediction);
}

/* ---------------------------------- auth ---------------------------------- */

export async function apiSignIn(
  email: string,
  password: string,
): Promise<AuthUser> {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return {
    id: `usr_${btoa(email).replace(/=/g, "").slice(0, 10)}`,
    name: email.split("@")[0].replace(/[._-]/g, " "),
    email,
  };
}

export async function apiSignUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return {
    id: `usr_${Date.now().toString(36)}`,
    name,
    email,
  };
}

export async function apiSignOut(): Promise<void> {
  return;
}

/* -------------------------------- analysis -------------------------------- */

export async function apiAnalyzeHealth(
  profile: HealthProfile,
): Promise<AnalysisResult> {
  const { bmi, label } = calculateBmi(
    profile.heightCm,
    profile.weightKg,
  );

  const genderValue =
    profile.gender === "male"
      ? 1
      : 0;

  const hypertension = profile.medicalHistory.some(
    (item) => item.toLowerCase() === "hypertension",
  )
    ? 1
    : 0;

  const diabetes = profile.medicalHistory.some(
    (item) => item.toLowerCase() === "diabetes",
  )
    ? 1
    : 0;

  const heartDisease = profile.medicalHistory.some(
    (item) => item.toLowerCase() === "family heart disease",
  )
    ? 1
    : 0;

  const smokingHistory = 0;

  const heartPrediction = await postPrediction("/predict/heart", {
    age: profile.age,
    sex: genderValue,
    dataset: 0,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: diabetes,
    restecg: 0,
    thalch: 150,
    exang: 0,
    oldpeak: 0,
    slope: 1,
  });

  const diabetesPrediction = await postPrediction(
    "/predict/diabetes",
    {
      gender: genderValue,
      age: profile.age,
      hypertension,
      heart_disease: heartDisease,
      smoking_history: smokingHistory,
      bmi,
      HbA1c_level: 5.5,
      blood_glucose_level: 100,
    },
  );

  const strokePrediction = await postPrediction(
    "/predict/stroke",
    {
      gender: genderValue,
      age: profile.age,
      hypertension,
      heart_disease: heartDisease,
      ever_married: 1,
      work_type: 2,
      Residence_type: 1,
      avg_glucose_level: 100,
      bmi,
      smoking_status: smokingHistory,
    },
  );

  const kidneyPrediction = await postPrediction(
    "/predict/kidney",
    {
      age: profile.age,
      bp: 80,
      sg: 1.02,
      al: 0,
      su: 0,
      rbc: 0,
      pc: 0,
      pcc: 0,
      ba: 0,
      bgr: 100,
      bu: 30,
      sc: 1.0,
      sod: 140,
      pot: 4.5,
      hemo: 15,
      pcv: 45,
      wc: 8000,
      rc: 5,
      htn: hypertension,
      dm: diabetes,
      cad: heartDisease,
      appet: 1,
      pe: 0,
      ane: 0,
    },
  );

  const heartRisk = heartPrediction === 1 ? 75 : 20;
  const diabetesRisk = diabetesPrediction === 1 ? 75 : 20;
  const strokeRisk = strokePrediction === 1 ? 75 : 20;
  const kidneyRisk = kidneyPrediction === 1 ? 75 : 20;

  const sleepRisk =
    profile.sleepHours < 6
      ? 75
      : profile.sleepHours < 7
        ? 50
        : 20;

  const activityRisk =
    profile.activityLevel === "sedentary"
      ? 70
      : profile.activityLevel === "light"
        ? 45
        : 20;

  const risks: RiskItem[] = [
    {
      id: "cardio",
      label: "Cardiovascular",
      score: clamp(heartRisk),
      level: levelFor(heartRisk),
      drivers: [
        heartPrediction === 1
          ? "Heart model detected elevated risk"
          : "Heart model detected lower risk",
        `Age ${profile.age}`,
      ],
    },
    {
      id: "metabolic",
      label: "Metabolic / Diabetes",
      score: clamp(diabetesRisk),
      level: levelFor(diabetesRisk),
      drivers: [
        diabetesPrediction === 1
          ? "Diabetes model detected elevated risk"
          : "Diabetes model detected lower risk",
        `BMI ${bmi}`,
      ],
    },
    {
      id: "stroke",
      label: "Stroke",
      score: clamp(strokeRisk),
      level: levelFor(strokeRisk),
      drivers: [
        strokePrediction === 1
          ? "Stroke model detected elevated risk"
          : "Stroke model detected lower risk",
        `Age ${profile.age}`,
      ],
    },
    {
      id: "kidney",
      label: "Kidney",
      score: clamp(kidneyRisk),
      level: levelFor(kidneyRisk),
      drivers: [
        kidneyPrediction === 1
          ? "Kidney model detected elevated risk"
          : "Kidney model detected lower risk",
        `BMI ${bmi}`,
      ],
    },
  ];

  const averageRisk =
    risks.reduce((sum, risk) => sum + risk.score, 0) /
    risks.length;

  const vitalityScore = clamp(100 - averageRisk);

  const recommendations: Recommendation[] = [];

  if (bmi >= 25 || bmi < 18.5) {
    recommendations.push({
      id: "r-nutrition",
      title:
        bmi >= 25
          ? "Focus on a balanced nutrition plan"
          : "Increase nutrient-dense foods",
      detail:
        "Maintain a balanced diet with adequate protein, vegetables, fruits, whole grains and healthy fats.",
      category: "nutrition",
    });
  }

  if (profile.sleepHours < 7) {
    recommendations.push({
      id: "r-sleep",
      title: "Improve your sleep routine",
      detail:
        "Aim for a consistent sleep schedule and adequate nightly sleep.",
      category: "sleep",
    });
  }

  if (
    profile.activityLevel === "sedentary" ||
    profile.activityLevel === "light"
  ) {
    recommendations.push({
      id: "r-move",
      title: "Increase physical activity",
      detail:
        "Start with regular walking and gradually include strength and cardiovascular exercise.",
      category: "movement",
    });
  }

  if (
    heartPrediction === 1 ||
    diabetesPrediction === 1 ||
    strokePrediction === 1 ||
    kidneyPrediction === 1
  ) {
    recommendations.push({
      id: "r-clinical",
      title: "Discuss the prediction with a healthcare professional",
      detail:
        "The prediction is a screening result and should not be treated as a medical diagnosis.",
      category: "clinical",
    });
  }

  if (recommendations.length < 4) {
    recommendations.push({
      id: "r-maintain",
      title: "Continue regular health monitoring",
      detail:
        "Keep track of your health measurements and maintain regular medical check-ups.",
      category: "clinical",
    });
  }

  const trend = [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
    "Week 6",
  ].map((labelName, index) => ({
    label: labelName,
    vitality: clamp(vitalityScore - 5 + index),
    risk: clamp(averageRisk + 5 - index),
  }));

  const systems = [
    {
      system: "Heart",
      score: clamp(100 - heartRisk),
    },
    {
      system: "Diabetes",
      score: clamp(100 - diabetesRisk),
    },
    {
      system: "Stroke",
      score: clamp(100 - strokeRisk),
    },
    {
      system: "Kidney",
      score: clamp(100 - kidneyRisk),
    },
    {
      system: "Sleep",
      score: clamp(
        profile.sleepHours >= 7 ? 85 : profile.sleepHours * 10,
      ),
    },
    {
      system: "Fitness",
      score: clamp(100 - activityRisk),
    },
  ];

  const detectedRisks = risks
    .filter((risk) => risk.score >= 67)
    .map((risk) => risk.label);

  const summary =
    detectedRisks.length > 0
      ? `${profile.name || "Your"} health assessment identified elevated screening results in ${detectedRisks.join(", ")}.`
      : `${profile.name || "Your"} health assessment did not identify elevated screening results in the four prediction models.`;

  return {
    id: `an_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    bmi,
    bmiLabel: label,
    vitalityScore,
    risks,
    recommendations,
    trend,
    systems,
    summary,
  };
}

/* -------------------------------- uploads --------------------------------- */

export interface UploadResult {
  id: string;
  fileName: string;
  kind: "report" | "image";
  insight: string;
  extracted: { label: string; value: string }[];
}

export async function apiUploadReport(
  file: File,
): Promise<UploadResult> {
  return {
    id: `doc_${Date.now().toString(36)}`,
    fileName: file.name,
    kind: "report",
    insight:
      "Lab report uploaded successfully. Connect your report-processing backend for detailed extraction.",
    extracted: [],
  };
}

export async function apiUploadImage(
  file: File,
): Promise<UploadResult> {
  return {
    id: `img_${Date.now().toString(36)}`,
    fileName: file.name,
    kind: "image",
    insight:
      "Health image uploaded successfully. Connect your vision model for detailed image analysis.",
    extracted: [],
  };
}

/* -------------------------------- assistant -------------------------------- */

export async function apiAskAssistant(
  question: string,
  context?: AnalysisResult | null,
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