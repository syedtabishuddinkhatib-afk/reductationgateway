import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import dataRouter from "./data";
import siteContentRouter from "./siteContent";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(dataRouter);
router.use(siteContentRouter);
router.use(adminRouter);

export default router;
