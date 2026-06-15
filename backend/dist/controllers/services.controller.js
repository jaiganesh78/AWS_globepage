import { ServicesService } from "../services/services.service.js";
export class ServicesController {
    async getAll(req, res) {
        try {
            const search = req.query.search;
            const categoryId = req.query.categoryId;
            const status = req.query.status;
            let isFeatured = undefined;
            if (req.query.isFeatured !== undefined) {
                isFeatured = req.query.isFeatured === "true";
            }
            let isActive = undefined;
            if (req.query.isActive !== undefined) {
                isActive = req.query.isActive === "true";
            }
            const services = await ServicesService.getAll({
                search,
                categoryId,
                isFeatured,
                status,
                isActive,
            });
            return res.status(200).json({
                success: true,
                data: services,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve AWS services",
                errors: [error.message],
            });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const service = await ServicesService.getById(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: `AWS Service with ID ${id} not found`,
                });
            }
            return res.status(200).json({
                success: true,
                data: service,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve AWS service details",
                errors: [error.message],
            });
        }
    }
    async create(req, res) {
        try {
            const created = await ServicesService.create(req.body);
            return res.status(201).json({
                success: true,
                data: created,
            });
        }
        catch (error) {
            const isConflict = error.message.includes("already exists");
            return res.status(isConflict ? 409 : 500).json({
                success: false,
                message: "Failed to create AWS service",
                errors: [error.message],
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await ServicesService.update(id, req.body);
            return res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            const isNotFound = error.message.includes("not found");
            const isConflict = error.message.includes("already exists");
            return res.status(isNotFound ? 404 : (isConflict ? 409 : 500)).json({
                success: false,
                message: "Failed to update AWS service",
                errors: [error.message],
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await ServicesService.delete(id);
            return res.status(200).json({
                success: true,
                message: `AWS Service with ID ${id} archived successfully`,
            });
        }
        catch (error) {
            const isNotFound = error.message.includes("not found");
            return res.status(isNotFound ? 404 : 500).json({
                success: false,
                message: "Failed to delete AWS service",
                errors: [error.message],
            });
        }
    }
    async getCategories(req, res) {
        try {
            const categories = await ServicesService.getCategories();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve AWS service categories",
                errors: [error.message],
            });
        }
    }
    async exportData(req, res) {
        try {
            const format = req.query.format === "csv" ? "csv" : "json";
            const exportedString = await ServicesService.exportData(format);
            if (format === "csv") {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", "attachment; filename=aws-services-export.csv");
            }
            else {
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Content-Disposition", "attachment; filename=aws-services-export.json");
            }
            return res.status(200).send(exportedString);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to export AWS services",
                errors: [error.message],
            });
        }
    }
    async bulkImport(req, res) {
        try {
            const { fileContent, format } = req.body;
            if (!fileContent || !format) {
                return res.status(400).json({
                    success: false,
                    message: "fileContent and format are required",
                });
            }
            if (format !== "csv" && format !== "json") {
                return res.status(400).json({
                    success: false,
                    message: "Format must be either 'csv' or 'json'",
                });
            }
            const result = await ServicesService.bulkImport(fileContent, format);
            return res.status(200).json({
                success: true,
                message: `Successfully processed bulk import. Upserted ${result.count} services.`,
                data: result,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to import AWS services",
                errors: [error.message],
            });
        }
    }
}
export const servicesController = new ServicesController();
