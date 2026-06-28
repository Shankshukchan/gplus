import { Router } from "express";
import { createContact, getAllContacts, getContact, markContactRead, deleteContact } from "../controllers/contactController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", createContact);
router.get("/", authenticate, getAllContacts);
router.get("/:id", authenticate, getContact);
router.put("/:id/read", authenticate, markContactRead);
router.delete("/:id", authenticate, deleteContact);

export default router;
