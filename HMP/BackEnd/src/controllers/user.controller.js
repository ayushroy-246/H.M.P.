import { AsyncHandler } from "../utilities/AsyncHandler.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Room } from "../models/room.model.js"
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
        req.user._id, {
        $set: {
            refreshToken: null
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
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

    const { username, fullName, email, password, mobile } = req.body

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
        mobile,
        role: "admin"
    })

    const createdUser = await User.findById(admin._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "Admin created successfully"
        )
    )
})

const createWarden = AsyncHandler(async (req, res) => {
    if (!["admin", "superAdmin"].includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized")
    }

    const {
        username,
        fullName,
        email,
        password,
        role,
        hostel,
        mobile
    } = req.body
    if (!username || !fullName || !email || !password || !role || !hostel) {
        throw new ApiError(400, "All fields are required")
    }

    if (role !== "warden") {
        throw new ApiError(400, "Invalid role");
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        throw new ApiError(409, "Warden already exists")
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        role,
        hostel,
        mobile
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "Warden is created successfully"
        )
    )
})

const createStudent = AsyncHandler(async (req, res) => {
    if (!["admin", "superAdmin"].includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized")
    }

    const {
        username,
        fullName,
        email,
        password,
        role,
        hostel,
        mobile,
        room
    } = req.body

    if (!username || !fullName || !email || !password || !role || !hostel || !room) {
        throw new ApiError(400, "All fields are required")
    }

    if (role !== "student") {
        throw new ApiError(400, "Invalid role");
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc || roomDoc.hostel.toString() !== hostel) {
        throw new ApiError(400, "Room does not belong to selected hostel");
    }

    const roomAssigned = await User.findOne({ room })
    if (roomAssigned) {
        throw new ApiError(409, "Room already assigned to another student")
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        throw new ApiError(409, "Student already exists")
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        role,
        hostel,
        mobile,
        room
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "Student is created successfully`"
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

    const { username, email, password, fullName, mobile } = req.body;


    if (!username || !email || !password || !fullName || !mobile) {
        throw new ApiError(400, "All fields are required");
    }


    const existingSuperAdmin = await User.findOne({
        role: "superAdmin",

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
        mobile,
        role: "superAdmin",

    });

    const createdUser = await User.findById(superAdmin._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "Super Admin created successfully"
            )
        );
});

const getAllUsersForAdmin = AsyncHandler(async (req, res) => {
    const { role, hostel, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // 1️⃣ role filter
    if (role) {
        query.role = role;
    }

    // 2️⃣ hostel filter
    if (hostel) {
        query.hostel = hostel;
    }

    // 3️⃣ search (username OR fullName)
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } }
        ];
    }

    const users = await User.find(query)
        .select("-password -refreshToken")
        .populate("hostel", "name code")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: 1 });

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total: totalUsers,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalUsers / limit),
            },
        })
    );
});

const getStudentsForWarden = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const matchStage = {
    role: "student",
    hostel: req.user.hostel,
  };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const pipeline = [
    { $match: matchStage },

    {
      $lookup: {
        from: "rooms",
        localField: "room",
        foreignField: "_id",
        as: "room",
      },
    },

    { $unwind: "$room" },

    { $sort: { "room.number": 1 } },

    { $skip: (page - 1) * limit },
    { $limit: Number(limit) },

    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ];

  const students = await User.aggregate(pipeline);

  // Count total
  const totalStudents = await User.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(200, {
      students,
      pagination: {
        total: totalStudents,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalStudents / limit),
      },
    })
  );
});

const getUserById = AsyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)
        .populate("hostel", "name code")
        .populate("room", "number")
        .select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Warden restriction
    if (
        req.user.role === "warden" &&
        user.hostel?._id.toString() !== req.user.hostel.toString()
    ) {
        throw new ApiError(403, "Unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User details fetched")
    )
})

const updateUserByAdmin = AsyncHandler(async (req, res) => {
    if (!["admin", "superAdmin"].includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized")
    }

    const { userId } = req.params

    const allowedUpdates = [
        "fullName",
        "email",
        "username",
        "mobile",
        "hostel",
        "room"
    ]

    const updates = {}

    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key]
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    )
        .populate("hostel", "name code")
        .populate("room", "number")
        .select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    )
})



export {
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
    getStudentsForWarden,
    getUserById,
    updateUserByAdmin
}