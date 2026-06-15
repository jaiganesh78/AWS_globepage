import prisma from "../prisma/index.js";
export class ServicesService {
    /**
     * Returns a lightweight projection of all services matching optional filters.
     * Large arrays/details are omitted to optimize bandwidth.
     */
    static async getAll(filters = {}) {
        const where = {
            isDeleted: false,
        };
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters.isFeatured !== undefined) {
            where.isFeatured = filters.isFeatured;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { serviceCode: { contains: filters.search, mode: "insensitive" } },
                { shortDescription: { contains: filters.search, mode: "insensitive" } },
                { keywords: { has: searchLower } },
                { category: { name: { contains: filters.search, mode: "insensitive" } } },
            ];
        }
        return prisma.aWSService.findMany({
            where,
            select: {
                id: true,
                serviceCode: true,
                name: true,
                slug: true,
                categoryId: true,
                iconUrl: true,
                shortDescription: true,
                isFeatured: true,
                status: true,
                displayOrder: true,
                isActive: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: [
                { displayOrder: "asc" },
                { name: "asc" },
            ],
        });
    }
    /**
     * Returns a single service by ID, including full details.
     */
    static async getById(id) {
        return prisma.aWSService.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
    }
    /**
     * Creates a new service.
     */
    static async create(data) {
        const { categorySlug, ...rest } = data;
        // Check slug or serviceCode or name conflict
        const conflict = await prisma.aWSService.findFirst({
            where: {
                OR: [
                    { serviceCode: data.serviceCode },
                    { name: data.name },
                    { slug: data.slug },
                ],
                isDeleted: false,
            },
        });
        if (conflict) {
            throw new Error("A service with the same serviceCode, name, or slug already exists.");
        }
        return prisma.aWSService.create({
            data: {
                ...rest,
                relatedServices: rest.relatedServices || [],
            },
        });
    }
    /**
     * Updates an existing service.
     */
    static async update(id, data) {
        const service = await prisma.aWSService.findFirst({
            where: { id, isDeleted: false },
        });
        if (!service) {
            throw new Error("Service not found");
        }
        // Check conflicts
        const conflict = await prisma.aWSService.findFirst({
            where: {
                id: { not: id },
                OR: [
                    { serviceCode: data.serviceCode },
                    { name: data.name },
                    { slug: data.slug },
                ],
                isDeleted: false,
            },
        });
        if (conflict) {
            throw new Error("A service with the same serviceCode, name, or slug already exists.");
        }
        return prisma.aWSService.update({
            where: { id },
            data: {
                ...data,
                relatedServices: data.relatedServices || [],
            },
        });
    }
    /**
     * Soft deletes a service.
     */
    static async delete(id) {
        const service = await prisma.aWSService.findFirst({
            where: { id, isDeleted: false },
        });
        if (!service) {
            throw new Error("Service not found");
        }
        return prisma.aWSService.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    /**
     * Fetch all service categories for admin panel selects.
     */
    static async getCategories() {
        return prisma.aWSServiceCategory.findMany({
            where: { isDeleted: false },
            orderBy: { displayOrder: "asc" },
        });
    }
    /**
     * Exports the entire active services database in JSON or CSV.
     */
    static async exportData(format) {
        const services = await prisma.aWSService.findMany({
            where: { isDeleted: false },
            include: {
                category: {
                    select: {
                        slug: true,
                        name: true,
                    },
                },
            },
            orderBy: { displayOrder: "asc" },
        });
        if (format === "json") {
            return JSON.stringify(services, null, 2);
        }
        // Generate CSV
        const headers = [
            "serviceCode",
            "name",
            "slug",
            "categorySlug",
            "shortDescription",
            "fullDescription",
            "characteristics",
            "features",
            "useCases",
            "pricingModels",
            "relatedServices",
            "iconUrl",
            "keywords",
            "awsDocumentationUrl",
            "isFeatured",
            "status",
            "comparisonTags",
            "displayOrder",
            "isActive"
        ];
        const escapeCsv = (str) => {
            if (str === null || str === undefined)
                return "";
            let val = "";
            if (Array.isArray(str)) {
                val = str.join(";");
            }
            else if (typeof str === "object") {
                val = JSON.stringify(str);
            }
            else {
                val = String(str);
            }
            // Replace double quotes with two double quotes
            const escaped = val.replace(/"/g, '""');
            return `"${escaped}"`;
        };
        const rows = [headers.join(",")];
        for (const s of services) {
            const row = [
                escapeCsv(s.serviceCode),
                escapeCsv(s.name),
                escapeCsv(s.slug),
                escapeCsv(s.category?.slug || ""),
                escapeCsv(s.shortDescription),
                escapeCsv(s.fullDescription),
                escapeCsv(s.characteristics),
                escapeCsv(s.features),
                escapeCsv(s.useCases),
                escapeCsv(s.pricingModels),
                escapeCsv(s.relatedServices),
                escapeCsv(s.iconUrl),
                escapeCsv(s.keywords),
                escapeCsv(s.awsDocumentationUrl),
                escapeCsv(s.isFeatured),
                escapeCsv(s.status),
                escapeCsv(s.comparisonTags),
                escapeCsv(s.displayOrder),
                escapeCsv(s.isActive)
            ];
            rows.push(row.join(","));
        }
        return rows.join("\n");
    }
    /**
     * Bulk imports services from JSON or CSV text, executing upserts based on serviceCode.
     */
    static async bulkImport(fileContent, format) {
        let rawServices = [];
        if (format === "json") {
            try {
                rawServices = JSON.parse(fileContent);
                if (!Array.isArray(rawServices)) {
                    throw new Error("JSON root must be an array of service objects.");
                }
            }
            catch (err) {
                throw new Error(`Invalid JSON format: ${err.message}`);
            }
        }
        else {
            // Parse CSV
            const parsedRows = parseCSV(fileContent);
            if (parsedRows.length < 2) {
                throw new Error("CSV must contain at least headers and one row of data.");
            }
            const headers = parsedRows[0].map(h => h.trim());
            // Map rows to service objects
            for (let i = 1; i < parsedRows.length; i++) {
                const row = parsedRows[i];
                if (row.length === 0)
                    continue;
                const serviceObj = {};
                for (let j = 0; j < headers.length; j++) {
                    const header = headers[j];
                    const val = row[j] ? row[j].trim() : "";
                    if (!header)
                        continue;
                    // Parse arrays (split by semicolon)
                    const arrayFields = ["characteristics", "features", "useCases", "pricingModels", "keywords", "comparisonTags"];
                    if (arrayFields.includes(header)) {
                        serviceObj[header] = val ? val.split(";").map(x => x.trim()).filter(Boolean) : [];
                    }
                    else if (header === "relatedServices") {
                        try {
                            serviceObj[header] = val ? JSON.parse(val) : [];
                        }
                        catch {
                            // Semicolon formatted fallback like: Amazon S3:amazon-s3;Amazon EC2:amazon-ec2
                            const items = val.split(";").map(x => x.trim()).filter(Boolean);
                            serviceObj[header] = items.map(item => {
                                const parts = item.split(":");
                                const name = parts[0] || "";
                                const slug = parts[1] || name.toLowerCase().replace(/\s+/g, "-");
                                return { name, slug };
                            });
                        }
                    }
                    else if (header === "isFeatured" || header === "isActive") {
                        serviceObj[header] = val.toLowerCase() === "true" || val === "1";
                    }
                    else if (header === "displayOrder") {
                        serviceObj[header] = val ? Number(val) : 0;
                    }
                    else {
                        serviceObj[header] = val;
                    }
                }
                if (serviceObj.serviceCode) {
                    rawServices.push(serviceObj);
                }
            }
        }
        // Fetch all categories for mapping slug -> id
        const categories = await prisma.aWSServiceCategory.findMany({ where: { isDeleted: false } });
        const categoriesMap = new Map(categories.map(c => [c.slug, c.id]));
        const defaultCategoryId = categories[0]?.id || "";
        let importedCount = 0;
        for (const service of rawServices) {
            if (!service.serviceCode || !service.name || !service.slug) {
                console.warn(`Skipping import row due to missing serviceCode, name or slug.`, service);
                continue;
            }
            // Map categorySlug to categoryId
            let categoryId = service.categoryId;
            if (!categoryId && service.categorySlug) {
                categoryId = categoriesMap.get(service.categorySlug);
            }
            if (!categoryId) {
                categoryId = defaultCategoryId;
            }
            const dbData = {
                name: service.name,
                slug: service.slug,
                categoryId: categoryId,
                shortDescription: service.shortDescription || "No short description provided.",
                fullDescription: service.fullDescription || "No full description provided.",
                characteristics: service.characteristics || [],
                features: service.features || [],
                useCases: service.useCases || [],
                pricingModels: service.pricingModels || [],
                relatedServices: service.relatedServices || [],
                iconUrl: service.iconUrl || `/uploads/services/${service.slug}.svg`,
                keywords: service.keywords || [],
                awsDocumentationUrl: service.awsDocumentationUrl || "",
                isFeatured: service.isFeatured ?? false,
                status: service.status || "GA",
                comparisonTags: service.comparisonTags || [],
                displayOrder: service.displayOrder ?? 0,
                isActive: service.isActive ?? true,
                isDeleted: false,
            };
            // Perform Upsert based on serviceCode
            await prisma.aWSService.upsert({
                where: { serviceCode: service.serviceCode },
                update: dbData,
                create: {
                    serviceCode: service.serviceCode,
                    ...dbData
                }
            });
            importedCount++;
        }
        return { success: true, count: importedCount };
    }
}
// Quote-aware CSV parser
function parseCSV(text) {
    const result = [];
    let row = [];
    let inQuotes = false;
    let entry = "";
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i + 1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                entry += '"';
                i++; // skip next quote
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (c === ',' && !inQuotes) {
            row.push(entry);
            entry = "";
        }
        else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') {
                i++;
            }
            row.push(entry);
            result.push(row);
            row = [];
            entry = "";
        }
        else {
            entry += c;
        }
    }
    if (row.length > 0 || entry !== "") {
        row.push(entry);
        result.push(row);
    }
    return result.filter(r => r.length > 0 && r.some(cell => cell.trim() !== ""));
}
