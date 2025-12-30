import { Router } from "express";
import {
    loginUser,
    refreshAccessToken,
    logoutUser,
    createAdmin,
    createWarden,
    createStudent,
    forgotPassword,
    changeCurrentPassword,
    createSuperAdmin,
    getAllUsersForAdmin,
    getUserById,
    updateUserByAdmin
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { requireAdmin, requireSuperAdmin } from "../middlewares/authorize.middleware.js";

const adminRouter = Router();

adminRouter.route("/login").post(loginUser);
adminRouter.route("/forgot-password").post(forgotPassword);
adminRouter.route("/create-super-admin").post(createSuperAdmin);

adminRouter.route("/refresh-token").post(refreshAccessToken);
adminRouter.route("/logout").post(verifyJWT, logoutUser);
adminRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

adminRouter.route("/create-admin").post(verifyJWT, requireSuperAdmin, createAdmin);
adminRouter.route("/create-warden").post(verifyJWT, requireAdmin, createWarden);
adminRouter.route("/create-student").post(verifyJWT, requireAdmin, createStudent);
adminRouter.route("/users").get(verifyJWT, requireAdmin, getAllUsersForAdmin);
adminRouter.route("/users/:userId").get(verifyJWT, requireAdmin, getUserById);
adminRouter.route("/users/:userId").patch(verifyJWT, requireAdmin, updateUserByAdmin);

export default adminRouter;