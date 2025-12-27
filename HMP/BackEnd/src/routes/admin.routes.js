import { Router } from "express";
import { createSuperAdmin } from "../controllers/user.controller.js";

const adminRouter = Router();

adminRouter.post("/create-superadmin", createSuperAdmin);

export default adminRouter;
