import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass-panel";
import { apiUploadImage, apiUploadReport, type UploadResult } from "@/lib/api";

const MAX_BYTES = 15 * 1024 * 1024;

function UploadCard({
  kind,
  title,
  hint,
  accept,
  onUpload,
}: {
  kind: "report" | "image";
  title: string;
  hint: string;
  accept: string;
  onUpload: (file: File) => Promise<UploadResult>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const Icon = kind === "report" ? FileText : ImageIcon;

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("File is larger than 15 MB.");
      return;
    }
    setBusy(true);
    try {
      const uploaded = await onUpload(file);
      setResult(uploaded);
      toast.success(`${file.name} analysed`);
    } catch {
      toast.error("Upload failed — please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{title}</h3>
          <p className="truncate text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/8" : "border-border/80 hover:border-primary/50"
        }`}
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="size-6 text-primary" />
        )}
        <span className="text-sm font-medium">{busy ? "Analysing…" : "Drop a file or click to browse"}</span>
        <span className="text-xs text-muted-foreground">{accept.replaceAll(",", " · ")} — up to 15 MB</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {result ? (
        <div className="mt-5 animate-rise rounded-2xl border border-border/70 bg-background/45 p-4">
          <p className="truncate text-sm font-semibold">{result.fileName}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{result.insight}</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {result.extracted.map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/60 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
          <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => setResult(null)}>
            Clear result
          </Button>
        </div>
      ) : null}
    </GlassPanel>
  );
}

export function UploadPanels() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <UploadCard
        kind="report"
        title="Lab report / PDF"
        hint="Blood panels, discharge summaries, prescriptions"
        accept=".pdf,.doc,.docx"
        onUpload={apiUploadReport}
      />
      <UploadCard
        kind="image"
        title="Medical image"
        hint="Skin, X-ray, wound or scan photograph"
        accept=".png,.jpg,.jpeg,.webp"
        onUpload={apiUploadImage}
      />
    </div>
  );
}
