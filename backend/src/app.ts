/**
 * AWS Region Intelligence Platform - Express API Server
 * Handles CORS, region/category/service routing, and file uploads.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { regionsController } from "./controllers/regions.controller.js";
import { categoriesController } from "./controllers/categories.controller.js";
import { validateRegion } from "./validations/regions.validation.js";
import { validateCategory } from "./validations/categories.validation.js";
import { servicesController } from "./controllers/services.controller.js";
import { validateService } from "./validations/services.validation.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Ensure upload directory exists
const uploadDir = "uploads/flags";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const serviceUploadDir = "uploads/services";
if (!fs.existsSync(serviceUploadDir)) {
  fs.mkdirSync(serviceUploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, serviceUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only SVG, PNG, JPG, JPEG, and WEBP image files are allowed."));
    }
  },
});

const serviceUpload = multer({
  storage: serviceStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only SVG, PNG, JPG, JPEG, and WEBP image files are allowed."));
    }
  },
});

// CORS configuration
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());

// Expose static uploaded files
app.use("/uploads", express.static("uploads"));

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
  });
});

// 2. Category routes
app.get("/api/categories", categoriesController.getAll);
app.get("/api/categories/:id", categoriesController.getById);
app.post("/api/categories", validateCategory, categoriesController.create);
app.put("/api/categories/:id", validateCategory, categoriesController.update);
app.delete("/api/categories/:id", categoriesController.delete);

// 3. File Upload route
app.post("/api/upload", (req, res) => {
  upload.single("flag")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload file",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    return res.status(200).json({
      success: true,
      url: `/uploads/flags/${req.file.filename}`,
    });
  });
});

// 4. Region routes
app.get("/api/regions", regionsController.getAll);
app.get("/api/regions/:id", regionsController.getById);
app.post("/api/regions", validateRegion, regionsController.create);
app.put("/api/regions/:id", validateRegion, regionsController.update);
app.delete("/api/regions/:id", regionsController.delete);

// 5. AWS Services routes
app.get("/api/services/categories", servicesController.getCategories);
app.get("/api/services/export", servicesController.exportData);
app.post("/api/services/bulk-import", servicesController.bulkImport);
app.post("/api/services/upload", (req, res) => {
  serviceUpload.single("icon")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload file",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    return res.status(200).json({
      success: true,
      url: `/uploads/services/${req.file.filename}`,
    });
  });
});
app.get("/api/services", servicesController.getAll);
app.get("/api/services/:id", servicesController.getById);
app.post("/api/services", validateService, servicesController.create);
app.put("/api/services/:id", validateService, servicesController.update);
app.delete("/api/services/:id", servicesController.delete);

// 4. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred on the server",
    errors: [err.stack || "Internal Server Error"],
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS allowed origin: ${frontendUrl}`);
});

export default app;
