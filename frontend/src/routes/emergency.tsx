import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeAlert, Loader2, Phone, PlusCircle, Siren, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiDoctors, apiTriggerSos, type Doctor, type EmergencyContact, type SosResult } from "@/lib/api-extra";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency SOS & Doctor Assistance — LifeGuard AI" },
      {
        name: "description",
        content:
          "One-tap emergency alerts, emergency contact management, hotline numbers and direct doctor assistance inside LifeGuard AI.",
      },
      { property: "og:title", content: "Emergency SOS & Doctor Assistance — LifeGuard AI" },
      { property: "og:description", content: "One-tap SOS alerts and instant access to doctors and hotlines." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmergencyPage,
});

const CONTACTS_KEY = "lifeguard.contacts";

const HOTLINES = [
  { label: "Ambulance / general emergency", number: "108" },
  { label: "National Emergency Number", number: "112" },
  { label: "Mental health crisis line", number: "9071035960" },
];

function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sos, setSos] = useState<SosResult | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONTACTS_KEY);
      if (raw) setContacts(JSON.parse(raw) as EmergencyContact[]);
    } catch {
      /* ignore */
    }
    void apiDoctors().then(setDoctors);
  }, []);

  function persist(next: EmergencyContact[]) {
    setContacts(next);
    try {
      window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function addContact(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
    persist([
      ...contacts,
      {
        id: `ec_${Date.now().toString(36)}`,
        name: name.trim().slice(0, 60),
        relation: relation.trim().slice(0, 40) || "Contact",
        phone: phone.trim().slice(0, 24),
      },
    ]);
    setName("");
    setRelation("");
    setPhone("");
    toast.success("Emergency contact saved");
  }

  async function triggerSos() {
    setSending(true);
    try {
      const res = await apiTriggerSos(contacts, note);
      setSos(res);
      toast.success("SOS dispatched");
    } catch {
      toast.error("SOS failed — call your local emergency number directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell
      title="Emergency SOS & doctor assistance"
      description="One tap alerts your contacts and emergency services, with hotlines and doctor numbers one click away."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-6">
          <GlassPanel className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-destructive/12 text-destructive">
                <Siren className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold">One-tap SOS</h2>
                <p className="text-sm text-muted-foreground">
                  Notifies {contacts.length} saved contact{contacts.length === 1 ? "" : "s"} and emergency services.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="sos-note">Situation note (optional)</Label>
              <Textarea
                id="sos-note"
                rows={3}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. chest pain and shortness of breath, conscious, at home"
              />
            </div>

            <Button
              onClick={() => void triggerSos()}
              disabled={sending}
              className="mt-5 w-full rounded-2xl bg-destructive py-7 text-base font-bold text-destructive-foreground shadow-lg hover:opacity-90"
            >
              {sending ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Dispatching…
                </>
              ) : (
                <>
                  <BadgeAlert className="size-5" /> Send emergency SOS
                </>
              )}
            </Button>

            {sos ? (
              <div className="mt-5 animate-rise rounded-2xl border border-destructive/30 bg-destructive/8 p-4">
                <p className="text-sm font-semibold">SOS {sos.id} dispatched · ETA {sos.eta}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {sos.notified.map((n) => (
                    <li key={n}>• Notified {n}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {HOTLINES.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="rounded-xl border border-border/70 bg-background/45 px-3 py-3 transition-colors hover:border-destructive/40"
                >
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">{h.label}</span>
                  <span className="mt-1 block font-display text-lg font-bold">{h.number}</span>
                </a>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">Doctor assistance</h2>
            <ul className="mt-4 space-y-3">
              {doctors.map((d) => (
                <li
                  key={d.id}
                  className="grid gap-3 rounded-2xl border border-border/70 bg-background/45 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {d.specialty} · next slot {d.availability}
                    </p>
                  </div>
                  <a href={`tel:${d.phone}`} className="shrink-0">
                    <Button variant="outline" className="w-full rounded-full sm:w-auto">
                      <Phone className="size-4" /> Call
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <GlassPanel className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">Emergency contacts</h2>
          <form onSubmit={addContact} className="mt-5 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ec-name">Name</Label>
              <Input id="ec-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ec-relation">Relationship</Label>
              <Input id="ec-relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Spouse" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ec-phone">Phone</Label>
              <Input id="ec-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 202 555 0111" />
            </div>
            <Button type="submit" variant="outline" className="w-full rounded-xl">
              <PlusCircle className="size-4" /> Add contact
            </Button>
          </form>

          <ul className="mt-6 space-y-2">
            {contacts.length === 0 ? (
              <li className="text-sm text-muted-foreground">No contacts yet — add at least one for SOS alerts.</li>
            ) : (
              contacts.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border/70 bg-background/45 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {c.name} <span className="font-normal text-muted-foreground">· {c.relation}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${c.name}`}
                    onClick={() => persist(contacts.filter((x) => x.id !== c.id))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
