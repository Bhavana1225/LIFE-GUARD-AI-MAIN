import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Loader2, MapPin, Navigation, Phone, Search, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiNearbyFacilities, type Facility } from "@/lib/api-extra";
import { cn } from "@/lib/healthUtils";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Hospitals, Clinics & Pharmacies — LifeGuard AI" },
      {
        name: "description",
        content:
          "Find nearby hospitals, clinics, pharmacies and diagnostic centres with distance, ratings, phone numbers and navigation links.",
      },
      { property: "og:title", content: "Nearby Healthcare Services — LifeGuard AI" },
      { property: "og:description", content: "Hospitals, clinics, pharmacies and labs near you with navigation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NearbyPage,
});

const FILTERS = [
  { value: "all", label: "All" },
  { value: "hospital", label: "Hospitals" },
  { value: "clinic", label: "Clinics" },
  { value: "pharmacy", label: "Pharmacies" },
  { value: "diagnostic", label: "Diagnostics" },
] as const;

function NearbyPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiNearbyFacilities(query)
      .then((data) => {
        if (active) setFacilities(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const visible = useMemo(
    () => (kind === "all" ? facilities : facilities.filter((f) => f.kind === kind)),
    [facilities, kind],
  );

  return (
    <AppShell
      title="Nearby healthcare services"
      description="Hospitals, clinics, pharmacies and diagnostic centres sorted by distance, with contact and navigation support."
    >
      <div className="space-y-6">
        <GlassPanel className="p-5 sm:p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, type or street"
              className="pl-9"
              aria-label="Search healthcare facilities"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setKind(f.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  kind === f.value
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border/70 bg-background/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </GlassPanel>

        {loading ? (
          <GlassPanel className="grid min-h-64 place-items-center p-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </GlassPanel>
        ) : visible.length === 0 ? (
          <GlassPanel className="p-10 text-center text-muted-foreground">No facilities match that search.</GlassPanel>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {visible.map((f) => (
              <li key={f.id}>
                <GlassPanel className="h-full p-6" interactive>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold">{f.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" /> {f.address}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                      {f.kind}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-muted/60 px-2.5 py-1 font-semibold">{f.distanceKm} km away</span>
                    <span className="flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 font-semibold">
                      <Star className="size-3" /> {f.rating}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 font-semibold">
                      <Clock className="size-3" /> {f.open24h ? "Open 24 h" : "Daytime hours"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a href={`tel:${f.phone}`}>
                      <Button variant="outline" className="w-full rounded-xl">
                        <Phone className="size-4" /> Call
                      </Button>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name} ${f.address}`)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Button className="w-full rounded-xl bg-brand text-primary-foreground hover:opacity-90">
                        <Navigation className="size-4" /> Navigate
                      </Button>
                    </a>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
