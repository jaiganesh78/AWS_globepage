import prisma from "../prisma/index.js";

export class CategoriesService {
  async getAll() {
    return prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
  }

  async getById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
      },
    });
  }
}
export const categoriesService = new CategoriesService();
