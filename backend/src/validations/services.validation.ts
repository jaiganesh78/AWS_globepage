import { Request, Response, NextFunction } from "express";

export function validateService(req: Request, res: Response, next: NextFunction) {
  const {
    serviceCode,
    name,
    slug,
    categoryId,
    shortDescription,
    fullDescription,
    characteristics,
    features,
    useCases,
    pricingModels,
    relatedServices,
    iconUrl,
    keywords,
    awsDocumentationUrl,
    isFeatured,
    status,
    comparisonTags,
    displayOrder,
    isActive
  } = req.body;

  const errors: { field: string; message: string }[] = [];
  const isUpdate = req.method === "PUT" || req.method === "PATCH";

  // Check required string fields for Create
  if (!isUpdate && (!serviceCode || serviceCode.trim().length === 0)) {
    errors.push({ field: "serviceCode", message: "Service code is required" });
  } else if (serviceCode !== undefined && serviceCode !== null) {
    if (typeof serviceCode !== "string") {
      errors.push({ field: "serviceCode", message: "Service code must be a string" });
    } else if (serviceCode.trim().length === 0) {
      errors.push({ field: "serviceCode", message: "Service code cannot be empty" });
    }
  }

  if (!isUpdate && (!name || name.trim().length === 0)) {
    errors.push({ field: "name", message: "Service name is required" });
  } else if (name !== undefined && name !== null) {
    if (typeof name !== "string") {
      errors.push({ field: "name", message: "Service name must be a string" });
    } else if (name.trim().length === 0) {
      errors.push({ field: "name", message: "Service name cannot be empty" });
    }
  }

  if (!isUpdate && (!slug || slug.trim().length === 0)) {
    errors.push({ field: "slug", message: "Service slug is required" });
  } else if (slug !== undefined && slug !== null) {
    if (typeof slug !== "string") {
      errors.push({ field: "slug", message: "Service slug must be a string" });
    } else if (slug.trim().length === 0) {
      errors.push({ field: "slug", message: "Service slug cannot be empty" });
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push({ field: "slug", message: "Service slug must be lowercase alphanumeric and hyphens only" });
    }
  }

  if (!isUpdate && (!categoryId || categoryId.trim().length === 0)) {
    errors.push({ field: "categoryId", message: "Category ID is required" });
  } else if (categoryId !== undefined && categoryId !== null) {
    if (typeof categoryId !== "string") {
      errors.push({ field: "categoryId", message: "Category ID must be a string" });
    }
  }

  if (!isUpdate && (!shortDescription || shortDescription.trim().length === 0)) {
    errors.push({ field: "shortDescription", message: "Short description is required" });
  } else if (shortDescription !== undefined && shortDescription !== null) {
    if (typeof shortDescription !== "string") {
      errors.push({ field: "shortDescription", message: "Short description must be a string" });
    } else if (shortDescription.trim().length === 0) {
      errors.push({ field: "shortDescription", message: "Short description cannot be empty" });
    }
  }

  if (!isUpdate && (!fullDescription || fullDescription.trim().length === 0)) {
    errors.push({ field: "fullDescription", message: "Full description is required" });
  } else if (fullDescription !== undefined && fullDescription !== null) {
    if (typeof fullDescription !== "string") {
      errors.push({ field: "fullDescription", message: "Full description must be a string" });
    } else if (fullDescription.trim().length === 0) {
      errors.push({ field: "fullDescription", message: "Full description cannot be empty" });
    }
  }

  // Check array fields if provided
  const arrayFields = ["characteristics", "features", "useCases", "pricingModels", "keywords", "comparisonTags"];
  for (const field of arrayFields) {
    const value = req.body[field];
    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        errors.push({ field, message: `${field} must be an array of strings` });
      } else {
        const nonStrings = value.filter(item => typeof item !== "string");
        if (nonStrings.length > 0) {
          errors.push({ field, message: `All items in ${field} must be strings` });
        }
      }
    }
  }

  // Check relatedServices (JSON)
  if (relatedServices !== undefined && relatedServices !== null) {
    if (!Array.isArray(relatedServices)) {
      errors.push({ field: "relatedServices", message: "Related services must be an array of objects" });
    } else {
      const invalid = relatedServices.filter(item => typeof item !== "object" || !item.name || !item.slug);
      if (invalid.length > 0) {
        errors.push({ field: "relatedServices", message: "All related services must have a name and a slug" });
      }
    }
  }

  // Check status value
  if (status !== undefined && status !== null) {
    const validStatuses = ["GA", "Preview", "Beta", "Deprecated", "Retired"];
    if (!validStatuses.includes(status)) {
      errors.push({ field: "status", message: `Status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  // Check types for other fields
  if (displayOrder !== undefined && displayOrder !== null) {
    if (isNaN(Number(displayOrder))) {
      errors.push({ field: "displayOrder", message: "Display order must be a number" });
    }
  }

  if (isFeatured !== undefined && isFeatured !== null) {
    if (typeof isFeatured !== "boolean") {
      errors.push({ field: "isFeatured", message: "isFeatured must be a boolean" });
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
