import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

const router = Router();
const chatController = new ChatController();

router.post("/stream", chatController.streamChat.bind(chatController));

export default router;
