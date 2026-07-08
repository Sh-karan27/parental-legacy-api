import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllUsersLegacyStatus,
  getLegacyLensByUserId,
  getMyLegacyLens,
} from "../controllers/legacyLens.controller.js";

const router = Router();

router.route("/me").get(verifyJWT, getMyLegacyLens);
router.route("/users").get(verifyJWT, getAllUsersLegacyStatus);
router.route("/users/:userId").get(verifyJWT, getLegacyLensByUserId);

export default router;
