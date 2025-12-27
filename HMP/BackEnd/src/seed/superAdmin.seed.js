import { User } from "../models/user.model.js";

export const seedSuperAdmin = async () => {
    const exists = await User.findOne({ role: "superAdmin" });
    if (!exists) {
        await User.create({
            username: "superadmin",
            fullName: "Super Admin",
            email: "admin@college.com",
            password: "StrongPassword123",
            role: "superAdmin",
            isSuperAdmin: true
        });
        console.log("✅ Super Admin created");
    } else {
        console.log("⚠️ Super Admin already exists");
    }
};
export default seedSuperAdmin;