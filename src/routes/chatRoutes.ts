import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

const router = Router();
const chatController = new ChatController();

router.get("/", chatController.getData);

export default router;
