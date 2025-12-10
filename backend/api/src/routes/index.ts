// src/routes/index.ts

import { Router } from "express";
import answerEnhancerRouter from "./answerEnhancer.routes";

const router = Router();

// 其它已有路由...
// router.use("/score", scoreRouter);

router.use("/answer_enhancer", answerEnhancerRouter);

export default router;
