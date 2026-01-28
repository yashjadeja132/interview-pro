const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {
    console.log("changePassword controller hit");
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid current password" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ message: "Name and Email are required" });
        }

        // Check if email already exists (for other users)
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== userId) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name;
        user.email = email;
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    changePassword,
    updateProfile
};