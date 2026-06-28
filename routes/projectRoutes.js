import { Router } from "express";
import { getAllProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getAllProjects);
router.get("/:id", getProject);
router.post("/", authenticate, upload.single("image"), createProject);
router.put("/:id", authenticate, upload.single("image"), updateProject);
router.delete("/:id", authenticate, deleteProject);

export default router;
