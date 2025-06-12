import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  getEnvironmentConfig,
  validateEnvironment,
} from "./config/environment";
import routes from "./routes";

dotenv.config();
validateEnvironment();

const app = express();
const config = getEnvironmentConfig();
const PORT = config.port;

// CORS configuration - restrict origins in production
const corsOptions = {
  origin:
    config.nodeEnv === "production"
      ? [] // Replace with your actual domains
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
        ], // Development origins
  credentials: true, // Allow cookies/auth headers
  exposedHeaders: ["X-Thread-Id"], // Only expose necessary headers
  allowedHeaders: ["Content-Type", "Authorization"], // Restrict allowed request headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Explicit method restrictions
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
