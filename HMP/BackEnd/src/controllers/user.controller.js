import { AsyncHandler } from "../utilities/AsyncHandler.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID)

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            "Failed to generate access and refresh tokens",
            [],
            error.stack
        )
    }
}


const loginUser = AsyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        throw new ApiError(400, "Both Username and Password are required.")
    }

    const user = await User.findOne({ username })

    if (!user) {
        throw new ApiError(404, "User dosen't exist.")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password! Try Again.")
    }
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                },
                `${loggedInUser.role} log in Successfully`
            )
        )
})

const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Access Token Refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken: null
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            null,
            `${req.user.role} logged out successfully`
        )
    )
})

const createAdmin = AsyncHandler(async (req, res) => {
    if (req.user.role !== "superAdmin") {
        throw new ApiError(403, "Only super admin can create admin")
    }

    const { username, fullName, email, password } = req.body

    if (!username || !fullName || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        throw new ApiError(409, "Admin already exists")
    }

    const admin = await User.create({
        username,
        fullName,
        email,
        password,
        role: "admin"
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                id: admin._id,
                username: admin.username
            },
            "Admin created successfully"
        )
    )
})

const createUser = AsyncHandler(async (req, res) => {
    if (!["admin", "superAdmin"].includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized")
    }

    const {
        username,
        fullName,
        email,
        password,
        role,
        hostel
    } = req.body

    if (!["student", "warden"].includes(role)) {
        throw new ApiError(400, "Invalid role")
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        role,
        hostel
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            "User created successfully"
        )
    )
})

const forgotPassword = AsyncHandler(async (req, res) => {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ username, email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    return res.json(
        new ApiResponse(200, null, "Password reset successful")
    );
});

const updateUserBySuperAdmin = AsyncHandler(async (req, res) => {
    const { username, email } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Nothing to update");
    }

    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { username, email },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.json(
        new ApiResponse(200, user, "User updated successfully")
    );
});

const changeCurrentPassword = AsyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

const createSuperAdmin = AsyncHandler(async (req, res) => {

    if (process.env.ALLOW_SUPER_ADMIN_CREATION !== "true") {
        throw new ApiError(403, "Super Admin creation is disabled");
    }
    
    const { username, email, password, fullName } = req.body;

    
    if (!username || !email || !password || !fullName) {
        throw new ApiError(400, "All fields are required");
    }

    
    const existingSuperAdmin = await User.findOne({
        role: "superAdmin",
        isSuperAdmin: true
    });

    if (existingSuperAdmin) {
        throw new ApiError(403, "Super Admin already exists. This operation can only be performed once.");
    }

    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "Username or Email already exists");
    }

    
    const superAdmin = await User.create({
        username,
        email,
        password, 
        fullName,
        role: "superAdmin",
        isSuperAdmin: true
    });

    // 5️⃣ Since password and refreshToken have select: false, 
    // they're already excluded from the response
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                superAdmin,
                "Super Admin created successfully"
            )
        );
});

export {
    loginUser,
    refreshAccessToken,
    logoutUser,
    createAdmin,
    createUser,
    forgotPassword,
    updateUserBySuperAdmin,
    changeCurrentPassword,
    createSuperAdmin
}