import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.join(__dirname, "..", "assets", "aws-icons");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "services");
// Category colors for out-of-the-box fallback SVGs
const CATEGORY_COLORS = {
    "compute": "#FF9900", // AWS Orange
    "storage": "#1D8102", // Green
    "database": "#3F8624", // Light Green
    "networking": "#0073BB", // Electric Blue
    "security": "#FF5B5B", // Coral Red
    "analytics": "#A154EB", // Purple
    "machine-learning": "#1A908E", // Teal
    "containers": "#FF9900", // Orange
    "developer-tools": "#3B82F6", // Blue
    "migration": "#2563EB", // Indigo
    "media": "#EF4444", // Red
    "iot": "#059669", // Emerald
    "end-user-computing": "#4B5563", // Gray
    "business-applications": "#0D9488", // Teal
    "management": "#4F46E5", // Indigo
    "integration": "#EC4899", // Pink
    "customer-engagement": "#F59E0B", // Amber
    "blockchain": "#06B6D4", // Cyan
    "quantum": "#8B5CF6", // Violet
    "satellite": "#6366F1", // Indigo
    "frontend-mobile": "#10B981" // Emerald
};
// Category letters/initials for icons
const CATEGORY_INITIALS = {
    "compute": "Cmp", "storage": "Stg", "database": "Db", "networking": "Net",
    "security": "Sec", "analytics": "Anl", "machine-learning": "ML", "containers": "Con",
    "developer-tools": "Dev", "migration": "Mig", "media": "Med", "iot": "IoT",
    "end-user-computing": "Euc", "business-applications": "Biz", "management": "Gov",
    "integration": "Int", "customer-engagement": "Eng", "blockchain": "Blk",
    "quantum": "Qtm", "satellite": "Sat", "frontend-mobile": "Frn"
};
// Dynamic beautiful SVG template builder
function generateDefaultSVG(categorySlug, name) {
    const color = CATEGORY_COLORS[categorySlug] || "#FF9900";
    const initials = CATEGORY_INITIALS[categorySlug] || "AWS";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="15" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="3"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="black" fill="${color}">${initials}</text>
  <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" fill="#4B5563" opacity="0.8">${name.substring(0, 15)}</text>
</svg>`;
}
export async function importAwsIcons(services) {
    console.log("Starting AWS icons mapping process...");
    // Ensure folders exist
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
        console.log(`Created asset directory at: ${ASSETS_DIR}`);
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log(`Created uploads directory at: ${UPLOADS_DIR}`);
    }
    // Scan files in assets directory
    const files = fs.readdirSync(ASSETS_DIR);
    console.log(`Found ${files.length} files in local assets directory.`);
    let matchedCount = 0;
    let fallbackCount = 0;
    for (const service of services) {
        const slug = service.slug;
        const category = service.categorySlug;
        const code = service.serviceCode.toLowerCase();
        const name = service.name;
        // Look for matching files
        let matchedFile = null;
        // Match criteria:
        // 1. Exact match with serviceCode (e.g. ec2.svg, s3.svg)
        // 2. Match with name (e.g. Amazon-EC2.svg, AWS-Lambda.svg)
        // 3. Match with slug (e.g. amazon-ec2.svg)
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (ext !== ".svg" && ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".webp") {
                continue;
            }
            const baseName = path.basename(file, ext).toLowerCase();
            if (baseName === code || baseName === slug || baseName === name.toLowerCase().replace(/\s+/g, "-")) {
                matchedFile = file;
                break;
            }
        }
        const destFile = `${slug}.svg`;
        const destPath = path.join(UPLOADS_DIR, destFile);
        if (matchedFile) {
            // Copy the found file
            const srcPath = path.join(ASSETS_DIR, matchedFile);
            fs.copyFileSync(srcPath, destPath);
            matchedCount++;
        }
        else {
            // Generate fallback category-based SVG
            const fallbackSVG = generateDefaultSVG(category, name);
            fs.writeFileSync(destPath, fallbackSVG);
            fallbackCount++;
        }
    }
    console.log(`Icon mapping completed: Mapped ${matchedCount} custom icons and generated ${fallbackCount} category-based fallbacks.`);
}
// Allow standalone running
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const dummyServices = [
        { serviceCode: "ec2", name: "Amazon EC2", slug: "amazon-ec2", categorySlug: "compute" },
        { serviceCode: "s3", name: "Amazon S3", slug: "amazon-s3", categorySlug: "storage" },
        { serviceCode: "rds", name: "Amazon RDS", slug: "amazon-rds", categorySlug: "database" }
    ];
    importAwsIcons(dummyServices).catch(console.error);
}
