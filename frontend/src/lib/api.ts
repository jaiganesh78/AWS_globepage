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
  flagUrl: string | null;
  displayOrder: number;
  infrastructure: string;
  services: string[];
  benefits: string[];
  aiCapabilities: string[];
  topServices: string[];
  workloads: string[];

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
    flagUrl: r.flagUrl,
    displayOrder: r.displayOrder,
    infrastructure: r.infrastructureDescription,
    services: r.services || [],
    benefits: r.benefits || [],
    aiCapabilities: r.aiCapabilities || [],
    topServices: r.topServices || [],
    workloads: r.workloads || [],
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

export async function fetchCategories(includeInactive = false): Promise<CategoryData[]> {
  const url = includeInactive 
    ? `${API_URL}/api/categories?includeInactive=true`
    : `${API_URL}/api/categories`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  const json = await res.json();
  return json.data;
}

export async function createCategory(data: any): Promise<CategoryData> {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create category");
  }
  const json = await res.json();
  return json.data;
}

export async function updateCategory(id: string, data: any): Promise<CategoryData> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update category");
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete category");
  }
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

export async function uploadFlag(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("flag", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to upload flag asset");
  }
  return res.json();
}
