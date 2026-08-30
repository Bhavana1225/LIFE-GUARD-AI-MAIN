import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Minus, Plus, ShieldAlert, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { apiPlaceOrder, apiProducts, type Product } from "@/lib/api-extra";
import { cn } from "@/lib/healthUtils";


export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Healthcare Store — Medicines & Devices — LifeGuard AI" },
      {
        name: "description",
        content:
          "Browse and order medicines, supplements and health devices recommended by LifeGuard AI, with prescription-only items clearly flagged.",
      },
      { property: "og:title", content: "Healthcare Store — LifeGuard AI" },
      { property: "og:description", content: "Order AI-recommended medicines, supplements and monitoring devices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopPage,
});

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "medicine", label: "Medicines" },
  { value: "supplement", label: "Supplements" },
  { value: "device", label: "Devices" },
  { value: "wellness", label: "Wellness" },
] as const;

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let active = true;
    apiProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () => (category === "all" ? products : products.filter((p) => p.category === category)),
    [products, category],
  );

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
        .filter((l) => l.product),
    [cart, products],
  );
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  function change(id: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] ?? 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 9);
      return next;
    });
  }

  async function checkout() {
    if (lines.length === 0) return;
    setPlacing(true);
    try {
      const order = await apiPlaceOrder(lines);
      toast.success(`Order ${order.id} placed — ${order.items} items, $${order.total}, arriving in ${order.eta}`);
      setCart({});
    } catch {
      toast.error("Checkout failed — please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <AppShell
      title="Healthcare store"
      description="Medicines, supplements and monitoring devices matched to your AI recommendations. Prescription items require a valid Rx."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === c.value
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border/70 bg-background/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <GlassPanel className="grid min-h-64 place-items-center p-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </GlassPanel>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {visible.map((p) => (
                <li key={p.id}>
                  <GlassPanel className="flex h-full flex-col p-6" interactive>
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
                        <ShoppingBag className="size-5" />
                      </span>
                      {p.rxRequired ? (
                        <span className="flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="size-3" /> Rx only
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-base font-bold">{p.name}</h3>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.rationale}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-display text-lg font-bold">${p.price.toFixed(2)}</span>
                      {cart[p.id] ? (
                        <div className="flex items-center gap-1 rounded-full border border-border/70 p-1">
                          <Button size="icon" variant="ghost" aria-label="Decrease quantity" onClick={() => change(p.id, -1)}>
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold">{cart[p.id]}</span>
                          <Button size="icon" variant="ghost" aria-label="Increase quantity" onClick={() => change(p.id, 1)}>
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="rounded-xl bg-brand text-primary-foreground hover:opacity-90"
                          onClick={() => change(p.id, 1)}
                        >
                          Add to cart
                        </Button>
                      )}
                    </div>
                  </GlassPanel>
                </li>
              ))}
            </ul>
          )}
        </div>

        <GlassPanel className="h-fit p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary/12 text-primary">
              <ShoppingCart className="size-5" />
            </span>
            <h2 className="text-xl font-bold">Your cart</h2>
          </div>

          {lines.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Cart is empty. Add a recommended product to continue.</p>
          ) : (
            <>
              <ul className="mt-5 space-y-2">
                {lines.map((l) => (
                  <li
                    key={l.product.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.qty} × ${l.product.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">${(l.qty * l.product.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">${total.toFixed(2)}</span>
              </div>

              {lines.some((l) => l.product.rxRequired) ? (
                <p className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  Your cart contains prescription-only items. A valid prescription is verified before dispatch.
                </p>
              ) : null}

              <Button
                onClick={() => void checkout()}
                disabled={placing}
                className="mt-5 w-full rounded-xl bg-brand py-6 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90"
              >
                {placing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  "Checkout"
                )}
              </Button>
            </>
          )}
        </GlassPanel>
      </div>
    </AppShell>
  );
}
