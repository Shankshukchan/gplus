import { Router } from "express";
import { createDemoRequest, getAllDemoRequests, markDemoRead, updateDemoCallStatus, deleteDemoRequest } from "../controllers/demoController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", createDemoRequest);
router.get("/", authenticate, getAllDemoRequests);
router.put("/:id/read", authenticate, markDemoRead);
router.put("/:id/call-status", authenticate, updateDemoCallStatus);
router.delete("/:id", authenticate, deleteDemoRequest);

export default router;
