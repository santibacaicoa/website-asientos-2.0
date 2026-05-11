import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

import {
  assignMySupervisorController,
  getSupervisorsController,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/supervisors", requireAuth, getSupervisorsController);
router.put("/me/supervisor", requireAuth, assignMySupervisorController);

export default router;