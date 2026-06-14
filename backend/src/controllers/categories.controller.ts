import { Request, Response } from "express";
import { categoriesService } from "../services/categories.service.js";

export class CategoriesController {
  async getAll(req: Request, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await categoriesService.getAll({ includeInactive });
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve categories",
        errors: [error.message],
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await categoriesService.getById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category with ID ${id} not found`,
        });
      }
      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve category",
        errors: [error.message],
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, slug, flag, displayOrder, isActive } = req.body;

      // Duplicate validations
      const existingName = await categoriesService.getByName(name);
      if (existingName) {
        return res.status(409).json({
          success: false,
          message: `Category with name '${name}' already exists`,
          errors: ["name must be unique"],
        });
      }

      const existingSlug = await categoriesService.getBySlug(slug);
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: `Category with slug '${slug}' already exists`,
          errors: ["slug must be unique"],
        });
      }

      const created = await categoriesService.create({ name, slug, flag, displayOrder, isActive });
      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to create category",
        errors: [error.message],
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, flag, displayOrder, isActive } = req.body;

      // Verify category exists
      const existing = await categoriesService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Category with ID ${id} not found`,
        });
      }

      // Check unique name if changing it
      if (name && name !== existing.name) {
        const duplicateName = await categoriesService.getByName(name);
        if (duplicateName) {
          return res.status(409).json({
            success: false,
            message: `Category with name '${name}' already exists`,
            errors: ["name must be unique"],
          });
        }
      }

      // Check unique slug if changing it
      if (slug && slug !== existing.slug) {
        const duplicateSlug = await categoriesService.getBySlug(slug);
        if (duplicateSlug) {
          return res.status(409).json({
            success: false,
            message: `Category with slug '${slug}' already exists`,
            errors: ["slug must be unique"],
          });
        }
      }

      const updated = await categoriesService.update(id, { name, slug, flag, displayOrder, isActive });
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to update category",
        errors: [error.message],
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await categoriesService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Category with ID ${id} not found`,
        });
      }

      await categoriesService.delete(id);
      return res.status(200).json({
        success: true,
        message: `Category with ID ${id} archived successfully`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete category",
        errors: [error.message],
      });
    }
  }
}

export const categoriesController = new CategoriesController();
