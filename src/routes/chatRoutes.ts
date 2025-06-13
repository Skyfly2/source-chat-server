import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { requireAuth } from "../middleware/auth";

const router = Router();

let chatController: ChatController | null = null;
const getChatController = () => {
  if (!chatController) {
    chatController = new ChatController();
  }
  return chatController;
};

router.post("/stream", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.streamChat(req as any, res);
});

router.get("/models", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.getModels(req as any, res);
});

router.get("/prompts", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.getSystemPrompts(req as any, res);
});

export default router;
