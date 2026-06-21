import { Notice } from "../models/notice.model.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { AsyncHandler } from "../utilities/AsyncHandler.js";

const getAllNotices = AsyncHandler(async (req, res) => {
    const notices = await Notice.find({
        hostel: req.user.hostel
    })
    .populate("issuedBy", "fullName")
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            notices,
            "Notices fetched successfully"
        )
    );
});

export { getAllNotices };