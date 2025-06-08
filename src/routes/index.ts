import { Router } from "express";
import chatRoutes from "./chatRoutes";

const router = Router();

router.use("/chats", chatRoutes);

router.get("/health", (__req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
