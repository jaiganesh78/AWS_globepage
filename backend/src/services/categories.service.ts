import prisma from "../prisma/index.js";

export class CategoriesService {
  async getAll(options: { includeInactive?: boolean } = {}) {
    const where: any = {
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

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!category || category.isDeleted) return null;
    return category;
  }

  async getByName(name: string) {
    const category = await prisma.category.findUnique({
      where: {
        name,
      },
    });
    if (!category || category.isDeleted) return null;
    return category;
  }

  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
    });
    if (!category || category.isDeleted) return null;
    return category;
  }

  async create(data: { name: string; slug: string; flag: string; displayOrder?: number; isActive?: boolean }) {
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

  async update(id: string, data: { name?: string; slug?: string; flag?: string; displayOrder?: number; isActive?: boolean }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.flag !== undefined) updateData.flag = data.flag;
    if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.category.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
export const categoriesService = new CategoriesService();
