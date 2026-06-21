import { Router, type IRouter } from "express";
import healthRouter from "./health";
import beastsRouter from "./beasts";
import speciesRouter from "./species";
import mapsRouter from "./maps";
import breedingRouter from "./breeding";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(beastsRouter);
router.use(speciesRouter);
router.use(mapsRouter);
router.use(breedingRouter);
router.use(statsRouter);

export default router;
