import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import spotsRouter from "./spots";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(spotsRouter);

export default router;
