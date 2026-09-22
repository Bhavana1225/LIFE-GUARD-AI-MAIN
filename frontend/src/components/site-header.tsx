import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-lg">
            <Activity className="size-5" strokeWidth={2.6} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-none">LifeGuard AI</span>
            <span className="block truncate text-xs text-muted-foreground">Predictive health intelligence</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggle}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/", replace: true });
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="rounded-full bg-brand text-primary-foreground shadow-md hover:opacity-90">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
