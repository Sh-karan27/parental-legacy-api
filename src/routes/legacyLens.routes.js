import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyLegacyLens } from "../controllers/legacyLens.controller.js";

const router = Router();

router.route("/me").get(verifyJWT, getMyLegacyLens);

export default router;
