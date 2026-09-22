import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  component: RouteComponent,
});

type Medicine = {
  brand_id?: string;
  brand_name?: string;
  type?: string;
  dosage_form?: string;
  generic?: string;
  strength?: string;
  manufacturer?: string;
  package_container?: string;
  package_size?: string;
  price?: number;
};

function RouteComponent() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMedicines(query = "") {
    try {
      setLoading(true);

      const url = query
        ? "http://127.0.0.1:8000/medicine/search?query=" +
          encodeURIComponent(query) +
          "&limit=20"
        : "http://127.0.0.1:8000/medicine/search?limit=20";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load medicines");
      }

      const data = await response.json();
      setMedicines(data.results || []);
    } catch (error) {
      console.error(error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold">
          LifeGuard AI Pharmacy
        </h1>

        <p className="mb-6 text-muted-foreground">
          Search medicines available in the pharmacy.
        </p>

        <div className="mb-8 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadMedicines(search);
              }
            }}
            placeholder="Search medicine..."
            className="h-12 flex-1 rounded-xl border bg-background px-4 outline-none"
          />

          <button
            type="button"
            onClick={() => loadMedicines(search)}
            className="rounded-xl bg-primary px-6 text-primary-foreground"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border p-8 text-center">
            Loading medicines...
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            No medicines found.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.map((medicine, index) => (
              <div
                key={medicine.brand_id || index}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">
                    {medicine.brand_name || "Medicine"}
                  </h2>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    {medicine.type || "Medicine"}
                  </span>
                </div>

                {medicine.generic && (
                  <p className="mb-2 text-sm">
                    <strong>Generic:</strong> {medicine.generic}
                  </p>
                )}

                {medicine.strength && (
                  <p className="mb-2 text-sm">
                    <strong>Strength:</strong> {medicine.strength}
                  </p>
                )}

                {medicine.dosage_form && (
                  <p className="mb-2 text-sm">
                    <strong>Form:</strong> {medicine.dosage_form}
                  </p>
                )}

                {medicine.manufacturer && (
                  <p className="mb-2 text-sm">
                    <strong>Manufacturer:</strong>{" "}
                    {medicine.manufacturer}
                  </p>
                )}

                <div className="mt-4 border-t pt-4">
                  <p className="text-2xl font-bold">
                    ?{Number(medicine.price || 0).toFixed(2)}
                  </p>

                  {medicine.package_container && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {medicine.package_container}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
