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

// ==========================================
// AWS SERVICES CATALOG TYPES AND API METHODS
// ==========================================

export interface AWSServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  displayOrder: number;
}

export interface AWSServiceSummary {
  id: string;
  serviceCode: string;
  name: string;
  slug: string;
  categoryId: string;
  iconUrl: string;
  shortDescription: string;
  isFeatured: boolean;
  status: string; // "GA" | "Preview" | "Beta" | "Deprecated" | "Retired"
  displayOrder: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AWSServiceDetails extends AWSServiceSummary {
  fullDescription: string;
  characteristics: string[];
  features: string[];
  useCases: string[];
  pricingModels: string[];
  relatedServices: { name: string; slug: string }[];
  keywords: string[];
  awsDocumentationUrl: string | null;
  comparisonTags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchServiceCategories(): Promise<AWSServiceCategory[]> {
  const res = await fetch(`${API_URL}/api/services/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch service categories");
  }
  const json = await res.json();
  return json.data;
}

export async function fetchServices(filters: {
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  status?: string;
  isActive?: boolean;
} = {}): Promise<AWSServiceSummary[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.isFeatured !== undefined) params.append("isFeatured", String(filters.isFeatured));
  if (filters.status) params.append("status", filters.status);
  if (filters.isActive !== undefined) params.append("isActive", String(filters.isActive));

  const url = `${API_URL}/api/services?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch AWS services");
  }
  const json = await res.json();
  return json.data;
}

export async function fetchServiceDetails(id: string): Promise<AWSServiceDetails> {
  const res = await fetch(`${API_URL}/api/services/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch details for service ${id}`);
  }
  const json = await res.json();
  return json.data;
}

export async function createService(data: any): Promise<AWSServiceDetails> {
  const res = await fetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create AWS service");
  }
  const json = await res.json();
  return json.data;
}

export async function updateService(id: string, data: any): Promise<AWSServiceDetails> {
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update AWS service");
  }
  const json = await res.json();
  return json.data;
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete AWS service");
  }
}

export async function uploadServiceIcon(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("icon", file);

  const res = await fetch(`${API_URL}/api/services/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to upload service icon");
  }
  return res.json();
}

export async function exportServices(format: "json" | "csv"): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/services/export?format=${format}`);
  if (!res.ok) {
    throw new Error(`Failed to export services in ${format} format`);
  }
  return res.blob();
}

export async function importServices(fileContent: string, format: "json" | "csv"): Promise<{ success: boolean; count: number }> {
  const res = await fetch(`${API_URL}/api/services/bulk-import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileContent, format }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to import services");
  }
  return res.json();
}

