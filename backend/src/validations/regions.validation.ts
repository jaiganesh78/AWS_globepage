import { Request, Response, NextFunction } from "express";

export function validateRegion(req: Request, res: Response, next: NextFunction) {
  const {
    name,
    latitude,
    longitude,
    categoryId,
    awsRegionCode,
    infrastructureDescription,
    primaryLocation,
    compliance,
    reach,
    latency
  } = req.body;

  const errors: { field: string; message: string }[] = [];

  const isUpdate = req.method === "PUT" || req.method === "PATCH";

  // Required checks
  if (!isUpdate && (name === undefined || name === null || name === "")) {
    errors.push({ field: "name", message: "Region name is required" });
  } else if (name !== undefined && name !== null) {
    if (typeof name !== "string") {
      errors.push({ field: "name", message: "Region name must be a string" });
    } else if (name.length > 80) {
      errors.push({ field: "name", message: "Region name must not exceed 80 characters" });
    }
  }

  if (!isUpdate && (awsRegionCode === undefined || awsRegionCode === null || awsRegionCode === "")) {
    errors.push({ field: "awsRegionCode", message: "AWS Region Code (e.g. us-east-1) is required" });
  } else if (awsRegionCode !== undefined && awsRegionCode !== null) {
    if (typeof awsRegionCode !== "string") {
      errors.push({ field: "awsRegionCode", message: "AWS Region Code must be a string" });
    }
  }

  if (!isUpdate && (latitude === undefined || latitude === null)) {
    errors.push({ field: "latitude", message: "Latitude is required" });
  } else if (latitude !== undefined && latitude !== null) {
    const parsedLat = Number(latitude);
    if (isNaN(parsedLat)) {
      errors.push({ field: "latitude", message: "Latitude must be a number" });
    } else if (parsedLat < -90 || parsedLat > 90) {
      errors.push({ field: "latitude", message: "Latitude must be between -90 and +90 degrees" });
    }
  }

  if (!isUpdate && (longitude === undefined || longitude === null)) {
    errors.push({ field: "longitude", message: "Longitude is required" });
  } else if (longitude !== undefined && longitude !== null) {
    const parsedLng = Number(longitude);
    if (isNaN(parsedLng)) {
      errors.push({ field: "longitude", message: "Longitude must be a number" });
    } else if (parsedLng < -180 || parsedLng > 180) {
      errors.push({ field: "longitude", message: "Longitude must be between -180 and +180 degrees" });
    }
  }

  if (!isUpdate && (categoryId === undefined || categoryId === null || categoryId === "")) {
    errors.push({ field: "categoryId", message: "Category is required" });
  } else if (categoryId !== undefined && categoryId !== null) {
    if (typeof categoryId !== "string") {
      errors.push({ field: "categoryId", message: "Category ID must be a string" });
    }
  }

  // Length checks for optional text fields
  if (infrastructureDescription && typeof infrastructureDescription === "string" && infrastructureDescription.length > 250) {
    errors.push({ field: "infrastructureDescription", message: "Infrastructure description must not exceed 250 characters" });
  }

  if (primaryLocation && typeof primaryLocation === "string" && primaryLocation.length > 80) {
    errors.push({ field: "primaryLocation", message: "Primary location must not exceed 80 characters" });
  }

  if (compliance && typeof compliance === "string" && compliance.length > 120) {
    errors.push({ field: "compliance", message: "Compliance must not exceed 120 characters" });
  }

  if (reach && typeof reach === "string" && reach.length > 120) {
    errors.push({ field: "reach", message: "Reach must not exceed 120 characters" });
  }

  if (latency && typeof latency === "string" && latency.length > 120) {
    errors.push({ field: "latency", message: "Latency must not exceed 120 characters" });
  }

  // Array validations
  if (req.body.services !== undefined && !Array.isArray(req.body.services)) {
    errors.push({ field: "services", message: "Services must be an array of strings" });
  }
  if (req.body.benefits !== undefined && !Array.isArray(req.body.benefits)) {
    errors.push({ field: "benefits", message: "Benefits must be an array of strings" });
  }
  if (req.body.aiCapabilities !== undefined && !Array.isArray(req.body.aiCapabilities)) {
    errors.push({ field: "aiCapabilities", message: "AI Capabilities must be an array of strings" });
  }
  if (req.body.topServices !== undefined && !Array.isArray(req.body.topServices)) {
    errors.push({ field: "topServices", message: "Top Services must be an array of strings" });
  }
  if (req.body.workloads !== undefined && !Array.isArray(req.body.workloads)) {
    errors.push({ field: "workloads", message: "Workloads must be an array of strings" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
}
