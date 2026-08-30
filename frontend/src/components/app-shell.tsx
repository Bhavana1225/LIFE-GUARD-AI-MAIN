import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BadgeAlert,
  Brain,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/healthUtils";

export const MODULES = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/assessment", label: "Assessment", icon: ClipboardList },
  { to: "/risk", label: "Risk engine", icon: ShieldCheck },
  { to: "/explain", label: "Explainability", icon: Brain },
  { to: "/recommendations", label: "Prevention plan", icon: Activity },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/assistant", label: "AI assistant", icon: MessageSquare },
  { to: "/emergency", label: "Emergency SOS", icon: BadgeAlert },
  { to: "/nearby", label: "Nearby care", icon: MapPin },
  { to: "/shop", label: "Pharmacy", icon: ShoppingBag },
] as const;

function ModuleNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="LifeGuard modules" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-2">
        {MODULES.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <ModuleNav />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
        <p className="pt-4 text-xs text-muted-foreground">
          LifeGuard AI provides educational screening support only and is not a medical diagnosis.
        </p>
      </main>
    </div>
  );
}

export function NeedsAssessment({ what }: { what: string }) {
  return (
    <GlassPanel className="flex min-h-72 flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-brand text-primary-foreground shadow-lg">
        <ClipboardList className="size-6" />
      </span>
      <h2 className="text-2xl font-bold">No assessment on file</h2>
      <p className="max-w-md text-muted-foreground">
        Complete the health assessment first and LifeGuard AI will generate {what}.
      </p>
      <Link to="/assessment">
        <Button className="rounded-xl bg-brand px-6 text-primary-foreground shadow-md hover:opacity-90">
          Start assessment
        </Button>
      </Link>
    </GlassPanel>
  );
}
