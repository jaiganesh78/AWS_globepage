export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  flag: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegionResponse {
  id: string;
  awsRegionCode: string;
  name: string;
  regionCode: string;
  flag: string;
  flagUrl: string | null;
  displayOrder: number;
  latitude: number;
  longitude: number;
  categoryId: string;
  category?: CategoryResponse;
  infrastructureDescription: string;
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
  services: string[];
  benefits: string[];
  aiCapabilities: string[];
  topServices: string[];
  workloads: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegionRequest {
  awsRegionCode: string;
  name: string;
  regionCode: string;
  flag: string;
  flagUrl?: string | null;
  displayOrder?: number;
  latitude: number;
  longitude: number;
  categoryId: string;
  infrastructureDescription?: string;
  availabilityZones?: number;
  launchYear?: number;
  primaryLocation?: string;
  compliance?: string;
  totalServices?: string;
  aimlServices?: string;
  analyticsServices?: string;
  networkingServices?: string;
  edgeLocations?: string;
  directConnect?: string;
  reach?: string;
  latency?: string;
  services?: string[];
  benefits?: string[];
  aiCapabilities?: string[];
  topServices?: string[];
  workloads?: string[];
}

export interface UpdateRegionRequest {
  awsRegionCode?: string;
  name?: string;
  regionCode?: string;
  flag?: string;
  flagUrl?: string | null;
  displayOrder?: number;
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  infrastructureDescription?: string;
  availabilityZones?: number;
  launchYear?: number;
  primaryLocation?: string;
  compliance?: string;
  totalServices?: string;
  aimlServices?: string;
  analyticsServices?: string;
  networkingServices?: string;
  edgeLocations?: string;
  directConnect?: string;
  reach?: string;
  latency?: string;
  services?: string[];
  benefits?: string[];
  aiCapabilities?: string[];
  topServices?: string[];
  workloads?: string[];
}

