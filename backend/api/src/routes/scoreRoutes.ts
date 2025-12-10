// backend/api/src/routes/scoreRoutes.ts

import { Router } from "express";
import { scoreController } from "../controllers/scoreController";

const router = Router();

/* =====================================================
   每个路由直接绑定 controller 的函数
   ===================================================== */

router.post("/score", scoreController.score);
router.post("/analyze", scoreController.analyze);
router.post("/draft", scoreController.draft);
router.post("/sample", scoreController.sample);

export default router;
