const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AWSRegionData {
  id: string; // maps to awsRegionCode for compatibility
  dbId: string; // maps to DB cuid
  name: string;
  code: string;
  lat: number;
  lng: number;
  category: string;
  categoryId: string;
  flag: string;
  infrastructure: string;
  services: string[];
  benefits: string[];

  // Normalized Specification Fields
  availabilityZones: number;
  launchYear: number;
  primaryLocation: string;
  compliance: string;
  totalServices: string;
  aimlServices: string;
  analyticsServices: string;
  networkingServices: string;
  edgeLocations: string;
  directConnect: string;
  reach: string;
  latency: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  flag: string;
  displayOrder: number;
  isActive: boolean;
}

// Map backend response region to frontend AWSRegionData
function mapRegionToFrontend(r: any): AWSRegionData {
  return {
    id: r.awsRegionCode, // e.g. "us-east-1"
    dbId: r.id, // cuid
    name: r.name,
    code: r.regionCode, // "US"
    lat: r.latitude,
    lng: r.longitude,
    category: r.category?.name || "",
    categoryId: r.category?.slug || "",
    flag: r.flag,
    infrastructure: r.infrastructureDescription,
    services: r.services || [],
    benefits: r.benefits || [],
    availabilityZones: r.availabilityZones,
    launchYear: r.launchYear,
    primaryLocation: r.primaryLocation,
    compliance: r.compliance,
    totalServices: r.totalServices,
    aimlServices: r.aimlServices,
    analyticsServices: r.analyticsServices,
    networkingServices: r.networkingServices,
    edgeLocations: r.edgeLocations,
    directConnect: r.directConnect,
    reach: r.reach,
    latency: r.latency,
  };
}

export async function fetchCategories(): Promise<CategoryData[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  const json = await res.json();
  return json.data;
}

export async function fetchRegions(): Promise<AWSRegionData[]> {
  const res = await fetch(`${API_URL}/api/regions`);
  if (!res.ok) {
    throw new Error("Failed to fetch regions");
  }
  const json = await res.json();
  return json.data.map(mapRegionToFrontend);
}

export async function createRegion(data: any): Promise<AWSRegionData> {
  const res = await fetch(`${API_URL}/api/regions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create region");
  }
  const json = await res.json();
  return mapRegionToFrontend(json.data);
}

export async function updateRegion(dbId: string, data: any): Promise<AWSRegionData> {
  const res = await fetch(`${API_URL}/api/regions/${dbId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update region");
  }
  const json = await res.json();
  return mapRegionToFrontend(json.data);
}

export async function deleteRegion(dbId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/regions/${dbId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete region");
  }
}
