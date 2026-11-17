import express from "express";
import { createTeacher } from "../controllers/teacherController.js";

const router = express.Router();

router.post("/", createTeacher);

export default router;