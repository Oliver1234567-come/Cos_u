// backend/api/src/routes/score.ts
import { Router } from "express";
import multer from "multer";
import { scoreController } from "../controllers/scoreController";

const router = Router();

// Handle audio upload
const upload = multer({ dest: "uploads/" });

router.post("/audio", upload.single("audio"), scoreController.score);

export default router;
