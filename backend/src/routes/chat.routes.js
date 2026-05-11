import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

import {
  getChatChannelsController,
  getChatMessagesController,
  sendChatMessageController,
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/channels", requireAuth, getChatChannelsController);
router.get("/:channel/messages", requireAuth, getChatMessagesController);
router.post("/:channel/messages", requireAuth, sendChatMessageController);

export default router;