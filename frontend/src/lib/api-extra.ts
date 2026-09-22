const API_URL = "http://127.0.0.1:8000";

const BDT_TO_INR = 0.77;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "medicine" | "supplement" | "device" | "wellness";
  price: number;
  currency: string;
  rationale: string;
  rxRequired: boolean;
  type?: string;
  dosageForm?: string;
  generic?: string;
  strength?: string;
  manufacturer?: string;
  packageContainer?: string;
  packageSize?: string;
  brandId?: string;
}

interface MedicineResponse {
  count: number;
  results: {
    brand_id: string;
    brand_name: string;
    type: string;
    dosage_form: string;
    generic: string;
    strength: string;
    manufacturer: string;
    package_container: string;
    package_size: string;
    price: number;
  }[];
}

export interface OrderResult {
  id: string;
  items: number;
  total: number;
  currency: string;
  eta: string;
}

function medicineToProduct(
  medicine: MedicineResponse["results"][number],
  index: number,
): Product {
  const medicineName =
    medicine.brand_name ||
    medicine.generic ||
    "Medicine " + (index + 1);

  const type = medicine.type || "Medicine";

  const generic = medicine.generic || "";

  const strength = medicine.strength || "";

  const description = [
    generic,
    strength,
    medicine.dosage_form,
  ]
    .filter(Boolean)
    .join(" • ");

  const lowerType = type.toLowerCase();

  let category: Product["category"] = "medicine";

  if (
    lowerType.includes("supplement") ||
    lowerType.includes("vitamin")
  ) {
    category = "supplement";
  }

  const bdtPrice =
    typeof medicine.price === "number"
      ? medicine.price
      : Number(medicine.price) || 0;

  const inrPrice =
    Math.round(bdtPrice * BDT_TO_INR * 100) / 100;

  return {
    id:
      "medicine-" +
      (medicine.brand_id || index) +
      "-" +
      medicineName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),

    name: medicineName,

    brand: medicine.manufacturer || "Healthcare",

    category,

    price: inrPrice,

    currency: "₹",

    rationale:
      description ||
      "Medicine information from the LifeGuard AI medicine database.",

    rxRequired:
      lowerType.includes("prescription") ||
      lowerType.includes("rx"),

    type: medicine.type,

    dosageForm: medicine.dosage_form,

    generic: medicine.generic,

    strength: medicine.strength,

    manufacturer: medicine.manufacturer,

    packageContainer: medicine.package_container,

    packageSize: medicine.package_size,

    brandId: medicine.brand_id,
  };
}

export async function apiProducts(): Promise<Product[]> {
  const response = await fetch(
    API_URL + "/medicine/search?limit=100",
  );

  if (!response.ok) {
    throw new Error(
      "Medicine request failed with status " +
        response.status,
    );
  }

  const data: MedicineResponse = await response.json();

  return data.results.map(medicineToProduct);
}

export async function apiSearchMedicines(
  name: string,
): Promise<Product[]> {
  const response = await fetch(
    API_URL +
      "/medicine/search?name=" +
      encodeURIComponent(name) +
      "&limit=100",
  );

  if (!response.ok) {
    throw new Error(
      "Medicine search failed with status " +
        response.status,
    );
  }

  const data: MedicineResponse = await response.json();

  return data.results.map(medicineToProduct);
}

export async function apiPlaceOrder(
  lines: { product: Product; qty: number }[],
): Promise<OrderResult> {
  const total = lines.reduce(
    (sum, line) =>
      sum + line.product.price * line.qty,
    0,
  );

  const items = lines.reduce(
    (sum, line) => sum + line.qty,
    0,
  );

  await new Promise((resolve) =>
    setTimeout(resolve, 800),
  );

  return {
    id:
      "ORD-" +
      Date.now().toString(36).toUpperCase(),

    items,

    total: Math.round(total * 100) / 100,

    currency: "₹",

    eta: "2–5 business days",
  };
}

export async function apiDoctors() {
  const response = await fetch(
    API_URL + "/nearby/doctors",
  );

  if (!response.ok) {
    throw new Error(
      "Doctors request failed with status " +
        response.status,
    );
  }

  return response.json();
}

export async function apiTriggerSos(
  data?: unknown,
) {
  const response = await fetch(
    API_URL + "/sos",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
    },
  );

  if (!response.ok) {
    throw new Error(
      "SOS request failed with status " +
        response.status,
    );
  }

  return response.json();
}

export async function apiNearbyFacilities(
  latitude?: number,
  longitude?: number,
) {
  const params = new URLSearchParams();

  if (latitude !== undefined) {
    params.set(
      "latitude",
      String(latitude),
    );
  }

  if (longitude !== undefined) {
    params.set(
      "longitude",
      String(longitude),
    );
  }

  const query = params.toString();

  const response = await fetch(
    API_URL +
      "/nearby" +
      (query ? "?" + query : ""),
  );

  if (!response.ok) {
    throw new Error(
      "Nearby facilities request failed with status " +
        response.status,
    );
  }

  return response.json();
}

export async function apiExplainRisk(
  data?: unknown,
) {
  const response = await fetch(
    API_URL + "/assistant/explain-risk",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Risk explanation request failed with status " +
        response.status,
    );
  }

  return response.json();
}
