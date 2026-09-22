import { useState } from "react";
import {
  Loader2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassPanel } from "@/components/glass-panel";
import type { HealthProfile } from "@/lib/api";

const API_URL = "http://127.0.0.1:8000";

const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "High cholesterol",
  "Asthma",
  "Thyroid disorder",
  "Anxiety / depression",
  "Family heart disease",
  "None",
];

const ACTIVITY: {
  value: HealthProfile["activityLevel"];
  label: string;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary — desk bound",
  },
  {
    value: "light",
    label: "Light — 1-2 sessions/week",
  },
  {
    value: "moderate",
    label: "Moderate — 3-4 sessions/week",
  },
  {
    value: "active",
    label: "Active — 5-6 sessions/week",
  },
  {
    value: "athlete",
    label: "Athlete — daily training",
  },
];

export function HealthForm({
  onSubmit,
  pending,
  defaultName,
}: {
  onSubmit: (profile: HealthProfile) => void;
  pending: boolean;
  defaultName: string;
}) {
  const [name, setName] =
    useState(defaultName);

  const [age, setAge] =
    useState("34");

  const [gender, setGender] =
    useState<HealthProfile["gender"]>(
      "female"
    );

  const [heightCm, setHeightCm] =
    useState("170");

  const [weightKg, setWeightKg] =
    useState("72");

  const [sleepHours, setSleepHours] =
    useState([6.5]);

  const [activityLevel, setActivityLevel] =
    useState<
      HealthProfile["activityLevel"]
    >("light");

  const [history, setHistory] =
    useState<string[]>([]);

  const [symptoms, setSymptoms] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [heartCp, setHeartCp] =
    useState("0");

  const [heartTrestbps, setHeartTrestbps] =
    useState("120");

  const [heartChol, setHeartChol] =
    useState("200");

  const [heartFbs, setHeartFbs] =
    useState("0");

  const [heartRestecg, setHeartRestecg] =
    useState("0");

  const [heartThalach, setHeartThalach] =
    useState("150");

  const [heartExang, setHeartExang] =
    useState("0");

  const [heartOldpeak, setHeartOldpeak] =
    useState("0");

  const [heartSlope, setHeartSlope] =
    useState("1");

  const [heartCa, setHeartCa] =
    useState("0");

  const [heartThal, setHeartThal] =
    useState("2");

  const [hypertension, setHypertension] =
    useState("0");

  const [heartDisease, setHeartDisease] =
    useState("0");

  const [smokingHistory, setSmokingHistory] =
    useState("0");

  const [hba1c, setHba1c] =
    useState("5.5");

  const [glucose, setGlucose] =
    useState("100");

  const [everMarried, setEverMarried] =
    useState("1");

  const [workType, setWorkType] =
    useState("0");

  const [residenceType, setResidenceType] =
    useState("1");

  const [strokeSmoking, setStrokeSmoking] =
    useState("0");

  const [kidneyBp, setKidneyBp] =
    useState("80");

  const [kidneySg, setKidneySg] =
    useState("1.020");

  const [kidneyAl, setKidneyAl] =
    useState("0");

  const [kidneySu, setKidneySu] =
    useState("0");

  const [kidneyRbc, setKidneyRbc] =
    useState("0");

  const [kidneyPc, setKidneyPc] =
    useState("0");

  const [kidneyPcc, setKidneyPcc] =
    useState("0");

  const [kidneyBa, setKidneyBa] =
    useState("0");

  const [kidneyBgr, setKidneyBgr] =
    useState("100");

  const [kidneyBu, setKidneyBu] =
    useState("30");

  const [kidneySc, setKidneySc] =
    useState("1");

  const [kidneySod, setKidneySod] =
    useState("140");

  const [kidneyPot, setKidneyPot] =
    useState("4.5");

  const [kidneyHemo, setKidneyHemo] =
    useState("14");

  const [kidneyPcv, setKidneyPcv] =
    useState("44");

  const [kidneyWc, setKidneyWc] =
    useState("8000");

  const [kidneyRc, setKidneyRc] =
    useState("5");

  const [kidneyHtn, setKidneyHtn] =
    useState("0");

  const [kidneyDm, setKidneyDm] =
    useState("0");

  const [kidneyCad, setKidneyCad] =
    useState("0");

  const [kidneyAppet, setKidneyAppet] =
    useState("1");

  const [kidneyPe, setKidneyPe] =
    useState("0");

  const [kidneyAne, setKidneyAne] =
    useState("0");

  function toggleCondition(
    condition: string
  ) {
    setHistory((prev) => {
      if (condition === "None") {
        return prev.includes("None")
          ? []
          : ["None"];
      }

      const withoutNone =
        prev.filter((c) => c !== "None");

      return withoutNone.includes(condition)
        ? withoutNone.filter(
            (c) => c !== condition
          )
        : [
            ...withoutNone,
            condition,
          ];
    });
  }

  async function saveProfile(
    profile: HealthProfile
  ) {
    try {
      setSavingProfile(true);

      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("user_id") ||
        localStorage.getItem("userId");

      let userId = "default-user";

      if (storedUser) {
        try {
          const parsed =
            JSON.parse(storedUser);

          if (typeof parsed === "string") {
            userId = parsed;
          } else {
            userId =
              parsed?.id ||
              parsed?._id ||
              parsed?.user_id ||
              "default-user";
          }
        } catch {
          userId = storedUser;
        }
      }

      const response = await fetch(
        `${API_URL}/profile/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: String(userId),
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            height: profile.heightCm,
            weight: profile.weightKg,
            sleep_hours:
              profile.sleepHours,
            activity_level:
              profile.activityLevel,
            medical_history:
              profile.medicalHistory,
            symptoms: profile.symptoms,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
            `Profile request failed with status ${response.status}`
        );
      }

      return await response.json();
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const numericAge =
      Number(age);

    const numericHeight =
      Number(heightCm);

    const numericWeight =
      Number(weightKg);

    if (!name.trim()) {
      setError(
        "Please enter your name."
      );
      return;
    }

    if (
      !Number.isFinite(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setError(
        "Age must be between 1 and 120."
      );
      return;
    }

    if (
      !Number.isFinite(
        numericHeight
      ) ||
      numericHeight < 60 ||
      numericHeight > 250
    ) {
      setError(
        "Height must be between 60 and 250 cm."
      );
      return;
    }

    if (
      !Number.isFinite(
        numericWeight
      ) ||
      numericWeight < 20 ||
      numericWeight > 350
    ) {
      setError(
        "Weight must be between 20 and 350 kg."
      );
      return;
    }

    setError(null);

    const numericGender =
      gender === "male"
        ? 1
        : 0;

    const bmi =
      numericWeight /
      Math.pow(
        numericHeight / 100,
        2
      );

    const profile: HealthProfile = {
      name: name
        .trim()
        .slice(0, 80),

      age: numericAge,

      gender,

      heightCm: numericHeight,

      weightKg: numericWeight,

      sleepHours:
        sleepHours[0],

      activityLevel,

      medicalHistory:
        history.filter(
          (c) => c !== "None"
        ),

      symptoms:
        symptoms
          .trim()
          .slice(0, 1000),

      heart: {
        sex: numericGender,
        cp: Number(heartCp),
        trestbps:
          Number(heartTrestbps),
        chol:
          Number(heartChol),
        fbs:
          Number(heartFbs),
        restecg:
          Number(heartRestecg),
        thalach:
          Number(heartThalach),
        exang:
          Number(heartExang),
        oldpeak:
          Number(heartOldpeak),
        slope:
          Number(heartSlope),
        ca:
          Number(heartCa),
        thal:
          Number(heartThal),
      },

      diabetes: {
        gender:
          numericGender,
        hypertension:
          Number(hypertension),
        heart_disease:
          Number(heartDisease),
        smoking_history:
          Number(smokingHistory),
        bmi:
          Number(bmi.toFixed(2)),
        HbA1c_level:
          Number(hba1c),
        blood_glucose_level:
          Number(glucose),
      },

      stroke: {
        gender:
          numericGender,
        hypertension:
          Number(hypertension),
        heart_disease:
          Number(heartDisease),
        ever_married:
          Number(everMarried),
        work_type:
          Number(workType),
        Residence_type:
          Number(residenceType),
        avg_glucose_level:
          Number(glucose),
        bmi:
          Number(bmi.toFixed(2)),
        smoking_status:
          Number(strokeSmoking),
      },

      kidney: {
        bp:
          Number(kidneyBp),
        sg:
          Number(kidneySg),
        al:
          Number(kidneyAl),
        su:
          Number(kidneySu),
        rbc:
          Number(kidneyRbc),
        pc:
          Number(kidneyPc),
        pcc:
          Number(kidneyPcc),
        ba:
          Number(kidneyBa),
        bgr:
          Number(kidneyBgr),
        bu:
          Number(kidneyBu),
        sc:
          Number(kidneySc),
        sod:
          Number(kidneySod),
        pot:
          Number(kidneyPot),
        hemo:
          Number(kidneyHemo),
        pcv:
          Number(kidneyPcv),
        wc:
          Number(kidneyWc),
        rc:
          Number(kidneyRc),
        htn:
          Number(kidneyHtn),
        dm:
          Number(kidneyDm),
        cad:
          Number(kidneyCad),
        appet:
          Number(kidneyAppet),
        pe:
          Number(kidneyPe),
        ane:
          Number(kidneyAne),
      },
    };

    try {
      await saveProfile(profile);

      onSubmit(profile);
    } catch (err) {
      console.error(
        "Health profile save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your health profile."
      );
    }
  }

  const isPending =
    pending || savingProfile;

  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Stethoscope className="size-5" />
        </span>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">
            Health intake
          </h2>

          <p className="text-sm text-muted-foreground">
            Feeds the prediction engine in real time.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full name
            </Label>

            <Input
              id="name"
              value={name}
              maxLength={80}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">
              Age
            </Label>

            <Input
              id="age"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender
            </Label>

            <Select
              value={gender}
              onValueChange={(v) =>
                setGender(
                  v as HealthProfile["gender"]
                )
              }
            >
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="female">
                  Female
                </SelectItem>

                <SelectItem value="male">
                  Male
                </SelectItem>

                <SelectItem value="other">
                  Other / prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">
              Activity level
            </Label>

            <Select
              value={activityLevel}
              onValueChange={(v) =>
                setActivityLevel(
                  v as HealthProfile["activityLevel"]
                )
              }
            >
              <SelectTrigger id="activity">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {ACTIVITY.map((a) => (
                  <SelectItem
                    key={a.value}
                    value={a.value}
                  >
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">
              Height (cm)
            </Label>

            <Input
              id="height"
              type="number"
              min={60}
              max={250}
              value={heightCm}
              onChange={(e) =>
                setHeightCm(
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight (kg)
            </Label>

            <Input
              id="weight"
              type="number"
              min={20}
              max={350}
              value={weightKg}
              onChange={(e) =>
                setWeightKg(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sleep">
              Average sleep
            </Label>

            <span className="font-display text-sm font-semibold text-primary">
              {sleepHours[0].toFixed(1)} h
            </span>
          </div>

          <Slider
            id="sleep"
            min={3}
            max={12}
            step={0.5}
            value={sleepHours}
            onValueChange={
              setSleepHours
            }
          />
        </div>

        <div className="space-y-3">
          <Label>
            Medical history
          </Label>

          <div className="grid gap-2 sm:grid-cols-2">
            {CONDITIONS.map(
              (condition) => (
                <label
                  key={condition}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm transition-colors hover:border-primary/45"
                >
                  <Checkbox
                    checked={history.includes(
                      condition
                    )}
                    onCheckedChange={() =>
                      toggleCondition(
                        condition
                      )
                    }
                  />

                  <span className="min-w-0 truncate">
                    {condition}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms">
            Current symptoms
          </Label>

          <Textarea
            id="symptoms"
            maxLength={1000}
            rows={3}
            value={symptoms}
            onChange={(e) =>
              setSymptoms(
                e.target.value
              )
            }
            placeholder="e.g. afternoon fatigue, occasional chest tightness after stairs, frequent headaches"
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/30 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Model health inputs
            </h3>

            <p className="text-sm text-muted-foreground">
              These values are sent to the connected ML prediction models.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Chest pain type
              </Label>

              <Select
                value={heartCp}
                onValueChange={
                  setHeartCp
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="0">
                    0 — Typical angina
                  </SelectItem>

                  <SelectItem value="1">
                    1 — Atypical angina
                  </SelectItem>

                  <SelectItem value="2">
                    2 — Non-anginal
                  </SelectItem>

                  <SelectItem value="3">
                    3 — Asymptomatic
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Resting blood pressure
              </Label>

              <Input
                type="number"
                value={heartTrestbps}
                onChange={(e) =>
                  setHeartTrestbps(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Cholesterol
              </Label>

              <Input
                type="number"
                value={heartChol}
                onChange={(e) =>
                  setHeartChol(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Maximum heart rate
              </Label>

              <Input
                type="number"
                value={heartThalach}
                onChange={(e) =>
                  setHeartThalach(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                HbA1c level
              </Label>

              <Input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) =>
                  setHba1c(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Blood glucose
              </Label>

              <Input
                type="number"
                value={glucose}
                onChange={(e) =>
                  setGlucose(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Kidney blood pressure
              </Label>

              <Input
                type="number"
                value={kidneyBp}
                onChange={(e) =>
                  setKidneyBp(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Serum creatinine
              </Label>

              <Input
                type="number"
                step="0.1"
                value={kidneySc}
                onChange={(e) =>
                  setKidneySc(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Blood urea
              </Label>

              <Input
                type="number"
                value={kidneyBu}
                onChange={(e) =>
                  setKidneyBu(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Hemoglobin
              </Label>

              <Input
                type="number"
                step="0.1"
                value={kidneyHemo}
                onChange={(e) =>
                  setKidneyHemo(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <Checkbox
                checked={
                  hypertension === "1"
                }
                onCheckedChange={(
                  checked
                ) =>
                  setHypertension(
                    checked ? "1" : "0"
                  )
                }
              />

              <span className="text-sm">
                Hypertension
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <Checkbox
                checked={
                  heartDisease === "1"
                }
                onCheckedChange={(
                  checked
                ) =>
                  setHeartDisease(
                    checked ? "1" : "0"
                  )
                }
              />

              <span className="text-sm">
                Heart disease
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <Checkbox
                checked={
                  smokingHistory === "1"
                }
                onCheckedChange={(
                  checked
                ) =>
                  setSmokingHistory(
                    checked ? "1" : "0"
                  )
                }
              />

              <span className="text-sm">
                Smoking history
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <Checkbox
                checked={
                  strokeSmoking === "1"
                }
                onCheckedChange={(
                  checked
                ) =>
                  setStrokeSmoking(
                    checked ? "1" : "0"
                  )
                }
              />

              <span className="text-sm">
                Current smoking status
              </span>
            </label>
          </div>

          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-semibold">
              Advanced model inputs
            </summary>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Heart oldpeak"
                value={heartOldpeak}
                onChange={(e) =>
                  setHeartOldpeak(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Heart slope"
                value={heartSlope}
                onChange={(e) =>
                  setHeartSlope(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Heart CA"
                value={heartCa}
                onChange={(e) =>
                  setHeartCa(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Heart thal"
                value={heartThal}
                onChange={(e) =>
                  setHeartThal(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                step="0.001"
                placeholder="Kidney specific gravity"
                value={kidneySg}
                onChange={(e) =>
                  setKidneySg(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Kidney BGR"
                value={kidneyBgr}
                onChange={(e) =>
                  setKidneyBgr(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Kidney sodium"
                value={kidneySod}
                onChange={(e) =>
                  setKidneySod(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                step="0.1"
                placeholder="Kidney potassium"
                value={kidneyPot}
                onChange={(e) =>
                  setKidneyPot(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Kidney WBC"
                value={kidneyWc}
                onChange={(e) =>
                  setKidneyWc(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                step="0.1"
                placeholder="Kidney RBC"
                value={kidneyRc}
                onChange={(e) =>
                  setKidneyRc(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Kidney packed cell volume"
                value={kidneyPcv}
                onChange={(e) =>
                  setKidneyPcv(
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                step="0.1"
                placeholder="Kidney albumin"
                value={kidneyAl}
                onChange={(e) =>
                  setKidneyAl(
                    e.target.value
                  )
                }
              />
            </div>
          </details>
        </div>

        {error ? (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              {savingProfile
                ? "Saving health profile…"
                : "Running prediction…"}
            </>
          ) : (
            "Generate my health forecast"
          )}
        </Button>
      </form>
    </GlassPanel>
  );
}