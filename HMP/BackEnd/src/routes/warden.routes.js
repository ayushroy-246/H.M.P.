import { Router } from "express";
import {
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    changeCurrentPassword,
    getStudentsForWarden,
    getUserById
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { requireWarden } from "../middlewares/authorize.middleware.js";

const wardenRouter = Router();

wardenRouter.route("/login").post(loginUser);
wardenRouter.route("/forgot-password").post(forgotPassword);

wardenRouter.route("/refresh-token").post(refreshAccessToken);
wardenRouter.route("/logout").post(verifyJWT, logoutUser);
wardenRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

wardenRouter.route("/students").get(verifyJWT, requireWarden, getStudentsForWarden);
wardenRouter.route("/students/:userId").get(verifyJWT, requireWarden, getUserById);

export default wardenRouter;