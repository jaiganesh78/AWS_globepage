import { categoriesService } from "../services/categories.service.js";
export class CategoriesController {
    async getAll(req, res) {
        try {
            const categories = await categoriesService.getAll();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve categories",
                errors: [error.message],
            });
        }
    }
    async getById(req, res) {
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve category",
                errors: [error.message],
            });
        }
    }
}
export const categoriesController = new CategoriesController();
