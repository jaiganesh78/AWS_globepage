import { Request, Response } from "express";
import { regionsService } from "../services/regions.service.js";

export class RegionsController {
  async getAll(req: Request, res: Response) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const regions = await regionsService.getAll({ search, page, limit });

      return res.status(200).json({
        success: true,
        data: regions,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve regions",
        errors: [error.message],
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const region = await regionsService.getById(id);

      if (!region) {
        return res.status(404).json({
          success: false,
          message: `Region with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve region",
        errors: [error.message],
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { awsRegionCode } = req.body;

      // Check duplicate AWS region code
      const existing = await regionsService.getByAwsRegionCode(awsRegionCode);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Region with AWS code '${awsRegionCode}' already exists`,
          errors: ["awsRegionCode must be unique"],
        });
      }

      const created = await regionsService.create(req.body);

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to create region",
        errors: [error.message],
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { awsRegionCode } = req.body;

      // Verify exists
      const region = await regionsService.getById(id);
      if (!region) {
        return res.status(404).json({
          success: false,
          message: `Region with ID ${id} not found`,
        });
      }

      // Check duplicate AWS region code if changing it
      if (awsRegionCode && awsRegionCode !== region.awsRegionCode) {
        const existing = await regionsService.getByAwsRegionCode(awsRegionCode);
        if (existing) {
          return res.status(409).json({
            success: false,
            message: `Region with AWS code '${awsRegionCode}' already exists`,
            errors: ["awsRegionCode must be unique"],
          });
        }
      }

      const updated = await regionsService.update(id, req.body);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to update region",
        errors: [error.message],
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify exists
      const region = await regionsService.getById(id);
      if (!region) {
        return res.status(404).json({
          success: false,
          message: `Region with ID ${id} not found`,
        });
      }

      await regionsService.delete(id);

      return res.status(200).json({
        success: true,
        message: `Region with ID ${id} soft-deleted successfully`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete region",
        errors: [error.message],
      });
    }
  }
}

export const regionsController = new RegionsController();
