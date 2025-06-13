import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { requireAuth } from "../middleware/auth";

const router = Router();
const chatController = new ChatController();

router.post(
  "/stream",
  requireAuth,
  chatController.streamChat.bind(chatController)
);

router.get(
  "/models",
  requireAuth,
  chatController.getModels.bind(chatController)
);

router.get(
  "/prompts",
  requireAuth,
  chatController.getSystemPrompts.bind(chatController)
);

export default router;
