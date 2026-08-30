import { useState } from "react";
import { Loader2, Stethoscope } from "lucide-react";
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

const ACTIVITY: { value: HealthProfile["activityLevel"]; label: string }[] = [
  { value: "sedentary", label: "Sedentary — desk bound" },
  { value: "light", label: "Light — 1-2 sessions/week" },
  { value: "moderate", label: "Moderate — 3-4 sessions/week" },
  { value: "active", label: "Active — 5-6 sessions/week" },
  { value: "athlete", label: "Athlete — daily training" },
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
  const [name, setName] = useState(defaultName);
  const [age, setAge] = useState("34");
  const [gender, setGender] = useState<HealthProfile["gender"]>("female");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("72");
  const [sleepHours, setSleepHours] = useState([6.5]);
  const [activityLevel, setActivityLevel] = useState<HealthProfile["activityLevel"]>("light");
  const [history, setHistory] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleCondition(condition: string) {
    setHistory((prev) => {
      if (condition === "None") return prev.includes("None") ? [] : ["None"];
      const without = prev.filter((c) => c !== "None");
      return without.includes(condition) ? without.filter((c) => c !== condition) : [...without, condition];
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const numericAge = Number(age);
    const numericHeight = Number(heightCm);
    const numericWeight = Number(weightKg);
    if (!name.trim()) return setError("Please enter your name.");
    if (!Number.isFinite(numericAge) || numericAge < 1 || numericAge > 120)
      return setError("Age must be between 1 and 120.");
    if (!Number.isFinite(numericHeight) || numericHeight < 60 || numericHeight > 250)
      return setError("Height must be between 60 and 250 cm.");
    if (!Number.isFinite(numericWeight) || numericWeight < 20 || numericWeight > 350)
      return setError("Weight must be between 20 and 350 kg.");
    setError(null);
    onSubmit({
      name: name.trim().slice(0, 80),
      age: numericAge,
      gender,
      heightCm: numericHeight,
      weightKg: numericWeight,
      sleepHours: sleepHours[0],
      activityLevel,
      medicalHistory: history.filter((c) => c !== "None"),
      symptoms: symptoms.trim().slice(0, 1000),
    });
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Stethoscope className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">Health intake</h2>
          <p className="text-sm text-muted-foreground">Feeds the prediction engine in real time.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as HealthProfile["gender"])}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other / prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activity level</Label>
            <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as HealthProfile["activityLevel"])}>
              <SelectTrigger id="activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" min={60} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" min={20} max={350} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sleep">Average sleep</Label>
            <span className="font-display text-sm font-semibold text-primary">{sleepHours[0].toFixed(1)} h</span>
          </div>
          <Slider id="sleep" min={3} max={12} step={0.5} value={sleepHours} onValueChange={setSleepHours} />
        </div>

        <div className="space-y-3">
          <Label>Medical history</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONDITIONS.map((condition) => (
              <label
                key={condition}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm transition-colors hover:border-primary/45"
              >
                <Checkbox checked={history.includes(condition)} onCheckedChange={() => toggleCondition(condition)} />
                <span className="min-w-0 truncate">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms">Current symptoms</Label>
          <Textarea
            id="symptoms"
            maxLength={1000}
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. afternoon fatigue, occasional chest tightness after stairs, frequent headaches"
          />
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Running prediction…
            </>
          ) : (
            "Generate my health forecast"
          )}
        </Button>
      </form>
    </GlassPanel>
  );
}
