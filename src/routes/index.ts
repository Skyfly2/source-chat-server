import { Request, Response, Router } from "express";
import { ApiResponse, HealthHandler, HealthResponse } from "../types";
import chatRoutes from "./chatRoutes";
import threadsRoutes from "./threadsRoutes";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/threads", threadsRoutes);

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
