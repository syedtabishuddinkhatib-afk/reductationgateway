import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import dataRouter from "./data";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(dataRouter);

export default router;
