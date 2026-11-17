import express from "express";
import { createSession, getAvailableSessions, bookSession, completeSession } from "../controllers/sessionController.js";
const router = express.Router();
router.post("/", createSession);
router.get("/available", getAvailableSessions);
router.post("/:id/book", bookSession);
router.patch("/:id/complete", completeSession);
export default router;
