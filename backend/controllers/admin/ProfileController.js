const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {
  console.log("changePassword controller hit");
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Check new and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ Prevent using the same password again
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
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
        user.phone = phone;
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
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