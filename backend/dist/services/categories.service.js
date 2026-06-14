import prisma from "../prisma/index.js";
export class CategoriesService {
    async getAll(options = {}) {
        const where = {
            isDeleted: false,
        };
        if (!options.includeInactive) {
            where.isActive = true;
        }
        return prisma.category.findMany({
            where,
            orderBy: {
                displayOrder: "asc",
            },
        });
    }
    async getById(id) {
        const category = await prisma.category.findUnique({
            where: {
                id,
            },
        });
        if (!category || category.isDeleted)
            return null;
        return category;
    }
    async getByName(name) {
        const category = await prisma.category.findUnique({
            where: {
                name,
            },
        });
        if (!category || category.isDeleted)
            return null;
        return category;
    }
    async getBySlug(slug) {
        const category = await prisma.category.findUnique({
            where: {
                slug,
            },
        });
        if (!category || category.isDeleted)
            return null;
        return category;
    }
    async create(data) {
        return prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                flag: data.flag,
                displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            },
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.flag !== undefined)
            updateData.flag = data.flag;
        if (data.displayOrder !== undefined)
            updateData.displayOrder = Number(data.displayOrder);
        if (data.isActive !== undefined)
            updateData.isActive = Boolean(data.isActive);
        return prisma.category.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        return prisma.category.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
    }
}
export const categoriesService = new CategoriesService();
