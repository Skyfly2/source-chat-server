import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

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
  return controller.streamChat(req as AuthenticatedRequest, res);
});

router.get("/models/important", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.getImportantModels(req as AuthenticatedRequest, res);
});

router.get("/models/all", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.getAllModels(req as AuthenticatedRequest, res);
});

router.get("/prompts", requireAuth, async (req, res) => {
  const controller = getChatController();
  return controller.getSystemPrompts(req as AuthenticatedRequest, res);
});

export default router;
