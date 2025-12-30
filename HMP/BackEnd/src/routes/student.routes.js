import { Router } from "express";
import {
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    changeCurrentPassword
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { requireStudent } from "../middlewares/authorize.middleware.js";

const studentRouter = Router();

studentRouter.route("/login").post(loginUser);
studentRouter.route("/forgot-password").post(forgotPassword);

studentRouter.route("/refresh-token").post(refreshAccessToken);
studentRouter.route("/logout").post(verifyJWT, logoutUser);
studentRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Student specific routes (add more as needed)
// Example: router.route("/profile").get(verifyJWT, requireStudent, getStudentProfile);

export default studentRouter;