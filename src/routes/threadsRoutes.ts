import { Router } from "express";
import { ThreadsController } from "../controllers/ThreadsController";

const router = Router();
const threadsController = new ThreadsController();

router.post("/", threadsController.createThread.bind(threadsController));
router.get("/", threadsController.getThreads.bind(threadsController));
router.get("/:threadId", threadsController.getThread.bind(threadsController));
router.get(
  "/:threadId/messages",
  threadsController.getThreadMessages.bind(threadsController)
);
router.put(
  "/:threadId",
  threadsController.updateThread.bind(threadsController)
);
router.delete(
  "/:threadId",
  threadsController.deleteThread.bind(threadsController)
);

export default router;
