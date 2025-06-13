import { Router } from "express";
import { ThreadsController } from "../controllers/ThreadsController";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

const router = Router();
const threadsController = new ThreadsController();

router.post("/", requireAuth, (req, res) =>
  threadsController.createThread(req as AuthenticatedRequest, res)
);
router.get("/", requireAuth, (req, res) =>
  threadsController.getThreads(req as AuthenticatedRequest, res)
);
router.get("/:threadId", requireAuth, (req, res) =>
  threadsController.getThread(req as AuthenticatedRequest, res)
);
router.get("/:threadId/messages", requireAuth, (req, res) =>
  threadsController.getThreadMessages(req as AuthenticatedRequest, res)
);
router.put("/:threadId", requireAuth, (req, res) =>
  threadsController.updateThread(req as AuthenticatedRequest, res)
);
router.delete("/:threadId", requireAuth, (req, res) =>
  threadsController.deleteThread(req as AuthenticatedRequest, res)
);

export default router;
