import { Request, Response, NextFunction } from "express";

export function validateCategory(req: Request, res: Response, next: NextFunction) {
  const { name, slug, flag, displayOrder, isActive } = req.body;
  const errors: { field: string; message: string }[] = [];
  const isUpdate = req.method === "PUT" || req.method === "PATCH";

  // Required checks for Create
  if (!isUpdate && (name === undefined || name === null || name === "")) {
    errors.push({ field: "name", message: "Category name is required" });
  } else if (name !== undefined && name !== null) {
    if (typeof name !== "string") {
      errors.push({ field: "name", message: "Category name must be a string" });
    } else if (name.trim().length === 0) {
      errors.push({ field: "name", message: "Category name cannot be empty" });
    } else if (name.length > 80) {
      errors.push({ field: "name", message: "Category name must not exceed 80 characters" });
    }
  }

  if (!isUpdate && (slug === undefined || slug === null || slug === "")) {
    errors.push({ field: "slug", message: "Category slug is required" });
  } else if (slug !== undefined && slug !== null) {
    if (typeof slug !== "string") {
      errors.push({ field: "slug", message: "Category slug must be a string" });
    } else if (slug.trim().length === 0) {
      errors.push({ field: "slug", message: "Category slug cannot be empty" });
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push({ field: "slug", message: "Category slug must contain only lowercase letters, numbers, and hyphens" });
    } else if (slug.length > 80) {
      errors.push({ field: "slug", message: "Category slug must not exceed 80 characters" });
    }
  }

  if (!isUpdate && (flag === undefined || flag === null || flag === "")) {
    errors.push({ field: "flag", message: "Category flag (emoji or asset URL) is required" });
  } else if (flag !== undefined && flag !== null) {
    if (typeof flag !== "string") {
      errors.push({ field: "flag", message: "Category flag must be a string" });
    } else if (flag.trim().length === 0) {
      errors.push({ field: "flag", message: "Category flag cannot be empty" });
    }
  }

  if (displayOrder !== undefined && displayOrder !== null) {
    const parsedOrder = Number(displayOrder);
    if (isNaN(parsedOrder)) {
      errors.push({ field: "displayOrder", message: "Display order must be a number" });
    }
  }

  if (isActive !== undefined && isActive !== null) {
    if (typeof isActive !== "boolean") {
      errors.push({ field: "isActive", message: "isActive must be a boolean" });
    }
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
