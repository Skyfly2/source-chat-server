import { Request, Response, Router } from "express";
import { ApiResponse, HealthHandler, HealthResponse } from "../types";
import chatRoutes from "./chatRoutes";

const router = Router();

router.use("/chat", chatRoutes);

const healthHandler: HealthHandler = (
  __req: Request<{}, ApiResponse<HealthResponse>, {}, {}>,
  res: Response<ApiResponse<HealthResponse>>
) => {
  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: {
      message: "Server is running",
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

router.get("/health", healthHandler);

export default router;
