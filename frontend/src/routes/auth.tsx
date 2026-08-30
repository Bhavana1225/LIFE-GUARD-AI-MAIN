import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { GlassPanel } from "@/components/glass-panel";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LifeGuard AI" },
      {
        name: "description",
        content: "Sign in or create a LifeGuard AI account to run your health screening and track your vitality score.",
      },
      { property: "og:title", content: "Sign in — LifeGuard AI" },
      { property: "og:description", content: "Access your LifeGuard AI health dashboard and risk forecasts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  async function run(action: () => Promise<void>, successMessage: string) {
    setPending(true);
    setError(null);
    try {
      await action();
      toast.success(successMessage);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
        <GlassPanel className="animate-rise p-7 sm:p-9">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-md">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Welcome to LifeGuard AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your data stays on this device until a backend is connected.
          </p>

          <Tabs defaultValue="signin" className="mt-7">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="rounded-full">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => signIn(loginEmail, loginPassword), "Signed in");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      maxLength={255}
                      className="pl-9"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      required
                      minLength={6}
                      maxLength={72}
                      className="pl-9"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <SubmitButton pending={pending} label="Sign in" />
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => signUp(name.trim(), email, password), "Account created");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      required
                      maxLength={80}
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      maxLength={255}
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      maxLength={72}
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>
                <SubmitButton pending={pending} label="Create account" />
              </form>
            </TabsContent>
          </Tabs>

          {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
        </GlassPanel>
      </main>
    </div>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Please wait…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
