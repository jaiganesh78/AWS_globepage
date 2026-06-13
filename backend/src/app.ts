import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { regionsController } from "./controllers/regions.controller.js";
import { categoriesController } from "./controllers/categories.controller.js";
import { validateRegion } from "./validations/regions.validation.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());

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

// 3. Region routes
app.get("/api/regions", regionsController.getAll);
app.get("/api/regions/:id", regionsController.getById);
app.post("/api/regions", validateRegion, regionsController.create);
app.put("/api/regions/:id", validateRegion, regionsController.update);
app.delete("/api/regions/:id", regionsController.delete);

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
