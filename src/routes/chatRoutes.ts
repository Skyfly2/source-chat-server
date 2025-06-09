import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

const router = Router();
const chatController = new ChatController();

router.post("/stream", chatController.streamChat.bind(chatController));
router.post(
  "/completions",
  chatController.createCompletion.bind(chatController)
);
router.get("/models", chatController.getModels.bind(chatController));
router.get("/prompts", chatController.getSystemPrompts.bind(chatController));

export default router;
