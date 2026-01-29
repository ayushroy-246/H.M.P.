import { Router } from "express";
import { getUniversalComplainStats } from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

const complaintRouter = Router();

complaintRouter.route("/stats").get(getUniversalComplainStats);
complaintRouter.route("/warden-stats").get(verifyJWT, getUniversalComplainStats);

export default complaintRouter;