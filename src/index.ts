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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
